---
layout: page
title: About 
---

# IIIF Share it

I was inspired to write IIIF Share it by [Josh Hadro](https://twitter.com/Hadro) my colleague at [IIIF](https://iiif.io). Josh and I were discussing the release of the James Webb Space Telescope images and wondering whether we could make them available as they were published as IIIF. IIIF is a way of sharing images in a way which means they are interoperable and can be used in many different tools. 

## Intro to IIIF

IIIF provides two standards:

 * [IIIF Image API](https://iiif.io/api/image/3.0/) - for making zoomable images available 
 * [IIIF Presentation API](https://iiif.io/api/presentation/3.0/) - for adding metadata about these images to create a package which can be used in different IIIF compatible tools. 

Using the [Serverless-iiif](https://github.com/samvera-labs/serverless-iiif) tool I was able to make one of the NASA images available here:

[https://iiif.gdmrdigital.com/image/iiif/2/nasa%2Fwebb%2Fwebb1/full/1024,/0/default.jpg](https://iiif.gdmrdigital.com/image/iiif/2/nasa%2Fwebb%2Fwebb1/full/1024,/0/default.jpg)

I could then incorporate this image in a IIIF Manifest using the [Bodleian Manifest Editor](https://digital.bodleian.ox.ac.uk/manifest-editor/#/?_k=4sdidx) which is a graphical way to combine images and enter metadata to create a IIIF manifest. Once I had a Manifest I needed to upload it somewhere so it was public and I used a tool we have developed for the [IIIF Training course](https://training.iiif.io/iiif-online-workshop/index.html) called [IIIF Workbench](https://workbench.gdmrdigital.com). This will upload a Manifest and store it in GitHub which can then host the JSON files using its GitHub Pages feature. 

Once you have a Manifest you can then see the power of IIIF by opening up this manifest in multiples tools and viewers:

 * [Universal Viewer](https://uv-v4.netlify.app/#?manifest=https://iiif-test.github.io/Space/manifests/webb1.json) - a IIIF viewer showing the zoomable image with metatadata.
 * [Mirador](https://projectmirador.org/embed/?iiif-content=https://iiif-test.github.io/Space/manifests/webb1.json) - a annotation capable, side by side IIIF viewer 
 * [Slow looking from Cogapp](https://slowlooking.cogapp.com/?image=https://iiif.gdmrdigital.com/image/iiif/2/nasa%2Fwebb%2Fwebb1) - a viewer that will gently zoom around a IIIF image so you can take time to appreciate the image and let the computer do the navigation. 
 * [Exhibit.so](https://exhibit.so/exhibits/create?item=https://iiif-test.github.io/Space/manifests/webb1.json) - a way of creating a story by guiding the viewer through an image or collection of images. 

There are many more compatible IIIF tools available on the [IIIF Awesome list](https://github.com/IIIF/awesome-iiif) including crowdsourcing options. 

## The Share it tool

One tool that isn't available as far as I'm aware is a tool that can allow you to capture a region of an image and then share it with a link back to the region in context. There are many tools to extract a region of a IIIF Image including:

 * [John Howard's UCD Cropping tool](https://jbhoward-dublin.github.io/IIIF-imageManipulation/index.html?imageID=https://iiif.gdmrdigital.com/image/iiif/2/nasa%2Fwebb%2Fwebb1)
 * [NCSU Cropping Tool](https://ncsu-libraries.github.io/iiif-crop-tool/?newUrl=https%3A%2F%2Fiiif.gdmrdigital.com%2Fimage%2Fiiif%2F2%2Fnasa%252Fwebb%252Fwebb1)

but not a tool that will give you the image in context. Luckily this use case has a long history in IIIF and there is a standard available for this called [IIIF Content State](https://iiif.io/api/content-state/1.0/). Content state is all about creating a interoperable JSON document that will allow you to identify a region in a image and pass this 'state' to another viewer. In theory you could use the share it tool to generate your content state and open it in a completely separate viewer but at this time Content State has only recently been released so there aren't many compatible viewers yet.  

So before someone else implements this I wanted to create a tool where you could identify a region of a image and then share a URL with someone else so they can see the part of the image you are looking at. 

The Share it tool uses many different IIIF libraries developed by the community and these include:

 * [OpenSeadragon](https://openseadragon.github.io/) - this provides the zoomable viewer
 * [Annotorious](https://recogito.github.io/annotorious/) - this provides the annotation and box drawing functionality 
 * [IIIF Vault](https://github.com/IIIF-Commons/vault) - this is a IIIF Presentation JavaScript library which can normalize v2 or v3 manifests so that you only need to write your code once. 

This tool also used the following generic web tools:

 * [Font-awsome](https://fontawesome.com/) - for icons
 * [CSS Handbook](https://www.freecodecamp.org/news/the-css-handbook-a-handy-guide-to-css-for-developers-b56695917d11/) - an excellent guide to CSS which has long been a mystery to me.
