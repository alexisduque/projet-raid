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

    //Loading of data layers
    //Chargement des couches de données
    viewer.addGeoportalLayers([
        'ORTHOIMAGERY.ORTHOPHOTOS'],
        {});

    //Ajout d'une couche OpenStreetMap ...
    // Cf. http://wiki.openstreetmap.org/wiki/Api & http://wiki.openstreetmap.org/wiki/XAPI
    // http://api.openstreetmap.org/api/0.6/map?bbox=4.78,45.81,4.82,45.82
    // http://api.openstreetmap.org/api/0.6/map?bbox=4.766970,45.793109,4.849656,45.831916 (trop gros!?)
    viewer.getMap().minZoomLevel=13;
    viewer.getMap().maxZoomLevel=17;
    //highway: tertiary, name
    //highway: road
    //highway: track
    //highway: secondary, ref
    //highway: residential, width:narrow, name
    //highway: unclassified, name
    //boundary: administrative, admin_level: 8
    //place: village, name
    var styles= new OpenLayers.StyleMap({
        'default': OpenLayers.Util.extend(
            OpenLayers.Feature.Vector['default'],{
                strokeColor:'black',
                strokeWidth:3
            }),
        'select' : OpenLayers.Util.extend(
            OpenLayers.Feature.Vector['select'],{
                strokeColor:'black',
                strokeWidth:3
            })
    });

    // See http://wiki.openstreetmap.org/wiki/Map_Features
    // See http://svn.openstreetmap.org/applications/rendering/mapnik/osm.xml : 25000-5000

    //Creating a correspondance table between the value of the attribute "highway" and the one of the symbolizer "symb1"
    //Création d'une table de correspondance entre la valeur de l’attribut "highway" et celle du symboliseur "symb1"
    var symb1= {
        'secondary'   :{strokeColor:'#a37b48', strokeWidth:5},
        'tertiary'    :{strokeColor:'#bbb',    strokeWidth:4},
        'road'        :{strokeColor:'#bbb',    strokeWidth:4},
        'track'       :{strokeColor:'#dfcc66', strokeWidth:2},
        'residential' :{strokeColor:'#bbb',    strokeWidth:4},
        'unclassified':{strokeColor:'#bbb',    strokeWidth:4}
    };

    //Associating with the "default" style: we have now a style which depends on the value of "highway"
    //Association avec le style"default": On a maintenant un style qui dépend de la valeur de "highway"
    styles.addUniqueValueRules('default','highway',symb1);
    styles.addUniqueValueRules('select', 'highway',symb1);
    var symb2= {
        'administrative':{strokeColor:'#fff'}
    };
    styles.addUniqueValueRules('default','boundary',symb2);
    styles.addUniqueValueRules('select', 'boundary',symb2);
    var symb3= {
        'village':{
            pointRadius:8,
            fillColor:'#f00',
            label:'$'+'{name}',//we get the village's name
            labelAlign:'lb',
            fontColor:'#ffff00',
            fontFamily:'DejaVu Sans Book',
            fontWeight:'bold'
        }
    };
    styles.addUniqueValueRules('default','place',symb3);
    styles.addUniqueValueRules('select', 'place',symb3);

    viewer.getMap().addLayer("OSM",
        /**
         * layer_name parameter
         * holds the text that will be displayed by the layers switcher
         * contient le texte qui sera affiché dans le gestionnaire de couches
         */
        "OpenStreetMap",
        /**
         * url_to_osm parameter
         * holds the path to the osm resource
         * Chemin d'accès aux données osm
         */
        "../data/lyon.osm",
        /**
         * osm_options
         * optional: holds information about the osm layer behavior
         * optionnel: contient les informations permettant d'affiner le comportement de la couche osm
         */
        {
            visibility:true,
            minZoomLevel:13,
            maxZoomLevel:17,
            styleMap:styles
        },
        /**
         * options_popup
         * optional: holds information about the osm popup behavior
         * optionnel: contient les informations permettant d'affiner le comportement des popups associées à la couche osm
         */
        {}
    );

    viewer.getMap().setCenterAtLonLat(4.808, 45.8128, 15);
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
