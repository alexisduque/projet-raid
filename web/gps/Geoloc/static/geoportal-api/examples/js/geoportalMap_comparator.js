/*
 * Copyright (c) 2008-2013 Institut National de l'information Geographique et forestiere France, released under the
 * BSD license.
 */
var nbCartes= 2;

var viewers= [];
var mrks= [];
var curs= [];
var mps= [];

var moving= false;
var movestarted= false;

/**
 * Function: moveStart
 */
function moveStart(evt) {
    movestarted= true;
    for (var i= 0, l= mrks.length; i<l; i++) {
        mrks[i].setVisibility(false);
    }
}

/**
 * Function: moveEnd
 */
function moveEnd(evt) {
    if (moving) { return; }
    moving= true;
    for (var i= 0, l= viewers.length; i<l; i++) {
        if (this===viewers[i].getMap()) {
            continue;
        }
        viewers[i].getMap().setCenter(this.getCenter().transform(this.getProjection(),viewers[i].getMap().getProjection()), this.getZoom());
        mrks[i].setVisibility(true);
    }
    moving= false;
    movestarted= false;
}

/**
 * Function: mouseMove
 */
function mouseMove(evt) {
    for (var i= 0, l= viewers.length; i<l; i++) {
        if (this===viewers[i].getMap()) {
            continue;
        }
        // maps' div have same size !
        curs[i].moveTo(this.getLayerPxFromViewPortPx(evt.xy));
        mps[i].redraw(evt);
    }
}

/**
 * Function: mouseOver
 */
function mouseOver(evt) {
    if (movestarted) { return; }
    for (var i= 0, l= viewers.length; i<l; i++) {
        if (this===viewers[i].getMap()) {
            continue;
        }
        mrks[i].setVisibility(true);
    }
}

/**
 * Function: mouseOut
 */
function mouseOut(evt) {
    for (var i= 0, l= mrks.length; i<l; i++) {
        mrks[i].setVisibility(false);
    }
}

/**
 * Function: loadCarte1
 */
function loadCarte1() {
    var v1= new Geoportal.Viewer.Default("v1",OpenLayers.Util.extend({
            mode:'normal',
            territory:'FXX',
            displayProjection:['IGNF:ETRS89LCC','IGNF:ETRS89LAEA','IGNF:RGF93G','IGNF:LAMB93'],
            nameInstance:'v1',
            minZoomLevel: 9,
            maxZoomLevel:17,
            controlsOptions:{
                logoSize:30
            }
        },
        gGEOPORTALRIGHTSMANAGEMENT          // API configuration with regard to the API key
        )
    );
    viewers.push(v1);
    v1.addGeoportalLayers([
        'ORTHOIMAGERY.ORTHOPHOTOS'
    ],
    {
    });
    v1.getMap().setCenter(v1.viewerOptions.defaultCenter,v1.viewerOptions.defaultZoom);
    v1.setLayersPanelVisibility(false);
    v1.openToolsPanel(false);

    var mrk= new OpenLayers.Layer.Markers("Curseur",{displayInLayerSwitcher:false});
    v1.getMap().addLayer(mrk);
    mrks.push(mrk);
    var cur= new OpenLayers.Marker(
        v1.getMap().getCenter(),
        new OpenLayers.Icon("./img/geoportail-xy-pointer.gif",
                            new OpenLayers.Size(20,20),
                            new OpenLayers.Pixel(-10,-10)));
    mrk.setVisibility(false);
    mrk.addMarker(cur);
    curs.push(cur);

    v1.getMap().events.register("movestart",null,moveStart);
    v1.getMap().events.register("moveend",null,moveEnd);
    v1.getMap().events.register("mousemove",null,mouseMove);
    v1.getMap().events.register("mouseover",null,mouseOver);
    v1.getMap().events.register("mouseout",null,mouseOut);
    mps.push(v1.getMap().getControlsByClass('Geoportal.Control.MousePosition')[0]);
    // cache la patience - hide loading image
    v1.div.style[OpenLayers.String.camelize('background-image')]= 'none';
}

/**
 * Function: loadCarte1
 */
function loadCarte0() {
    var v0= new Geoportal.Viewer.Default("v0",OpenLayers.Util.extend({
            mode:'normal',
            territory:'FXX',
            displayProjection:['IGNF:LAMB93','IGNF:RGF93G','IGNF:ETRS89LCC','IGNF:ETRS89LAEA'],
            nameInstance:'v0',
            minZoomLevel: 9,
            maxZoomLevel:17,
            controlsOptions:{
                logoSize:30
            }
        },
        gGEOPORTALRIGHTSMANAGEMENT          // API configuration with regard to the API key
        )
    );
    viewers.push(v0);
    v0.addGeoportalLayers([
        'ORTHOIMAGERY.ORTHOPHOTOS2000-2005'
    ],
    {
        'ORTHOIMAGERY.ORTHOPHOTOS2000-2005':{
            visibility:true,
            opacity:1.0
        }
    });
    v0.getMap().setCenter(v0.viewerOptions.defaultCenter,v0.viewerOptions.defaultZoom);
    v0.setLayersPanelVisibility(false);
    v0.openToolsPanel(false);

    var mrk= new OpenLayers.Layer.Markers("Curseur",{displayInLayerSwitcher:false});
    v0.getMap().addLayer(mrk);
    mrks.push(mrk);
    var cur= new OpenLayers.Marker(
        v0.getMap().getCenter(),
        new OpenLayers.Icon("./img/geoportail-xy-pointer.gif",
                            new OpenLayers.Size(20,20),
                            new OpenLayers.Pixel(-10,-10)));
    mrk.setVisibility(false);
    mrk.addMarker(cur);
    curs.push(cur);

    v0.getMap().events.register("movestart",null,moveStart);
    v0.getMap().events.register("moveend",null,moveEnd);
    v0.getMap().events.register("mousemove",null,mouseMove);
    v0.getMap().events.register("mouseover",null,mouseOver);
    v0.getMap().events.register("mouseout",null,mouseOut);
    mps.push(v0.getMap().getControlsByClass('Geoportal.Control.MousePosition')[0]);
    // cache la patience - hide loading image
    v0.div.style[OpenLayers.String.camelize('background-image')]= 'none';
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
    var vwrs= [];
    for (var i= 0, l= nbCartes; i<l; i++) {
        vwrs.push('viewers['+i+']');
    }
    translate(null,vwrs);

    //load views:
    for (var i= 0, l= nbCartes; i<l; i++) {
        var f= "loadCarte"+i+"()";
        eval(f);
    }
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
