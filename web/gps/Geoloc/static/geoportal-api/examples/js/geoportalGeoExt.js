/*
 * Copyright (c) 2008-2013 Institut National de l'information Geographique et forestiere France, released under the
 * BSD license.
 */
// create namespace
Ext.namespace('Geoportal');

// create application
Geoportal.app = function() {
    // private vars:
    var map, toolbarItems = [], viewport;

    var epsg4326= new OpenLayers.Projection("EPSG:4326");
    var wm= new OpenLayers.Projection("EPSG:3857");
    var center= new OpenLayers.LonLat(0,45).transform(epsg4326,wm);

    // private functions
    var createMap = function() {
        map = new OpenLayers.Map('viewerDiv',{
            resolutions: Geoportal.Catalogue.RESOLUTIONS.slice(0),
            projection: wm,
            maxExtent: new OpenLayers.Bounds(-180, -57, 180, 72).transform(epsg4326,wm,true),
            units: wm.getUnits(),
            controls: [
                new OpenLayers.Control.ScaleLine(),
                new OpenLayers.Control.MousePosition(),
                new OpenLayers.Control.KeyboardDefaults(),
                new OpenLayers.Control.Attribution(),
                new Geoportal.Control.PermanentLogo(),
                new Geoportal.Control.TermsOfService()
            ]});
    };

    var createGeoportalLayer = function() {
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
                  alwaysInRange: true,
                  opacity : 0.8,
                  projection: wm,
                  maxExtent: new OpenLayers.Bounds(-180, -57, 180, 72).transform(epsg4326,wm, true),
                  units: wm.getUnits(),
                  attribution: 'provided by IGN'
                }
              );
              map.addLayer(l0);
    };

    var addMapControls = function() {
        // navigation control
        var navControl = new OpenLayers.Control.Navigation({
            type: OpenLayers.Control.TYPE_TOGGLE,
            zoomWheelEnabled: true
        });
        map.addControl(navControl);
        navControl.activate();
    };

    var createViewport = function() {
        viewport = new Ext.Viewport({
            layout: 'border',
            items: [
                new Ext.BoxComponent({
                    region: 'north',
                    el: 'north',    // div's id
                    height: 40,
                    margins: {left: 0,top: 0}
                }), new Ext.tree.TreePanel({
                    region: 'west',
                    title: OpenLayers.i18n('gpControlLayerSwitcher.label'),
                    width: 200,
                    border: true,
                    margins: '5 0 0 5',
                    layout: 'fit',
                    root: new GeoExt.tree.BaseLayerContainer({
                        text:'',
                        leaf: false,
                        expanded: true
                    })
                }), new GeoExt.MapPanel({
                    region: 'center',
                    layout: 'fit',
                    border: true,
                    margins: '5 5 5 5',
                    map: map,
                    center:[center.lon, center.lat],
                    zoom:4,
                    tbar:new Ext.Toolbar({
                        height: 25,
                        items: toolbarItems
                    })
                }),new Ext.BoxComponent({
                    region: 'south',
                    el:'south', // div's id
                    height: 50,
                    border:false
                })
            ]
        });
    };

    var createToolbar = function() {
        var action;

        var createSeparator = function() {
           toolbarItems.push(" ");
           toolbarItems.push("-");
           toolbarItems.push(" ");
        };

        action = new GeoExt.Action({
            control: new OpenLayers.Control.ZoomToMaxExtent(),
            map: map,
            text:'Emprise totale',
            iconCls: 'olControlZoomToMaxExtentItemActive',
            toggleGroup: 'map',
            tooltip: 'Zoom to full extent'
        });

        toolbarItems.push(action);

        createSeparator();

        action = new GeoExt.Action({
            control: new OpenLayers.Control.ZoomBox(),
            tooltip: 'Cliquer sur la carte ou utiliser la souris pour dessiner un rectangle',
            map: map,
            text:'Zoom avant',
            //iconCls: 'olControlZoomBoxItemActive',
            toggleGroup: 'map'
        });

        toolbarItems.push(action);

        action = new GeoExt.Action({
            control: new OpenLayers.Control.ZoomBox({
                out: true
            }),
            tooltip: 'Cliquer sur le acarte ou utiliser la souris pour dessiner un rectangle',
            map: map,
            text:'Zoom arrière',
            //iconCls: 'olControlZoomBoxItemActive',
            toggleGroup: 'map'
        });

        toolbarItems.push(action);

        action = new GeoExt.Action({
            control: new OpenLayers.Control.DragPan({
                isDefault: true
            }),
            tooltip: 'En gardant le bouton gauche de la souris enfoncé, la mouvoir sur la carte',
            map: map,
            text:'Déplacer',
            //iconCls: 'olControlDragPanItemActive',
            toggleGroup: 'map'
        });

        toolbarItems.push(action);

        createSeparator();

        var ctrl = new OpenLayers.Control.NavigationHistory();
        map.addControl(ctrl);

        action = new GeoExt.Action({
                tooltip: "Permet de revenir à la carte précédemment affichée",
                control: ctrl.previous,
                text: 'Vue précédente',
                //iconCls: 'olControlNavigationHistoryPreviousItemActive',
                disabled: true
            });
        toolbarItems.push(action);

        action = new GeoExt.Action({
                tooltip: "Permet de retourner à la carte précédemment affichée",
                control: ctrl.next,
                text: 'Vue suivante',
                //iconCls: 'olControlNavigationHistoryNextItemActive',
                disabled: true
            });
        toolbarItems.push(action);

        createSeparator();
    };

    var initMap = function() {
        // add translations
        translate();

        Ext.QuickTips.init();
        createMap();
        createGeoportalLayer();

        addMapControls();
        createToolbar();
        createViewport();
    };

    // public space:
    return {
        // for debug, we make this property public:
        vector: null,

        loadAPI: function() {
            // wait for all classes to be loaded
            // on attend que les classes soient chargées
            if (checkApiLoading(this.loadAPI,['OpenLayers','OpenLayers.Lang','OpenLayers.Lang.en',
                                              'GeoExt','GeoExt.state','GeoExt.state.PermalinkProvider',
                                              'Geoportal','Geoportal.Layer','Geoportal.Layer.WMSC'])===false) {
                return;
            }

            // load API keys configuration, then load the interface
            // on charge la configuration de la clef API, puis on charge l'application
            Geoportal.GeoRMHandler.getConfig(['nhf8wztv3m9wglcda6n6cbuf'], null,null, {
                onContractsComplete: initMap
            });
        }
    };
}(); // end of app

Ext.onReady(Geoportal.app.loadAPI, Geoportal.app);
