const vault = new IIIFVault.Vault();

function getParam() {
    var qs = /iiif-content=(.*)/g.exec(window.location.search);
    if (qs == null) {
        return null;
    } else {
        return qs[1];
    }
}

function drag(ev) {
    var json = getAnnotation(osd);
    ev.dataTransfer.setData("annotation", json);
}

let loadedManifest = null;
let loadedCanvas = null;
let loadedImageUri = null;
let loadedAnnotation = null;

function share() {
    showShare(loadedAnnotation);
}

function showShare(annotation) {
    loadedAnnotation = annotation;
    let annoRegion = "";
    if (annotation.target.selector.value.indexOf(":") != -1) {
         annoRegion = annotation.target.selector.value.split(":")[1].split(",");
    } else {
         annoRegion = annotation.target.selector.value.split("=")[1].split(",");
    }
    let imageRegion = parseInt(annoRegion[0]) + "," + parseInt(annoRegion[1]) + "," + parseInt(annoRegion[2]) + "," + parseInt(annoRegion[3]);
    let size = "1024,"
    let previewURL = loadedImageUri + "/" + imageRegion + "/" + size + "/0/default.jpg";
        
    // Setup image download    
    let preview = document.getElementById('region_image');            
    preview.src = previewURL;

    let download_image = document.getElementById('download_image');
    download_image.href = previewURL;

    let url = document.getElementById('url_text');
    url.value = previewURL;
  
    let contentState = window.location.href.split('?')[0] + "?iiif-content=" + getContentState('xywh=' + imageRegion, annotation.body);
    let copyLink = document.getElementById('share_link');
    copyLink.href = contentState;

    let twitter = document.getElementById('twitter_link');

    linkBack = " see this image in context with IIIF Share it!";
    twitter.href = "https://twitter.com/intent/tweet?url=" + encodeURI(contentState) + "&hashtags=IIIF,IIIFShareIt&related=IIIF&text=" + encodeURI(annotation.body[0].value + linkBack);

    toggleDialog("share_dialog");
}

function closeDialog(event) {
    toggleDialog();
}

function dialogClick(event) {
    console.log('Dialog event');
}
function addClose(dialog) {
    dialog.addEventListener('click', function (event) {
        var rect = dialog.getBoundingClientRect();
        var isInDialog=(rect.top <= event.clientY && event.clientY <= rect.top + rect.height
          && rect.left <= event.clientX && event.clientX <= rect.left + rect.width);
        if (!isInDialog) {
            dialog.close();
        }
    });
}

function toggleDialog(dialogId) {
    let dialog = document.getElementById(dialogId);
    if (dialog.open) {
        dialog.close();
    } else {
        dialog.showModal();
        dialog.style.display = 'flex';

        addClose(dialog);
    }
}
let anno = null;

// Should really pass the canvas identifier here
function initalise(osd) {
     anno = OpenSeadragon.Annotorious(osd, {
        widgets: [ 
            'COMMENT',
        ],
        messages: {
            "Ok": "Share",
        }
    });
    anno.on('createAnnotation', function(annotation, overrideId) {
      console.log('Annotation created');
      setAnnoViewMode(anno, annotation);
        
      showShare(annotation);  
    });

    iiifContent = getParam();

    if (iiifContent == null) {
        let dialog = document.getElementById("OpenManifest");
        let openButton = document.getElementById("openButton");
        openButton.addEventListener('click', function() {
            let manifestURI = document.getElementById('url_text').value;
            dialog.close(manifestURI);
            dialog.style.display = 'none';
            window.location = window.location.href + "?iiif-content=" + manifestURI;
        });

        dialog.showModal();
        dialog.style.display = 'flex';
    }

    targetCanvas = getCanvas(iiifContent);
    region = getRegion(iiifContent);

    getManifest(iiifContent)
        .then(manifest => {    
            let canvas = null;
            if (targetCanvas == null) {
                canvas = vault.get({id: manifest.items[0].id, type: 'Canvas'});
            } else {
                canvas = vault.get({id: targetCanvas, type: 'Canvas'});
            }
            loadedCanvas = canvas.id;
            let infoJson = getInfoJsonURL(canvas);
            loadedImageUri = infoJson;
            if (region != null) {
                
                let annotation = { 
                    id: 'annotation_id',
                    type: 'Annotation',
                    target:  {
                        source: infoJson,
                        selector: {
                            conformsTo: "http://www.w3.org/TR/media-frags/",
                            type: "FragmentSelector",
                            value: "xywh=" + region.x + "," + region.y + "," + region.width + "," + region.height
                        }
                    }
                };

                contentState = decode(iiifContent);
                if ('body' in contentState) {
                    annotation.body = contentState.body;
                }

                anno.addAnnotation(annotation);
                loadedAnnotation = anno.getAnnotationById(annotation.id);
                setAnnoViewMode(anno, annotation);
                anno.selectAnnotation(annotation);

                osd.addHandler('open', function () {
                    var bounds = osd.viewport.imageToViewportRectangle(region.x, region.y, region.width, region.height);
                    osd.viewport.fitBounds(bounds, true);
                });
            }
            osd.addTiledImage({tileSource: infoJson});
        })
        .catch((error) => {
          console.error('Failed to load manifest:', error);
        });

}

function setAnnoViewMode(anno, annotation) {
    anno.readOnly = true;
    let controls = document.getElementById('buttons');
    controls.style.display = "flex";
    let newBtn = document.getElementById("new");

    regionSplit = annotation.target.selector.value.replace('xywh=pixel:','').split(',')
    newBtn.href = "index.html?iiif-content=" + getContentState(null, null);
}

function getInfoJsonURL(canvas) {
    let AnnoPageUri = canvas.items[0];
    let annotation = vault.get(AnnoPageUri).items[0];
    let body = vault.get(annotation).body[0];
    let imageResource = vault.get(body);

    return imageResource.service[0].id;
}


function getManifest(iiifContent) {
    if (isEncoded(iiifContent)) {
        // Its an encoded annotation
        contentState = decode(iiifContent);
        if (contentState.target.type === 'Manifest') {
            loadedManifest = contentState.target.id;
            return fetchManifest(contentState.target.id);
        } else if (contentState.target.type === 'Canvas') {
            loadedManifest = contentState.target.partOf[0].id;
            return fetchManifest(loadedManifest);
        } else {
            console.log("Couldn't parse content state " + contentState);
        }
    } else {
        loadedManifest = iiifContent;
        return fetchManifest(iiifContent);
    }
}

function getCanvas(iiifContent) {
    if (isEncoded(iiifContent)) {
        contentState = decode(iiifContent);
        if (contentState.target.type === 'Canvas') {
            if (contentState.target.id.indexOf("#") != -1) {
                loadedCanvas = contentState.target.id.split("#")[0];
            } else {
                loadedCanvas = contentState.target.id;
            }
            return loadedCanvas;
        } else {
            // Not sure what this is...
            return null;
        }
    } else {
        // This is just a plain manifest URL
        return null;
    }
}

function getContentState(region=null, body = null) {
    if (loadedCanvas == null) {
        return loadedManifest;
    } else {
        let canvasURI = loadedCanvas;
        if (region != null) {
            if (loadedCanvas.indexOf('#') != -1) {
                loadedCanvas = loadedCanvas.split("#")[0];
            }
            loadedCanvas += "#" + region;
        }
        contentState = {
            "@context": "http://iiif.io/api/presentation/3/context.json",
            "type": "Annotation",
            "motivation": ["contentState"],
            "target": {
               "id": loadedCanvas,
               "type": "Canvas",
               "partOf": [{
                  "id": loadedManifest,
                  "type": "Manifest"
               }]
            }
        }
        if (body != null) {
            contentState.body = body;
        }
        return encode(contentState);
    }
}

/**
 * Will return the region in the form:
 * { x: 1000, y: 2000, width: 1000, height: 2000 } if its been specified
 * otherwise returns null
 */
function getRegion(iiifContent) {
    if (isEncoded(iiifContent)) {
        contentState = decode(iiifContent);
        if (contentState.target.type === 'Canvas') {
            if (contentState.target.id.indexOf("#") != -1) {
                let regionStrSplit = contentState.target.id.split("#xywh=")[1].split(",");
                return {
                    x: parseInt(regionStrSplit[0]),
                    y: parseInt(regionStrSplit[1]),
                    width: parseInt(regionStrSplit[2]),
                    height: parseInt(regionStrSplit[3]),
                }
            } else {
                // No region specified
                return null;
            }
        } else {
            // Not sure what this is...
            return null;
        }
    } else {
        // This is just a plain manifest URL
        return null;
    }

}

function fetchManifest(manifestUri) {
    return vault.load(manifestUri);
}

function isEncoded(iiifContent) {
    return !iiifContent.startsWith('http');
}

function encode(contentStateJson) {
    let uriEncoded = encodeURIComponent(JSON.stringify(contentStateJson));  // using built in function
    let base64 = btoa(uriEncoded);                           // using built in function
    let base64url = base64.replace(/\+/g, "-").replace(/\//g, "_");
    let base64urlNoPadding = base64url.replace(/=/g, "");
    return base64urlNoPadding;
}


function decode(encodedContentState) {
    let base64url = restorePadding(encodedContentState);
    let base64 = base64url.replace(/-/g, '+').replace(/_/g, '/');
    let base64Decoded = atob(base64);                        // using built in function
    let uriDecoded = decodeURIComponent(base64Decoded);      // using built in function
    return JSON.parse(uriDecoded);
}


function restorePadding(s) {
    // The length of the restored string must be a multiple of 4
    let pad = s.length % 4;
    let padding = "";
    if (pad) {
        if (pad === 1) {
            throw new Error('InvalidLengthError: Input base64url string is the wrong length to determine padding');
        }
        s += '===='.slice(0, 4 - pad);
    }
    return s + padding;
}

