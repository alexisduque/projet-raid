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

    //add translations
    translate();

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
    //                                   HTML div id, options
    viewer= new Geoportal.Viewer.Default('viewerDiv', OpenLayers.Util.extend(
        options,
        // API keys configuration variable set by
        // <Geoportal.GeoRMHandler.getConfig>
        // variable contenant la configuration des clefs API remplie par
        // <Geoportal.GeoRMHandler.getConfig>
        window.gGEOPORTALRIGHTSMANAGEMENT===undefined? {'apiKey':'nhf8wztv3m9wglcda6n6cbuf'} : gGEOPORTALRIGHTSMANAGEMENT)
    );
    if (!viewer) {
        // problem ...
        OpenLayers.Console.error(OpenLayers.i18n('new.instance.failed'));
        return;
    }

    viewer.addGeoportalLayers([
        'ORTHOIMAGERY.ORTHOPHOTOS',
        'GEOGRAPHICALGRIDSYSTEMS.MAPS'],
        {
        });
    viewer.getMap().setCenter(viewer.viewerOptions.defaultCenter,viewer.viewerOptions.defaultZoom);
    // cache la patience - hide loading image
    viewer.div.style[OpenLayers.String.camelize('background-image')]= 'none';

    //Get hook for Geoportal.Control.LocationUtilityService.Geocode component
    //Récupération de l'ancre pour le contrôleur Geoportal.Control.LocationUtilityService.Geocode
    var tbx= viewer.getMap().getControlsByClass('Geoportal.Control.ToolBox')[0];

    var panel= new Geoportal.Control.Panel({
        div:OpenLayers.Util.getElement(tbx.id+'_search')//hook/anchor
    });

    var gazetteer= new Geoportal.Control.LocationUtilityService.Geocode(
        new Geoportal.Layer.OpenLS.Core.LocationUtilityService(
            'StreetAddress:OPENLS;Geocode',//layer name
            {
                maximumResponses:100,
                formatOptions: {
                },
                // define your own picto instead of default:
                styleMap:new OpenLayers.StyleMap({
                    "default": new OpenLayers.Style(
                        OpenLayers.Util.applyDefaults({
                            externalGraphic:"http://maps.gstatic.com/intl/fr_fr/mapfiles/ms/icons/blue-dot.png",
                            graphicOpacity:1.0,
                            pointRadius:16
                        },OpenLayers.Feature.Vector.style["default"])),
                    "select": new OpenLayers.Style(
                        OpenLayers.Util.applyDefaults({
                            externalGraphic:"http://maps.gstatic.com/intl/fr_fr/mapfiles/ms/icons/blue-dot.png",
                            graphicOpacity:1.0,
                            pointRadius:24
                        },OpenLayers.Feature.Vector.style["select"])),
                    "temporary": new OpenLayers.Style(
                        OpenLayers.Util.applyDefaults({
                            externalGraphic:"http://maps.gstatic.com/intl/fr_fr/mapfiles/ms/icons/blue-dot.png",
                            graphicOpacity:1.0,
                            pointRadius:16
                        },OpenLayers.Feature.Vector.style["temporary"]))
                })
            }
        ), {
            // force drawLocation
            drawLocation:true,
            // tooltip
            uiOptions:{title: 'gpControlLocationUtilityService.geocode.title'},
            // turn filters on
            //filtersOptions: {},
            // turn filters off
            filtersOptions: null,
            // turn auto-completion off => can use filters !
            autoCompleteOptions: null
            // turn auto-complete on => no filters
            //autoCompleteOptions: {}
        });
    panel.addControls([gazetteer]);
    viewer.getMap().addControls([panel]);
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
