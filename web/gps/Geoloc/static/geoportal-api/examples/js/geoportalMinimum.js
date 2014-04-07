/*
 * Copyright (c) 2008-2013 Institut National de l'information Geographique et forestiere France, released under the
 * BSD license.
 */
var map= null;

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

    // ETRS89 geographic - plate-carree base map :
    var epsg4258= new OpenLayers.Projection("EPSG:4258");
    map= new OpenLayers.Map('viewerDiv', OpenLayers.Util.extend({
        // overwrite OL defaults :
        maxResolution: 1.40625,
        numZoomLevels: 21,
        projection: epsg4258,
        units: epsg4258.getUnits(),
        maxExtent: new OpenLayers.Bounds(-180, -90, 180, 90),
        // add controls :
        controls:[
            new OpenLayers.Control.PanZoomBar(),
            new OpenLayers.Control.NavToolbar(),
            new OpenLayers.Control.LayerSwitcher({'ascending':false}),
            new OpenLayers.Control.ScaleLine(),
            new OpenLayers.Control.MousePosition(),
            new OpenLayers.Control.KeyboardDefaults(),
            new OpenLayers.Control.Attribution(),
            new Geoportal.Control.PermanentLogo(),
            new Geoportal.Control.TermsOfService()
        ]},
        // add IGN's GeoRM :
        gGEOPORTALRIGHTSMANAGEMENT));
    // get IGNF's catalogue :
    var cat= new Geoportal.Catalogue(map,gGEOPORTALRIGHTSMANAGEMENT);
    // prepare CRS :
    var zon= cat.getTerritory('EUE');

    // fake ETRS89 base layer :
/*
    map.addLayers([
        new OpenLayers.Layer.WMS(
            'OpenStreetMap',
            'http://maps.opengeo.org/geowebcache/service/wms',
            {
                layers:'openstreetmap',
                format:'image/jpeg'
            },
            {
                projection: new OpenLayers.Projection('EPSG:4326'),
                units: 'degrees',
                maxResolution: 1.40625,
                numZoomLevels: 21,
                maxExtent: new OpenLayers.Bounds(-180, -90, 180, 90),
                minZoomLevel:5,
                maxZoomLevel:20,
                territory:'EUE'
            })
    ]);
 */
    map.addLayers([
        new OpenLayers.Layer(
            '__PlateCarre__',
            {
                isBaseLayer: true,
                displayInLayerSwitcher: false,
                projection: new OpenLayers.Projection('EPSG:4326'),
                units: 'degrees',
                maxResolution: 1.40625,
                maxExtent: new OpenLayers.Bounds(-180, -90, 180, 90),
                minZoomLevel:5,
                maxZoomLevel:18,
                territory:'EUE'
            })]);

    // get Geoportail layer's parameters :
    var europeanMapOpts= cat.getLayerParameters(zon, 'GEOGRAPHICALGRIDSYSTEMS.MAPS');
    // overwrite some :
    europeanMapOpts.options.opacity= 1.0;
    // build map :
    var europeanMap= new europeanMapOpts.classLayer(
        OpenLayers.i18n(europeanMapOpts.options.name),
        europeanMapOpts.url,
        europeanMapOpts.params,
        europeanMapOpts.options);
    // reproject maxExtent (Geoportal's API standard and extended do it automagically :
    europeanMapOpts.options.maxExtent.transform(europeanMapOpts.options.projection, map.getProjection(), true);
    // add it to the map :
    map.addLayers([europeanMap]);

    // center map (otherwise : centered at (0,0), zoom 0 :)
    map.setCenter(new OpenLayers.LonLat(2.345274398,48.860832558),7);
    // cache la patience - hide loading image
    map.div.style[OpenLayers.String.camelize('background-image')]= 'none';
    // activate navigation control :
    var ntb= map.getControlsByClass('OpenLayers.Control.NavToolbar')[0];
    ntb.activateControl(ntb.controls[0]);
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
    if (checkApiLoading('loadAPI();',['OpenLayers','Geoportal'])===false) {
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
