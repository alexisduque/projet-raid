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
            mode:'normal',
            territory:'FXX',
            // constrain zooms to RGE scales:
            minZoomLevel:13,
            maxZoomLevel:20,
            // substitution of current default geoportal theme :
            loadTheme: function() {
                Geoportal.Util.setTheme('black');
                Geoportal.Util.loadCSS(Geoportal._getScriptLocation()+'theme/black/style.css','__GeoportalBlackCss__','');
                if (OpenLayers.Util.alphaHack()) {
                    Geoportal.Util.loadCSS(OpenLayers._getScriptLocation()+'theme/black/ie6-style.css','__IE6GeoportalBlackCss__','');
                }
            },
            proxy:'/geoportail/api/xmlproxy'+'?url='
        }, window.gGEOPORTALRIGHTSMANAGEMENT===undefined? {apiKey:['nhf8wztv3m9wglcda6n6cbuf']}:gGEOPORTALRIGHTSMANAGEMENT)
    );
    if (!viewer) {
        OpenLayers.Console.error(OpenLayers.i18n('new.instance.failed'));
        return;
    }

    // BD ORTHO:
    viewer.addGeoportalLayers([
        'ORTHOIMAGERY.ORTHOPHOTOS'
    ],{
        'ORTHOIMAGERY.ORTHOPHOTOS':{
            title:'BD ORTHO®',
            visibility: true,
            minZoomLevel:13,
            maxZoomLevel:19 //high resolution ortho-imagery (not everywhere)
        }
    });

    // BD TOPO:
    var lyrs= [
        'ADMINISTRATIVEUNITS.BOUNDARIES',
        'BUILDINGS.BUILDINGS',
        'HYDROGRAPHY.HYDROGRAPHY',
        'TRANSPORTNETWORKS.RAILWAYS',
        'TRANSPORTNETWORKS.ROADS',
        'TRANSPORTNETWORKS.RUNWAYS',
        'UTILITYANDGOVERNMENTALSERVICES.ALL'
    ];
    var bdtopoLayers= [];
    for (var i= 0, l= lyrs.length, n= viewer.getMap().layers.length; i<l; i++) {
        var lyrId= lyrs[i];
        viewer.addGeoportalLayer(lyrId,{
            displayInLayerSwitcher:false,
            visibility:false
        });
        if (viewer.getMap().layers.length>n) {//layer added (belongs to contract's key):
            n= viewer.getMap().layers.length;
            bdtopoLayers.push(viewer.getMap().layers[n-1]);
        }
    }
    var bdtopo= new Geoportal.Layer.Aggregate(
        'BD TOPO®',
        bdtopoLayers,
        {
            visibility: true,
            opacity:0.70,
            minZoomLevel:15,
            maxZoomLevel:17,
            description:'BDTOPO.description'
        }
    );
    viewer.getMap().addLayer(bdtopo);

    // BD ADRESSE (kind of):
    viewer.addGeoportalLayers([
        'GEOGRAPHICALGRIDSYSTEMS.MAPS'
    ],{
        'GEOGRAPHICALGRIDSYSTEMS.MAPS':{
            title:'BD ADRESSE®',
            opacity:0.5,
            minZoomLevel:18,
            maxZoomLevel:18
        }
    });

    // BD PARCELLAIRE:
    viewer.addGeoportalLayers([
        'CADASTRALPARCELS.PARCELS'
    ],{
        'CADASTRALPARCELS.PARCELS':{
            title:'BD PARCELLAIRE®',
            visibility: true,
            minZoomLevel:18,
            maxZoomLevel:20
        }
    });

    // BD TOPO (BD NYME), BD ADRESSE (search engines):
    var tbx= viewer.getMap().getControlsByClass('Geoportal.Control.ToolBox')[0];
    var searchbar= new Geoportal.Control.SearchToolbar(
        {
            div: OpenLayers.Util.getElement(tbx.id+'_search'),
            geonamesOptions: {
                setZoom: Geoportal.Control.LocationUtilityService.GeoNames.setZoomForBDNyme,
                layerOptions: {
                    name: 'PositionOfInterest:OPENLS;Geocode',
                    maximumResponses:100,
                    formatOptions: {
                    }
                }
            },
            geocodeOptions: {
                layerOptions: {
                    name: 'StreetAddress:OPENLS;Geocode',
                    maximumResponses:100,
                    formatOptions: {
                    }
                },
                matchTypes: [
                    {re:/city/i,     src:Geoportal.Util.getImagesLocation()+'OLScity.gif'},
                    {re:/street$/i,  src:Geoportal.Util.getImagesLocation()+'OLSstreet.gif'},
                    {re:/number/i,   src:Geoportal.Util.getImagesLocation()+'OLSstreetnumber.gif'},
                    {re:/enhanced/i, src:Geoportal.Util.getImagesLocation()+'OLSstreetenhanced.gif'},
                    {re:null,        src:Geoportal.Util.getImagesLocation()+'OLSstreet.gif'}
                ]
            }
        }
    );
    viewer.getMap().addControl(searchbar);

    // add print control:
    var nv= viewer.getMap().getControlsByClass('Geoportal.Control.NavToolbar')[0];
    nv.addControls([new Geoportal.Control.PrintMap()]);

    viewer.getMap().setCenter(viewer.viewerOptions.defaultCenter,13);
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
