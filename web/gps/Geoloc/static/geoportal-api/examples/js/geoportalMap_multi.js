/*
 * Copyright (c) 2008-2013 Institut National de l'information Geographique et forestiere France, released under the
 * BSD license.
 */
/**
 * Property: viewer1
 * {<Geoportal.Viewer>} the viewer one global instance.
 */
viewer1= null;
/**
 * Property: viewer2
 * {<Geoportal.Viewer>} the viewer two global instance.
 */
viewer2= null;

var e1= null;
var e2= null;

function loadGUI1() {
    //options for creating viewer:
    var options= {
        // default value
        // valeur par défaut
        //mode:'normal',
        // default value
        // valeur par défaut
        //territory:'FXX',
        // default value
        // valeur par défaut
        //displayProjection:'IGNF:RGF93G'
        // only usefull when loading external resources
        // utile uniquement pour charger des resources externes */
        //proxy:'/geoportail/api/xmlproxy'+'?url='
    };

    // viewer creation of type <Geoportal.Viewer>
    // création du visualiseur du type <Geoportal.Viewer>
    //                                     HTML div id, options
    viewer1= new Geoportal.Viewer.Default('viewer1Div', OpenLayers.Util.extend(
        options,
        // API keys configuration variable set by
        // <Geoportal.GeoRMHandler.getConfig>
        // variable contenant la configuration des clefs API remplie par
        // <Geoportal.GeoRMHandler.getConfig>
        window.gGEOPORTALRIGHTSMANAGEMENT===undefined? {'apiKey':'nhf8wztv3m9wglcda6n6cbuf'} : gGEOPORTALRIGHTSMANAGEMENT)
    );
    if (!viewer1) {
        // problem ...
        OpenLayers.Console.error(OpenLayers.i18n('new.instance.failed'));
        return;
    }

    viewer1.addGeoportalLayers([
        'ORTHOIMAGERY.ORTHOPHOTOS',
        'GEOGRAPHICALGRIDSYSTEMS.MAPS'],
        {});
    viewer1.getMap().setCenter(viewer1.viewerOptions.defaultCenter,viewer1.viewerOptions.defaultZoom);
    // cache la patience - hide loading image
    viewer1.div.style[OpenLayers.String.camelize('background-image')]= 'none';
}

function loadGUI2() {
    //options for creating viewer:
    var options= {
        // default value
        // valeur par défaut
        //mode:'normal',
        // default value
        // valeur par défaut
        territory:'MTQ'//,
        // default value
        // valeur par défaut
        //displayProjection:'IGNF:RGF93G'
        // only usefull when loading external resources
        // utile uniquement pour charger des resources externes */
        //proxy:'/geoportail/api/xmlproxy'+'?url='
    };

    // viewer creation of type <Geoportal.Viewer>
    // création du visualiseur du type <Geoportal.Viewer>
    //                                       HTML div id, options
    viewer2= new Geoportal.Viewer.Default('viewer2Div', OpenLayers.Util.extend(
        options,
        // API keys configuration variable set by
        // <Geoportal.GeoRMHandler.getConfig>
        // variable contenant la configuration des clefs API remplie par
        // <Geoportal.GeoRMHandler.getConfig>
        window.gGEOPORTALRIGHTSMANAGEMENT===undefined? {'apiKey':'707950361504526574'} : gGEOPORTALRIGHTSMANAGEMENT)
    );
    if (!viewer2) {
        // problem ...
        OpenLayers.Console.error(OpenLayers.i18n('new.instance.failed'));
        return;
    }

    viewer2.addGeoportalLayers([
        'ORTHOIMAGERY.ORTHOPHOTOS',
        'GEOGRAPHICALGRIDSYSTEMS.MAPS'],
        {});
    viewer2.getMap().setCenter(viewer2.viewerOptions.defaultCenter,viewer2.viewerOptions.defaultZoom);
    // cache la patience - hide loading image
    viewer2.div.style[OpenLayers.String.camelize('background-image')]= 'none';
}

/**
 * Function: initMap
 * Load the application. Called when all information have been loaded by
 * <loadAPI>().
 */
function initMap() {
    //The api is loaded at this step
    //L'api est chargée à cette étape

    // add translations
    translate(['gpVisibility'],['viewer1','viewer2']);

    e1= OpenLayers.Util.getElement('viewer1Div');
    e2= OpenLayers.Util.getElement('viewer2Div');
    OpenLayers.Util.getElement('gpVisibility').onclick= function() {
        if (e1.style.visibility=='hidden') {
            e1.style.visibility= '';
            e2.style.visibility= 'hidden';
        } else {
            e1.style.visibility= 'hidden';
            e2.style.visibility= '';
            if (viewer2==null) {
                loadGUI2();
            }
        }
        this.blur();
    };

    loadGUI1();
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
    Geoportal.GeoRMHandler.getConfig(['nhf8wztv3m9wglcda6n6cbuf','707950361504526574'], null,null, {
        onContractsComplete: initMap
    });
}

// assign callback when "onload" event is fired
// assignation de la fonction à appeler lors de la levée de l'évènement
// "onload"
window.onload= loadAPI;
