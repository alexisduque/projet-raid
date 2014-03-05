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

    //Loading of data layers
    //Chargement des couches de données
    viewer.addGeoportalLayers([
        'ORTHOIMAGERY.ORTHOPHOTOS'],
        {});

    /**
     *<Geoportal.Layer.Aggregate> : Build an aggregation of layers.
     *
     *Parameters
     *   name    {String} The aggregation name.
     *   layers  {Array(Geoportal.Layer)} Ordered list of layers to push into the aggregation.
     *   options {Object} Hash table of options.     *
     **/

    viewer.getMap().addLayer(
        new Geoportal.Layer.Aggregate(
            'satellites.imagery',//The aggregation name
            [//Ordered list of layers to push into the aggregation
                new OpenLayers.Layer.WMS(
                    "Blue Marble",
                    "http://www.nasa.network.com/wms",
                    {
                        //version:'1.3.0',
                        layers:'bmng200405',
                        format:'image/png'
                    },
                    {
                        isBaseLayer: false,
                        projection:'EPSG:4326',
                        units:'degrees',
                        tileSize: new OpenLayers.Size(512,512),
                        maxExtent: new OpenLayers.Bounds(-180,-90,180,90),
                        minZoomLevel: 5,
                        maxZoomLevel:8,
                        opacity:0.75
                    }
                ),
                new OpenLayers.Layer.WMS(
                    "Landsat",
                    "http://www.nasa.network.com/wms",
                    {
                        //version:'1.3.0',
                        layers:'esat'
                    },
                    {
                        isBaseLayer: false,
                        projection:'EPSG:4326',
                        units:'degrees',
                        tileSize: new OpenLayers.Size(512,512),
                        maxExtent: new OpenLayers.Bounds(-180,-90,180,90),
                        minZoomLevel: 9,
                        maxZoomLevel:12,
                        opacity:0.75
                    }
                )
            ],
            {
                visibility: false,
                description: "Blue Marble, Landsat",
                originators:[{
                    logo:'nasa',
                    pictureUrl:'http://solarsystem.nasa.gov/multimedia/gallery/meatball1.jpg',
                    url:'http://www.jpl.nasa.gov/'
                }]
            }
        )
    );
     //Pyramid of resolutions for a spanish WMS-C layer, displayed in plate-carre
     //pyramide de résolutions pour une couche WMS-C espagnole, exposée en projection plate-carré
    var ideeResolutions= [
        0.703125,
        0.3515625,
        0.17578125,
        0.087890625,
        0.0439453125,
        0.02197265625,
        0.010986328125,
        0.0054931640625,
        0.00274658203125,
        0.001373291015625,
        0.0006866455078125,
        0.00034332275390625,
        0.000171661376953125,
        0.0000858306884765625,
        0.00004291534423828125,
        0.000021457672119140625,
        0.0000107288360595703125,
        0.00000536441802978515625,
        0.000002682209014892578125,
        0.0000013411045074462890625/* old resolutions:,
        0.00000067055225372314453125,
        0.000000335276126861572215625,
        0.0000001676380634307861078125,
        0.00000008381903171539305390625,
        0.000000041909515857696526953125*/
    ];

    viewer.getMap().addLayer(
        "WMS-C",
         /**
            * layer_name parameter
             * holds the text that will be displayed by the layers switcher
             * contient le texte qui sera affiché dans le gestionnaire de couches
             */
        'IDEE-Base',
        /**
        * url_to_wms-c parameter
        *  holds the path to the wms-c resource
        * Chemin d'accès aux données wms-c
        */
        //old href: "http://www.idee.es/wms-c/IDEE-Base/IDEE-Base",
        "http://www.ign.es/wms-c/ign-base",
        {
          /** wms-c_parameters
           * holds all parameters needed to define the WMS-C
           * contient tous les paramètres nécessaires au paramétrage du service WMS-C
           */
            //old name: layers:'Todas',
            layers:'IGNBaseTodo',
            format:'image/png',
            transparent:true
        },
        {
          /**
           * wms-c_options
            * optional: holds information about the wms layer behavior
            * optionnel: contient les informations permettant d'affiner le comportement de la couche wms-c
            */
            isBaseLayer: false,
            projection:'EPSG:4326',
            units:'degrees',
            //tileOrigin: indique l'origine des tuiles. Par défaut, c'est le (0, 0) dans le système de référence de coordonnées projection.
            tileOrigin: new OpenLayers.LonLat(0,0),
            //nativeResolutions: indique les résolutions du cache. Par défaut, ce sont celles du Géoportail
            //Dans cet exemple, on a une pyramide de résolutions pour un service WMS-C espagnol
            nativeResolutions:ideeResolutions.slice(0),
            // maxExtent expressed in EPSG:4326 :
            // maxExtent:doit être exprimée dans le système de coordonnées projection(EPSG:4326)
            maxExtent: new OpenLayers.Bounds(-18.865234375,25.892578125,4.865234375,46.107421875),
            minZoomLevel: 1,
            maxZoomLevel:20,
            opacity:0.50,
            visibility:false,
            originators:[{
                logo:'ignes',
                pictureUrl:'http://www.ign.es/ign/img/principal/IGN_logo_ministerio.png',
                url:'http://www.idee.es/index.jsp?lang=FR'
            }]
        }
        /**
        * options_popup
        * optional: holds information about the gpx popup behavior
        * optionnel: contient les informations permettant d'affiner le comportement des popups associées à la couche wms-c
        */
    );

    /*
     * [The example] depended on a set of tiles that doesn't exist
     * anymore.
     *
     * OpenStreetMap does not provide EPSG:4326 tiles. If you want them, then
     * you'll need to set up a server to serve them yourself."

    var osmResolutions= [
        0.703125,
        0.3515625,
        0.17578125,
        0.087890625,
        0.0439453125,
        0.02197265625,
        0.010986328125,
        0.0054931640625,
        0.00274658203125,
        0.001373291015625,
        0.0006866455078125,
        0.00034332275390625,
        0.000171661376953125,
        0.0000858306884765625,
        0.00004291534423828125,
        0.000021457672119140625,
        0.000010728836059570312,
        0.0000053644180297851562,
        0.0000026822090148925781,
        0.0000013411045074462891
    ];

    viewer.getMap().addLayer(
        "WMS-C",
        "OpenStreetMap",
        [
            "http://t1.hypercube.telascience.org/tiles?",
            "http://t2.hypercube.telascience.org/tiles?",
            "http://t3.hypercube.telascience.org/tiles?",
            "http://t4.hypercube.telascience.org/tiles?"
        ],
        {
            layers:'osm-4326',
            format:'image/png'
        },
        {
            isBaseLayer: false,
            projection:'EPSG:4326',
            units:'degrees',
            tileOrigin: new OpenLayers.LonLat(0,0),
            nativeResolutions:osmResolutions.slice(0),
            // maxExtent expressed in EPSG:4326 :
            maxExtent: new OpenLayers.Bounds(-180,-90,180,90),
            minZoomLevel: 5,
            maxZoomLevel:15,
            opacity:0.60,
            visibility:false,
            originators:[{
                logo:'osm',
                pictureUrl:'http://wiki.openstreetmap.org/Wiki.png',
                url:'http://wiki.openstreetmap.org/wiki/WikiProject_France'
            }]
        }
    );
    *
    */

    var ll= new OpenLayers.LonLat(3.063611, 42.516667, 8);
    ll.transform(OpenLayers.Projection.CRS84, viewer.getMap().getProjection());
    viewer.getMap().setCenter(ll, 8);
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
