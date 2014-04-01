/*
 * Copyright (c) 2008-2011 Institut Geographique National France, released under the
 * BSD license.
 */

 /**
 * Property: key
 *
 * The API key to use
 */
var APIkey= "nhf8wztv3m9wglcda6n6cbuf";

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
   
    // ----- Traduction
    translate();

    // ----- Options
    
    var options= {
        mode:'normal',
		territory:'FXX',
		proxy:'assets/proxy.php?url='
    };

    viewer= new Geoportal.Viewer.Default('viewerDiv', OpenLayers.Util.extend(
        options,
        // API keys configuration variable set by <Geoportal.GeoRMHandler.getConfig>
        // variable contenant la configuration des clefs API remplie par <Geoportal.GeoRMHandler.getConfig>
        window.gGEOPORTALRIGHTSMANAGEMENT===undefined? {'apiKey':APIkey} : gGEOPORTALRIGHTSMANAGEMENT)
    );
    if (!viewer) {
        // problem ...
        OpenLayers.Console.error(OpenLayers.i18n('new.instance.failed'));
        return;
    }
   
    // ----- Layers
    viewer.addGeoportalLayers(['ORTHOIMAGERY.ORTHOPHOTOS','GEOGRAPHICALGRIDSYSTEMS.MAPS']);	
    
    // ----- Autres
	viewer.getMap().setCenterAtLonLat(2.418611,48.842222,10);
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
    
    Geoportal.GeoRMHandler.getConfig([APIkey], null,null, {
        onContractsComplete: initMap
    });
}

// assign callback when "onload" event is fired
// assignation de la fonction à appeler lors de la levée de l'évènement "onload"
window.onload= loadAPI;
