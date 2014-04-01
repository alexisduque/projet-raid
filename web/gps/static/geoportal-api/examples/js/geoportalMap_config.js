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

    // add translations
    translate();

    viewer= new Geoportal.Viewer.Default(
        "viewerDiv",
        OpenLayers.Util.extend({
            mode:"normal",
            territory:'FXX',
            displayProjection:['IGNF:RGF93G', 'IGNF:ETRS89LCC'],
            controlsOptions:{
                logoSize:30
            }
        },
        window.gGEOPORTALRIGHTSMANAGEMENT===undefined? {apiKey:['nhf8wztv3m9wglcda6n6cbuf']}:gGEOPORTALRIGHTSMANAGEMENT)
    );
    viewer.setLayersPanelVisibility(false);
    // let's disable mouse wheel :
    var c= viewer.getMap().getControlsByClass('OpenLayers.Control.Navigation');
    if (c.length>0) {
        c= c[0];
        c.deactivate();
        c.zoomWheelEnabled= false;
        c.activate();
    }
    // hide navigation control (pan and zoom box) :
    c= viewer.getMap().getControlsByClass('Geoportal.Control.NavToolbar');
    if (c.length>0) {
        c= c[0];
        c.div.style.display= 'none';
    }
    // change label on toolbox :
    c= viewer.getMap().getControlsByClass('Geoportal.Control.ToolBox');
    if (c.length>0) {
        c= c[0];
        Geoportal.Lang['de']['gpControlToolBox.label']= 'Ebenen';
        Geoportal.Lang['en']['gpControlToolBox.label']= 'Levels';
        Geoportal.Lang['es']['gpControlToolBox.label']= 'Los niveles de';
        Geoportal.Lang['fr']['gpControlToolBox.label']= 'Niveaux';
        Geoportal.Lang['it']['gpControlToolBox.label']= 'Livelli';
        c.changeLang();
    }
    c= null;
    viewer.addGeoportalLayers(['GEOGRAPHICALGRIDSYSTEMS.MAPS'],
            {'GEOGRAPHICALGRIDSYSTEMS.MAPS':{opacity:1.0}});
    viewer.getMap().setCenterAtLonLat("5d21'13,62161E","43°16'43.56108 N",8);
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
