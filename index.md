---
layout: frontpage
title: IIIF Share it!
---
<p>Use the viewer below to zoom into a part of the image you would like to share. Then hold down SHIFT and drag your mouse to create a box. Then add some text and click share.</p>
<div id="buttons" style="display:none">
    <a id="new" class="button">New</a>
    <button id="share"  onclick="share();">Share</button>
    <button id="change"  onclick="toggleDialog('share_dialog');">Change image</button>
</div>
<div id="osd"></div> 
{% include openManifestDialog.html %}
<script type="text/javascript">
    const osd = OpenSeadragon({
            id:                 "osd",
            prefixUrl:          "openseadragon-bin-3.1.0/images/",
            preserveViewport:   true,
            visibilityRatio:    1,
            sequenceMode:       true
        });
    
    initalise(osd);
    document.getElementById("osd").focus();
</script>
{% include shareDialog.html %}

