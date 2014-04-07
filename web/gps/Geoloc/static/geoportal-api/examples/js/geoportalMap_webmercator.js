/*
 * Copyright (c) 2008-2013 Institut National de l'information Geographique et forestiere France, released
 * under the
 * BSD license.
 */
/**
 * Property: _v0, _v1, _v2, _v3
 * {<Geoportal.Viewer>} the viewer global instances.
 */
_v0= null;
_v1= null;
_v2= null;
_v3= null;

/**
 * Function: initMap
 * Load the application. Called when all information have been loaded by
 * <loadAPI>().
 */
function initMap() {
    //The api is loaded at this step
    //L'api est chargée à cette étape

    //add translations
    translate(null,['_v0','_v1','_v2','_v3']);

    //  ===================================================================================================

    function getOSM(nativeWebMercator) {
        // See OpenLayers spherical-mercator.html :
        // In order to keep resolutions, projection, numZoomLevels,
        // maxResolution and maxExtent are set for each layer.

        // OpenStreetMap tiled layer :
        if (!nativeWebMercator) {
            var osm= new Geoportal.Layer.Grid(
                "OpenStreetMap (Mapnik)",
                "http://tile.openstreetmap.org/${z}/${x}/${y}.png",
                {},
                {
                    isBaseLayer: false,
                    sphericalMercator: false,
                    projection: new OpenLayers.Projection("EPSG:900913"),
                    units: "m",
                    zoomOffset: 0,
                    nativeResolutions:[
                        156543.0339,
                         78271.51695,
                         39135.758475,
                         19567.8792375,
                          9783.93961875,
                          4891.969809375,
                          2445.9849046875,
                          1222.99245234375,
                           611.496226171875,
                           305.7481130859375,
                           152.87405654296876,
                            76.43702827148438,
                            38.21851413574219,
                            19.109257067871095,
                             9.554628533935547,
                             4.777314266967774,
                             2.388657133483887,
                             1.1943285667419434
                    ],
                    maxExtent: new OpenLayers.Bounds(-20037508, -20037508, 20037508, 20037508),
                    tileOrigin: new OpenLayers.LonLat(0,0),
                    visibility: false,
                    originators:[{
                        logo:'osm',
                        pictureUrl:'http://wiki.openstreetmap.org/Wiki.png',
                        url:'http://wiki.openstreetmap.org/wiki/WikiProject_France'
                    }],
                    opacity:0.5,
                    destroy: function () {
                        this.nativeMaxExtent = null;
                        Geoportal.Layer.Grid.prototype.destroy.apply(this, arguments);
                    },
                    getURL: function (bounds) {
                        var res = this.nativeResolution;
                        var x = Math.round((bounds.left - this.nativeMaxExtent.left)
                            / (res * this.nativeTileSize.w));
                        var y = Math.round((this.nativeMaxExtent.top - bounds.top)
                            / (res * this.nativeTileSize.h));
                        var z = this.map.getZoom() + this.zoomOffset;

                        var url = this.url;
                        var s = '' + x + y + z;
                        if (url instanceof Array) {
                            url = this.selectUrl(s, url);
                        }

                        var path = OpenLayers.String.format(url, {'x': x, 'y': y, 'z': z});

                        return path;
                    },
                    addTile:function(bounds,position,size) {
                        return new Geoportal.Tile.Image(this, position, bounds, null, size);
                    }
                }
            );
            return osm;
        }
        var osm= new OpenLayers.Layer.OSM(
            "OpenStreetMap (Mapnik)",
            "http://tile.openstreetmap.org/${z}/${x}/${y}.png",
            {
                projection: new OpenLayers.Projection("EPSG:900913"),
                units: "m",
                numZoomLevels: 18,
                maxResolution: 156543.0339,
                maxExtent: new OpenLayers.Bounds(-20037508, -20037508, 20037508, 20037508),
                visibility: true,
                originators:[{
                    logo:'osm',
                    pictureUrl:'http://wiki.openstreetmap.org/Wiki.png',
                    url:'http://wiki.openstreetmap.org/wiki/WikiProject_France'
                }]
            }
        );
        return osm;
    };

    //  ===================================================================================================

    _v0= new Geoportal.Viewer.Default(
        "v0",
        OpenLayers.Util.extend({
            mode:'normal',
            nameInstance:'_v0',
            territory:'FXX',
            displayProjection:[
                'EPSG:3857',
                'IGNF:GEOPORTALFXX',
                'CRS:84'
            ]
        },
            window.gGEOPORTALRIGHTSMANAGEMENT===undefined? {apiKey:['nhf8wztv3m9wglcda6n6cbuf']}:gGEOPORTALRIGHTSMANAGEMENT
        )
    );
    if (!_v0) {
        OpenLayers.Console.error(OpenLayers.i18n('new.instance.failed'));
        return;
    }
    _v0.addGeoportalLayers([
        'ORTHOIMAGERY.ORTHOPHOTOS',
        'GEOGRAPHICALGRIDSYSTEMS.MAPS'
    ],
    {
    });

    var osmarender0= getOSM();
    _v0.getMap().addLayers([osmarender0]);
    _v0.getMap().addControls([
        new OpenLayers.Control.Graticule({
            displayInLayerSwitcher:false
        })
    ]);

    _v0.getMap().setCenterAtLonLat(3.00, 46.42, 5);
    _v0.div.style[OpenLayers.String.camelize('background-image')]= 'none';

    //  ===================================================================================================

    _v1= new Geoportal.Viewer.Default(
        "v1",
        OpenLayers.Util.extend({
            mode:'normal',
            nameInstance:'_v1',
            territory:'FXX',
            projection:'IGNF:RGF93G',
            displayProjection:[
                'EPSG:3857',
                'IGNF:GEOPORTALFXX',
                'CRS:84'
            ]
        },
            window.gGEOPORTALRIGHTSMANAGEMENT===undefined? {apiKey:['nhf8wztv3m9wglcda6n6cbuf']}:gGEOPORTALRIGHTSMANAGEMENT
        )
    );
    if (!_v1) {
        OpenLayers.Console.error(OpenLayers.i18n('new.instance.failed'));
        return;
    }
    _v1.addGeoportalLayers([
        'ORTHOIMAGERY.ORTHOPHOTOS',
        'GEOGRAPHICALGRIDSYSTEMS.MAPS'
    ],
    {
    });

    var osmarender1= getOSM();
    _v1.getMap().addLayers([osmarender1]);
    _v1.getMap().addControls([
        new OpenLayers.Control.Graticule({
            displayInLayerSwitcher:false
        })
    ]);

    _v1.getMap().setCenterAtLonLat(3.00, 46.42, 5);
    _v1.div.style[OpenLayers.String.camelize('background-image')]= 'none';

    //  ===================================================================================================

    _v2= new Geoportal.Viewer.Default(
        "v2",
        OpenLayers.Util.extend({
            mode:'normal',
            nameInstance:'_v2',
            territory:'FXX',
            projection:'EPSG:3857',
            displayProjection:[
                'IGNF:GEOPORTALFXX',
                'EPSG:3857',
                'CRS:84'
            ]
        },
            window.gGEOPORTALRIGHTSMANAGEMENT===undefined? {apiKey:['nhf8wztv3m9wglcda6n6cbuf']}:gGEOPORTALRIGHTSMANAGEMENT
        )
    );
    if (!_v2) {
        OpenLayers.Console.error(OpenLayers.i18n('new.instance.failed'));
        return;
    }
    _v2.addGeoportalLayers([
        'ORTHOIMAGERY.ORTHOPHOTOS',
        'GEOGRAPHICALGRIDSYSTEMS.MAPS'
    ],
    {
        'ORTHOIMAGERY.ORTHOPHOTOS':{opacity:0.5},
        global:{visibility:false}
    });

    var osmarender2= getOSM(true);
    _v2.getMap().addLayers([osmarender2]);
    _v2.getMap().addControls([
        new OpenLayers.Control.Graticule({
            displayInLayerSwitcher:false
        })
    ]);

    _v2.getMap().setCenterAtLonLat(-2.00, 48.40, 6);
    _v2.getMap().setBaseLayer(osmarender2,_v2.getMap().getCenter(),osmarender2.getZoomForResolution(_v2.getMap().resolution,true));
    _v2.div.style[OpenLayers.String.camelize('background-image')]= 'none';

    //  ===================================================================================================
/* For testing only :
    _v3= new Geoportal.Viewer.Default(
        "v3",
        OpenLayers.Util.extend({
            mode:'normal',
            nameInstance:'_v3',
            territory:'REU',
            projection:'EPSG:3857',
            displayProjection:[
                'IGNF:RGR92UTM40S',
                'EPSG:3857',
                'CRS:84'
            ]
        },
            window.gGEOPORTALRIGHTSMANAGEMENT===undefined? {apiKey:['nhf8wztv3m9wglcda6n6cbuf']}:gGEOPORTALRIGHTSMANAGEMENT
        )
    );
    if (!_v3) {
        OpenLayers.Console.error(OpenLayers.i18n('new.instance.failed'));
        return;
    }

    var matrixIds= [];
    for (var i= 0; i<22; i++) {
        matrixIds[i]= {
            identifier:"" + i,
            topLeftCorner:new OpenLayers.LonLat(-20037508,20037508)
        };
    }
    var wmtsReu= new Geoportal.Layer.WMTS({
        name:'WMTS Mercator',
        url:'http://94.23.233.73/bin/rok4',
        layer:'ORTHO_JPEG_EPSG_3857_2008_974',
        style:'normal',
        matrixSet:'PM',
        matrixIds:matrixIds,
        tileOrigin:new OpenLayers.LonLat(-20037508,20037508),
        format:"image/jpeg",
        projection:new OpenLayers.Projection('EPSG:3857'),
        nativeResolutions:[         //resolution= .00028 * tile_matrix.scale_denominator/layer.meters_per_unit
            156543.033928041010839, //level 0
             78271.516964020490865, //level 1
             39135.758482010230882,
             19567.879241005122716,
              9783.939620502561358,
              4891.969810251280679,
              2445.984905125640340,
              1222.992452562820170,
               611.496226281410085,
               305.748113140704815,
               152.874056570352521,
                76.437028285176246,
                38.218514142588130,
                19.109257071294062,
                 9.554628535647033,
                 4.777314267823516,
                 2.388657133911758,
                 1.194328566955879,
                 0.597164283477940,
                 0.298582141738970,
                 0.149291070869485,
                 0.074645535434742  //level21
        ],
        zoomOffset:0,
        opacity:0.5,
        originators:[{
            logo:'ign',
            url: 'http://www.ign.fr',
            attribution: "Institut National de l'Information Géographique et forestière",
            minZoomLevel:6,
            maxZoomLevel:17
        }]
    });
    _v3.getMap().addLayer(wmtsReu);

    var osmarender3= getOSM(true);
    _v3.getMap().addLayers([osmarender3]);
    _v3.getMap().addControls([
        new OpenLayers.Control.Graticule({
            displayInLayerSwitcher:false
        })
    ]);

    _v3.getMap().setCenterAtLonLat(55.450, -20.875, 6);
    _v3.getMap().setBaseLayer(osmarender3,_v3.getMap().getCenter(),osmarender3.getZoomForResolution(_v3.getMap().resolution,true));
    _v3.div.style[OpenLayers.String.camelize('background-image')]= 'none';
 */
    // cache la patience - hide loading image
    OpenLayers.Util.getElement("v3").style[OpenLayers.String.camelize('background-image')]= 'none';
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
