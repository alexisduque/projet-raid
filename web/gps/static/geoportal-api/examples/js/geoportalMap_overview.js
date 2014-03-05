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
 * Function: getGeoportalLayer
 * Build a Geoportal's layer.
 *
 * Parameters:
 * territory - {String} one of the Geoportal's territory.
 * name - {String} Geoportal's layer standard name.
 * base - {Boolean} base layer ?
 *
 * Returns:
 * {<OpenLayers.Layer>} the ready to use Geoportal's layer.
 */
function getGeoportalLayer ( territory, name, base ) {
    var lyrPrms= viewer.getMap().catalogue.getLayerParameters(territory, name);
    lyrPrms.options.territory= territory;
    lyrPrms.options.isBaseLayer= base;
    lyrPrms.options.opacity= 1.0;
    lyrPrms.options.afterAdd= function() {// add GeoRM :
        var k= viewer.getMap().catalogue.getLayerGeoRMKey(this.territory,this.name);
        if (k!=null) {
            this.GeoRM= Geoportal.GeoRMHandler.addKey(
                k,
                viewer.getMap().catalogue[k].tokenServer.url,
                viewer.getMap().catalogue[k].tokenServer.ttl,
                this.map);//the overview map !
        }
    };
    if (!base) {
        lyrPrms.options.buffer= 0;
    }
    var lyr= new lyrPrms.classLayer(
        lyrPrms.options.name,
        lyrPrms.url,
        lyrPrms.params,
        lyrPrms.options);
    return lyr;
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
    //                                       HTML div id, options
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
        {});

    // Minimize coordinates panel :
    (viewer.getMap().getControlsByClass('Geoportal.Control.Information')[0]).minimizeControl();

    // Build overview layer from Geoportal world's map layer :
    var worldMap= getGeoportalLayer('WLD','GEOGRAPHICALGRIDSYSTEMS.MAPS',true);
    var tbx= viewer.getMap().getControlsByClass('Geoportal.Control.ToolBox')[0];
    var ovmap= new Geoportal.Control.OverviewMap({
        div:OpenLayers.Util.getElement(tbx.id+'_ovmap'),
        size: new OpenLayers.Size(72,54),
        layers:[worldMap],
        mapOptions:{
            resolutions:worldMap.options.nativeResolutions.slice(0,5),  // get resolutions from worldMap
            numZoomLevels:5,
            minZoomLevel:worldMap.options.minZoomLevel,
            maxZoomLevel:worldMap.options.maxZoomLevel,
            projection:worldMap.options.projection.clone(),
            maxExtent:worldMap.options.maxExtent,
            theme:null // prevent OL to insert style.css !
        }
    });
    viewer.getMap().addControl(ovmap);
    // Graticules :
    viewer.getMap().addControl(
        new OpenLayers.Control.Graticule({
            displayInLayerSwitcher:false,
            visible: true,
            labelled: true,
            labelFormat: 'dms',
            labelSymbolizer: {              //OpenLayers.Control.Graticule defaults :
                stroke: false,
                fill: false,
                label: "${label}",
                labelAlign: "${labelAlign}",
                labelXOffset: "${xOffset}",
                labelYOffset: "${yOffset}", // overwritten options :
                fontColor: '#000000',
                fontFamily: 'Arial,Helvetica,sans-serif',
                fontSize: '10px',
                fontWeight: 'bold'
            }
        }));
    // Big overview map :
    var worldMap2= getGeoportalLayer('WLD','GEOGRAPHICALGRIDSYSTEMS.MAPS',false);
    var fxxMap2= getGeoportalLayer('FXX','GEOGRAPHICALGRIDSYSTEMS.MAPS',false);
    var bigOvmap= new Geoportal.Control.OverviewMap({
        div:OpenLayers.Util.getElement('bigOvDiv'),
        size: new OpenLayers.Size(200, 150),
        minRatio: 8,   //default: 8
        maxRatio: 8,   //default: 32
        layers:[worldMap2, fxxMap2],
        mapOptions:{
            apiKey: viewer.viewerOptions.apiKey,
            catalogue: viewer.viewerOptions.catalogue,
            mapmouseEventsEnable: viewer.viewerOptions.mapmouseEventsEnable,
            maxExtent: viewer.viewerOptions.maxExtent,
            projection: new OpenLayers.Projection(viewer.viewerOptions.projection),
            displayProjection: null,
            theme: null,
            viewer: null,
            territory: 'FXX'
        },
        createMap: function() {
            var options= OpenLayers.Util.extend({
                    controls:[],
                    fallThrough: false
                }, this.mapOptions);
            this.ovmap= new Geoportal.Map(this.mapDiv, options);
            this.ovmap.eventsDiv.appendChild(this.extentRectangle);

            // prevent ovmap from being destroyed when the page unloads, because
            // the OverviewMap control has to do this (and does it).
            OpenLayers.Event.stopObserving(window, 'unload', this.ovmap.unloadDestroy);

            //remove Geoportal.Control.PermanentLogo & Geoportal.Control.TermsOfService
            this.ovmap.removeControl(this.ovmap.getControlsByClass('Geoportal.Control.PermanentLogo')[0]);
            this.ovmap.removeControl(this.ovmap.getControlsByClass('Geoportal.Control.TermsOfService')[0]);

            var baselayer= new Geoportal.Layer("_"+options.territory+"_territory_", {
                isBaseLayer: true,
                displayInLayerSwitcher: false,
                projection: this.ovmap.projection.clone(),
                units: this.ovmap.projection.getUnits(),
                nativeProjection: this.ovmap.projection.clone(),
                resolutions: this.ovmap.catalogue.getResolutions(options.territory, this.ovmap.projection),
                minZoomLevel: this.ovmap.catalogue.getDefaultMinZoom(options.territory, this.ovmap.projection),
                maxZoomLevel: this.ovmap.catalogue.getDefaultMaxZoom(options.territory, this.ovmap.projection),
                maxExtent: this.ovmap.catalogue.getExtent(options.territory, this.ovmap.projection),
                territory: options.territory,
                displayProjection: this.ovmap.catalogue.getDisplayProjections(options.territory)[0],
                allowedDisplayProjections: this.ovmap.catalogue.getDisplayProjections(options.territory,null,true)
            });
            this.ovmap.addLayer(baselayer);
            var wld= this.ovmap.catalogue.getTerritory("WLD");
            var wldproj= this.ovmap.catalogue.getNativeProjection(wld);
            baselayer= new Geoportal.Layer("_WLD_world_", {
                isBaseLayer: true,
                displayInLayerSwitcher: false,
                projection: wldproj,
                units: wldproj.getUnits(),
                nativeProjection: wldproj,
                resolutions: this.ovmap.catalogue.getResolutions(wld,wldproj),
                minZoomLevel: this.ovmap.catalogue.getDefaultMinZoom(wld,wldproj),
                maxZoomLevel: this.ovmap.catalogue.getDefaultMaxZoom(wld,wldproj),
                maxExtent: this.ovmap.catalogue.getExtent(wld, wldproj),
                territory: wld,
                displayProjection: this.ovmap.catalogue.getDisplayProjections(wld)[0],
                allowedDisplayProjections: this.ovmap.catalogue.getDisplayProjections(wld,null,true)
            });
            this.ovmap.addLayer(baselayer);

            for (var i= 0, l= this.layers.length; i<l; i++) {
                this.ovmap.addLayer(this.layers[i]);
                this.ovmap.events.register('changelayer',this.layers[i],function(e) {
                    if (!e) { return; }
                    if (!(e.property=='visibility' || e.property=='opacity')) { return; }
                    if (e.layer===this) { return; }
                    if (e.layer.getCompatibleProjection()==null) { return; }//must be displayable on current map
                    if (e.layer.name!=this.name) { return; }
                    var v= e.layer[e.property];
                    if (this.getCompatibleProjection()==null && v!=this[e.property]) {
                        if (e.property=='visibility') {
                            this.visibility= v;
                            this.display(v);
                            this.redraw();
                        } else {
                            this.setOpacity(v);
                        }
                        var bls= this.map.getLayersBy("isBaseLayer",true);
                        for (var i= 0, l= bls.length; i<l; i++) {
                            var lyr= bls[i];
                            if (lyr===this.map.baseLayer) { continue; }
                            if (this.getCompatibleProjection(lyr)!=null) {
                                if (!this.savedStates[lyr.id]) {
                                    this.savedStates[lyr.id]= {};
                                }
                                this.savedStates[lyr.id][e.property]= v;
                            }
                        }
                        bls= null;
                    }
                });
            }
            this.ovmap.zoomToMaxExtent();

            // check extent rectangle border width
            this.wComp= parseInt(OpenLayers.Element.getStyle(this.extentRectangle, 'border-left-width')) +
                        parseInt(OpenLayers.Element.getStyle(this.extentRectangle, 'border-right-width'));
            this.wComp= (this.wComp) ? this.wComp : 2;
            this.hComp= parseInt(OpenLayers.Element.getStyle(this.extentRectangle, 'border-top-width')) +
                        parseInt(OpenLayers.Element.getStyle(this.extentRectangle, 'border-bottom-width'));
            this.hComp= (this.hComp) ? this.hComp : 2;

            this.handlers.drag= new OpenLayers.Handler.Drag(this, {
                    move: this.rectDrag,
                    done: this.updateMapToRect
                },{
                    map: this.ovmap
                });
            this.handlers.click= new OpenLayers.Handler.Click(this, {
                    "click": this.mapDivClick
                },{
                    "single": true,
                    "double": false,
                    "stopSingle": true,
                    "stopDouble": true,
                    "pixelTolerance": 1,
                    map: this.ovmap
                });
            this.handlers.click.activate();

            this.rectEvents= new OpenLayers.Events(this, this.extentRectangle, null, true);
            this.rectEvents.register("mouseover", this, function(e) {
                if (!this.handlers.drag.active && !this.map.dragging) {
                    this.handlers.drag.activate();
                }
            });
            this.rectEvents.register("mouseout", this, function(e) {
                if (!this.handlers.drag.dragging) {
                    this.handlers.drag.deactivate();
                }
            });

            if (this.ovmap.getProjection() != this.map.getProjection()) {
                var sourceUnits= this.map.getProjection().getUnits() || this.map.units || this.map.baseLayer.units;
                var targetUnits= this.ovmap.getProjection().getUnits() || this.ovmap.units || this.ovmap.baseLayer.units;
                this.resolutionFactor= sourceUnits && targetUnits ?
                    OpenLayers.INCHES_PER_UNIT[sourceUnits] /
                    OpenLayers.INCHES_PER_UNIT[targetUnits] : 1;
            }
        }
    });
    viewer.getMap().addControl(bigOvmap);

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
