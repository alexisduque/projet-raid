/*
 * Copyright (c) 2008-2013 Institut National de l'information Geographique et forestiere France, released under the
 * BSD license.
 */
/**
 * Property: viewer
 * {<Geoportal.Viewer>} the viewer global instance.
 */
viewer= null;

/**
 * Function: initMap
 * Load the application. Called when all information have been loaded by
 * <loadAPI>().
 */
function initMap() {
    //The api is loaded at this step
    //L'api est chargée à cette étape

    //add translation
    translate();

    viewer= new Geoportal.Viewer.Default(
        "viewerDiv",
        OpenLayers.Util.extend({
            mode:'normal',
            territory:'FXX',
            // substitution of current default geoportal theme :
            loadTheme: function() {
                Geoportal.Util.setTheme('black');
                Geoportal.Util.loadCSS(Geoportal._getScriptLocation()+'theme/black/style.css','__GeoportalBlackCss__','');
                if (OpenLayers.Util.alphaHack()) {
                    Geoportal.Util.loadCSS(OpenLayers._getScriptLocation()+'theme/black/ie6-style.css','__IE6GeoportalBlackCss__','');
                }
            }
        }, window.gGEOPORTALRIGHTSMANAGEMENT===undefined? {apiKey:['nhf8wztv3m9wglcda6n6cbuf']}:gGEOPORTALRIGHTSMANAGEMENT)
    );
    if (!viewer) {
        OpenLayers.Console.error(OpenLayers.i18n('new.instance.failed'));
        return;
    }

    // add print control:
    var nv= viewer.getMap().getControlsByClass('Geoportal.Control.NavToolbar')[0];
    nv.addControls([new Geoportal.Control.PrintMap()]);

    viewer.addGeoportalLayers([
        'ORTHOIMAGERY.ORTHOPHOTOS',
        'GEOGRAPHICALGRIDSYSTEMS.MAPS'],
        {});
    viewer.getMap().setCenter(viewer.viewerOptions.defaultCenter,viewer.viewerOptions.defaultZoom);
    // cache la patience - hide loading image
    viewer.div.style[OpenLayers.String.camelize('background-image')]= 'none';
}

/**
 * Function: loadAPI
 * Load the configuration related with the API keys.
 * Called on "onload" event.
 * Call <initMap>() function to load the interface.
 */
function loadAPI() {
    // wait for all classes to be loaded
    // on attend que les classes soient chargées
    if (checkApiLoading('loadAPI();',['OpenLayers','Geoportal','Geoportal.Viewer','Geoportal.Viewer.Default'])===false) {
        return;
    }

    // load API keys configuration, then load the interface
    // on charge la configuration de la clef API, puis on charge l'application
    Geoportal.GeoRMHandler.getConfig(['nhf8wztv3m9wglcda6n6cbuf'], null,null, {
        onContractsComplete: initMap
    });
}

// assign callback when "onload" event is fired
// assignation de la fonction à appeler lors de la levée de l'évènement
// "onload"
window.onload= loadAPI;
