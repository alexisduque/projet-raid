/*
 * Copyright (c) 2008-2013 Institut National de l'information Geographique et forestiere France, released under the
 * BSD license.
 */
/**
 * Property: viewer
 * {<Geoportal.Viewer>} the viewer global instance.
 */
viewer= null;

function _switchBL(v) {
    var blName= '';
    switch(v) {
    case 'OSM' : blName= 'OpenStreetMap (Mapnik)'; break;
    default    : // Geoportail :
        var t= viewer.getMap().catalogue.findTerritory(
            viewer.getMap().getCenter().transform(
                viewer.getMap().getProjection(),OpenLayers.Projection.CRS84)
        );
        blName= (t!='WLD'? '_'+t+'_territory_' : '_WLD_world_');
        break;
    }
    var r= viewer.getMap().resolution;
    var nbl= viewer.getMap().getLayersByName(blName);
    if (nbl.length==1) {
        nbl= nbl[0];
        var z= nbl.getZoomForResolution(r,true);
        viewer.getMap().setBaseLayer(nbl,viewer.getMap().getCenter(),z);
        if (v==='OSM') {
            // desactivate Geoportal Layer if OSM :
            var gpLyrs= viewer.getMap().getBy("layers","name",/^(ORTHOIMAGERY.ORTHOPHOTOS|GEOGRAPHICALGRIDSYSTEMS.MAPS)$/);
            for (var i= 0, l= gpLyrs.length; i<l; i++) {
                if (gpLyrs[i].getVisibility()===true) {
                    gpLyrs[i].setVisibility(false);
                }
            }
        }
    }
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

    var blyr= OpenLayers.Util.getElement('gpChooseBaseLayer');
    blyr.onchange= function() {
        _switchBL(this.options[this.selectedIndex].value);
    };

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
        proxy:'/geoportail/api/xmlproxy'+'?url='
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
        {});
    // set zoom now to fix baseLayer ...
    viewer.getMap().setCenterAtLonLat(2.5, 46.6, 5);
    // cache la patience - hide loading image
    viewer.div.style[OpenLayers.String.camelize('background-image')]= 'none';

    //Ajout d'une couche KML : les frontières pour vérifier les reprojections
    var styles= new OpenLayers.StyleMap(OpenLayers.Feature.Vector.style["default"]);
    var symb= {
        'Frontière internationale':{strokeColor:'#ffff00', strokeWidth:5},
        'Limite côtière'          :{strokeColor:'#6600ff', strokeWidth:3}
    };
    styles.addUniqueValueRules('default', 'NATURE', symb);
    styles.addUniqueValueRules('select',  'NATURE', symb);
    var borders= viewer.getMap().addLayer("KML",
        {
            'borders.kml.name':
            {
                'de':"Limits",
                'en':"Borders",
                'es':"Límites",
                'fr':"Limites",
                'it':"Limiti"
            }
        },
        "../data/FranceBorders.kml",
        {
            visibility: true,
            styleMap:styles,
            originators:[{
                logo:'ign',
                url:'http://professionnels.ign.fr/ficheProduitCMS.do?idDoc=5323861'
            }],
            minZoomLevel:0,
            maxZoomLevel:11
        }
    );

    //Ajout d'une couche WMS compatible Geoportail et Mercator Spherique
    var cadastro= viewer.getMap().addLayer("WMS",
        {
            'cadastro.layer.name':
            {
                'de':'Spanisch kataster',
                'en':'Spanish cadastre',
                'es':'Cadastro español',
                'fr':'Cadastre Espagnol',
                'it':'Spagnolo Catasto'
            }
        },
        "http://ovc.catastro.meh.es/Cartografia/WMS/ServidorWMS.aspx?",
        {
            layers:'Catastro',
            format:'image/png',
            transparent:true
        },
        {
            singleTile:false,
            projection: 'EPSG:4326',
            srs:{'EPSG:4326':'EPSG:4326', 'EPSG:3857':'EPSG:3857'},//some supported SRS from capabilities
            // maxExtent expressed in EPSG:4326 :
            maxExtent: new OpenLayers.Bounds(-18.409876,26.275447,5.22598,44.85536),
            minZoomLevel:5,
            maxZoomLevel:15,
            opacity:1.0,
            units:'degrees',
            isBaseLayer: false,
            visibility:false,
            legends:[{
                style:'Default',
                href:'http://ovc.catastro.meh.es/Cartografia/WMS/simbolos.png',
                width:'160',
                height:'500'
            }],
            originators:[
                {
                    logo:'catastro.es',
                    pictureUrl:'http://www.catastro.meh.es/ayuda/imagenes/escudo.gif',
                    url:'http://ovc.catastro.meh.es'
                }
            ]
        });

    //Ajout d'une couche WFS : les cours d'eau pour vérifier les reprojections
    var sandre= viewer.getMap().addLayer("WFS",
        {
            'sandre.layer.name':
            {
                'de':"Wasser kurses",
                'en':"Water courses",
                'es':"Cursos de agua",
                'fr':"Cours d'eau",
                'it':"Corsi d'acqua"
            }
        },
/* veille version
        "http://services.sandre.eaufrance.fr/geo/zonage-shp?",
 */
/* url de test
        "http://services.sandre.eaufrance.fr/geotest/mdo_metropole?",
 */
/* url sandre
 */
        "http://services.sandre.eaufrance.fr/geo/mdo_FXX?",
        {
/* veille version
            typename: 'RWBODY'
 */
            typename:'MasseDEauRiviere'
        },
        {
            projection:'EPSG:2154',
            units:'m',
            // maxExtent expressed in EPSG:2154 :
            maxExtent: new OpenLayers.Bounds(-58253.71015916939,6031824.7296808595,1181938.177574663,7233428.222339219),
            minZoomLevel:11,
            maxZoomLevel:16,
            /**
             * wfs_options
              * optional: holds information about the wms layer behavior
              * optionnel: contient les informations permettant d'affiner le comportement de la couche wfs
              */
            protocolOptions:{
                featurePrefix:'sa',
                featureNS:'http://xml.sandre.eaufrance.fr/',
                geometryName:'msGeometry'
            },
            originators: [
                {
                    logo:'sandre',
                    pictureUrl: 'img/logo_sandre.gif',
                    url: 'http://sandre.eaufrance.fr'
                }
            ],
            styleMap: new OpenLayers.StyleMap({
                "default": new OpenLayers.Style({strokeColor:'#0000ff', strokeWidth:3}),
                "select" : new OpenLayers.Style({strokeColor:'#3399ff', strokeWidth:3})
            }),
            hover: false
        });

    // See OpenLayers spherical-mercator.html :
    // In order to keep resolutions, projection, numZoomLevels,
    // maxResolution and maxExtent are set for each layer.

    // OpenStreetMap tiled layer :
    var osmarender= new OpenLayers.Layer.OSM(
        "OpenStreetMap (Mapnik)",
        "http://tile.openstreetmap.org/${z}/${x}/${y}.png",
        {
            projection: new OpenLayers.Projection("EPSG:900913"),
            units: "m",
            numZoomLevels: 18,
            maxResolution: 156543.0339,
            maxExtent: new OpenLayers.Bounds(-20037508, -20037508, 20037508, 20037508),
            visibility: false,
            originators:[{
                    logo:'osm',
                    pictureUrl:'http://wiki.openstreetmap.org/Wiki.png',
                    url:'http://wiki.openstreetmap.org/wiki/WikiProject_France'
                }]
        });
    viewer.getMap().addLayers([osmarender]);
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
