/*
 * Copyright (c) 2008-2013 Institut National de l'information Geographique et forestiere France, released under the
 * BSD license.
 */
/**
 * Property: map
 * {<OpenLayers.Map>} the viewer global instance.
 */
map= null;

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

    var layout= new YAHOO.widget.Layout({
        units: [
            {
                position: 'top',
                height: 40,
                body: 'top'
            },
            {
                position: 'right',
                header: OpenLayers.i18n('gpControlLayerSwitcher.label'),
                width: 160,
                resize: true,
                collapse: true,
                scroll: true,
                body: 'right',
                animate: true,
                gutter: '5px'
            },
            {
                position: 'left',
                header: OpenLayers.i18n('gpControlToolBox.label'),
                width: 80,
                body: 'left',
                gutter: '5px'
            },
            {
                position: 'center',
                body: 'viewerDiv'
            },
            {
                position: 'bottom',
                body: 'bottom',
                height: 50
            }
        ]});
    layout.render();

    function onButtonPan(p_oEvent) {
        map.controls[1].activate();
        if (document.getElementById('pushbutton1_deactive') != null) {
            document.getElementById('pushbutton1_deactive').id = "pushbutton1_active";
        }
        map.controls[2].deactivate();
        if (document.getElementById('pushbutton2_active') != null) {
            document.getElementById('pushbutton2_active').id = "pushbutton2_deactive";
        }
    }

    function onButtonZoom(p_oEvent) {
        map.controls[2].activate();
        if (document.getElementById('pushbutton2_deactive')) {
            document.getElementById('pushbutton2_deactive').id = "pushbutton2_active";
        }
        map.controls[1].deactivate();
        if (document.getElementById('pushbutton1_active') != null) {
            document.getElementById('pushbutton1_active').id = "pushbutton1_deactive";
        }
    }

    var oPushButton1 = new YAHOO.widget.Button("pushbutton1_active", {onclick: { fn: onButtonPan }});
    var oPushButton2 = new YAHOO.widget.Button("pushbutton2_deactive", {onclick: { fn: onButtonZoom }});

    var wm= new OpenLayers.Projection("EPSG:3857");
    map= new OpenLayers.Map('viewerDiv',{
            resolutions: Geoportal.Catalogue.RESOLUTIONS.slice(0),
            projection: wm,
            maxExtent: new OpenLayers.Bounds(-180, -90, 180, 90).transform(OpenLayers.Projection.CRS84,wm,true),
            units: wm.getUnits(),
            controls:[
                new OpenLayers.Control.PanZoomBar(),
                new OpenLayers.Control.Navigation(),
                new OpenLayers.Control.ZoomBox(),
                new OpenLayers.Control.ScaleLine(),
                new OpenLayers.Control.MousePosition(),
                new OpenLayers.Control.KeyboardDefaults(),
                new OpenLayers.Control.Attribution(),
                new Geoportal.Control.PermanentLogo(),
                new Geoportal.Control.TermsOfService()
            ]});

    var matrixIds3857= new Array(22);
    for (var i= 0; i<22; i++) {
        matrixIds3857[i]= {
            identifier    : "" + i,
            topLeftCorner : new OpenLayers.LonLat(-20037508,20037508)
        };
    }
    var l0= new Geoportal.Layer.WMTS(
        OpenLayers.i18n('ORTHOIMAGERY.ORTHOPHOTOS'),
        gGEOPORTALRIGHTSMANAGEMENT[gGEOPORTALRIGHTSMANAGEMENT.apiKey]
            .resources['ORTHOIMAGERY.ORTHOPHOTOS:WMTS'].url,
        {
            layer: 'ORTHOIMAGERY.ORTHOPHOTOS',
            style: 'normal',
            matrixSet: "PM",
            matrixIds: matrixIds3857,
            format:'image/jpeg',
            exceptions:"text/xml"
        },
        {
            tileOrigin: new OpenLayers.LonLat(0,0),
            isBaseLayer: true,
            resolutions: Geoportal.Catalogue.RESOLUTIONS.slice(0,5),
            opacity : 1.0,
            projection: wm,
            maxExtent: new OpenLayers.Bounds(-180, -90, 180, 90).transform(OpenLayers.Projection.CRS84,wm, true),
            units: wm.getUnits(),
            attribution: 'provided by IGN'
        }
    );
    map.addLayers([l0]);
    document.getElementById("right").innerHTML = "<input type='radio' checked='true' >"+l0.name+"</input>";

    var lonlat= new OpenLayers.LonLat(410925.30,5786910.61);
    map.setCenter(lonlat,3);
    // cache la patience - hide loading image
    map.div.style[OpenLayers.String.camelize('background-image')]= 'none';

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
