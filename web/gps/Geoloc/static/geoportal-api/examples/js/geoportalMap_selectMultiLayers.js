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
        proxy:'/geoportail/api/xmlproxy'+'?url='
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
        'ORTHOIMAGERY.ORTHOPHOTOS',
        'GEOGRAPHICALGRIDSYSTEMS.MAPS'],
        {});

    //Adding a KML layer: regions
    //Ajout d'une couche KML : les régions
    var regsStyle= new OpenLayers.StyleMap({
        "default": new OpenLayers.Style({
            strokeColor:'#cc0000',
            strokeWidth:2,
            fillColor:'#cc0000',
            fillOpacity:0.1
        }),
        "temporary": new OpenLayers.Style({
            strokeColor:'#00ff00',
            strokeWidth:2,
            fillColor:'#00ff00',
            fillOpacity:0.5,
            //see context object below
            label:"${getNOM_REGION}",
            labelAlign:'rb',
            //labelBackgroundColor:'yellow',
            //labelBorderColor:'black',
            //labelBorderSize:'1px',
            labelHaloColor:'yellow',
            labelHaloWidth:'1px',
            fontColor:'black',
            fontWeight:'bold',
            fontSize:'12px',
            fontFamily:'Courier New, monospace'
        },{
            /**
            * The context object contains a function which is referenced in the symbolizer
            * This function will be called with the feature as an argument when using the appropriate style("temporary")
            *
            * L'objet contexte contient une fonction appelée dans le symboliseur
            * Cette fonction qui prend comme argument feature ,sera appelée lors de l'utilisation du style "temporary"
            */
            context:{
                getNOM_REGION: function(f) {
                    return f.attributes['NOM_REGION'].value;
                }
            }
        }),
        "select": new OpenLayers.Style({
            strokeColor:'#0000ff',
            strokeWidth:2,
            fillColor:'#0000ff',
            fillOpacity:0.5
        })
    });
    var regs= viewer.getMap().addLayer("KML",

        /**
        * layer_name parameter
        * holds the text that will be displayed by the layers switcher
        * contient le exte qui sera affiché dans le gestionnaire de couches
        */
        'regs.kml.name',
        /**
        * url_to_kml parameter
         * holds the path to the KML resource
         * Chemin d'accès aux données KML
         */
        "../data/regions.kml",
        {
            /**
             * kml_options
             * optional: holds information about the KML layer behavior
             * optionnel:  contient les informations permettant d'affiner le comportement de la couche KML
             */
            projection:OpenLayers.Projection.CRS84,//always set projection when setting maxExtent
            // don't give maxExtent, let the API compute it ...
            opacity:1.0,
            minZoomLevel: 5,
            maxZoomLevel: 7,
            preFeatureInsert: Geoportal.Popup.setPointerCursorForFeature,
            styleMap:regsStyle,
            visibility:true
        },
        {
            /**
             *extractStyles:
             *reading indicator of KML styles
             * By default, it is set to true. If it is set to false, it is up to the developper to add the styles
             *
             *indicateur de lecture des styles KML
             *Par défaut, il est mis à true. Si mis à false, c'est au développeur d'ajouter les styles
             */
            formatOptions:{
                extractStyles:false // désactivation des styles
            },
            preventDefaultBehavior:true // pas de contrôleur Select
        });

    //Ajout d'une couche KML : les départements
    var depsStyle= new OpenLayers.StyleMap({
        "default": new OpenLayers.Style({
            strokeColor:'#ffff66',
            strokeWidth:2,
            fillColor:'#ffff66',
            fillOpacity:0.1
        }),
        "temporary": new OpenLayers.Style({
            strokeColor:'#00ff00',
            strokeWidth:2,
            fillColor:'#00ff00',
            fillOpacity:0.5,
            label:"${getNOM_DEPT}",
            labelAlign:'rb',
            //labelBackgroundColor:'yellow',
            //labelBorderColor:'black',
            //labelBorderSize:'1px',
            labelHaloColor:'yellow',
            labelHaloWidth:'1px',
            fontColor:'black',
            fontWeight:'bold',
            fontSize:'12px',
            fontFamily:'Courier New, monospace'
        },{
            context:{
                getNOM_DEPT: function(f) {
                    return f.attributes['NOM_DEPT'].value;
                }
            }
        }),
        "select": new OpenLayers.Style({
            strokeColor:'#0000ff',
            strokeWidth:2,
            fillColor:'#0000ff',
            fillOpacity:0.5
        })
    });
    var deps= viewer.getMap().addLayer("KML",

        'deps.kml.name',
        "../data/departements.kml",
        {
            projection:OpenLayers.Projection.CRS84,//always set projection when setting maxExtent
            // don't give maxExtent, let the API compute it ...
            opacity:1.0,
            minZoomLevel: 8,
            maxZoomLevel:10,
            preFeatureInsert: Geoportal.Popup.setPointerCursorForFeature,
            styleMap:depsStyle,
            visibility:true
        },
        {
            formatOptions:{
                extractStyles:false // désactivation des styles
            },
            preventDefaultBehavior:true // pas de contrôleur Select
        });

    //on hover => highlight the "temporary" style
    //au survol => highlight sur le style "temporary" :
    var hoverCtrlOpts= OpenLayers.Util.extend( viewer.getMap().getPopupDefaults('KML'), {
        hover:true,
        highlightOnly: true,
        //name of the style to be applied
        //Nom du style à appliquer
        renderIntent: "temporary",
        autoActivate: true,
        handlersOptions:{
            feature:{
                stopDown:false//allow pan map when drag in feature
            }
        }
    });
    var hoverCtrl= new OpenLayers.Control.SelectFeature([regs, deps], hoverCtrlOpts);
    viewer.getMap().addControl(hoverCtrl);

    /**
     *onVisibilityChange:
     *Activate or Deactivate the select control of a layer or layers.
     *When all layers are not visible, the control is deactivated, otherwise it is activated.
     */

    viewer.getMap().events.on({
        "changelayer":Geoportal.Map.onVisibilityChange,
        scope:hoverCtrl});

    //when clicking=> zoom on the object's extent
    //au clic => zoom sur l'emprise de l'objet
    var clickCtrlOpts= OpenLayers.Util.extend( viewer.getMap().getPopupDefaults('KML'), {
        onSelect: function(f) {
            if (f) {
                if (!f.bounds) {
                    f.bounds= f.geometry.getBounds();
                }
                this.unselect(f);
                f.layer.map.zoomToExtent(f.bounds,true);
            }
        },
        autoActivate: true,
        handlersOptions:{
            feature:{
                stopDown:false//allow pan map when drag in feature
            }
        }
    });
    var clickCtrl= new OpenLayers.Control.SelectFeature([regs, deps], clickCtrlOpts);
    viewer.getMap().addControl(clickCtrl);
    viewer.getMap().events.on({
        "changelayer":Geoportal.Map.onVisibilityChange,
        scope:clickCtrl});

    viewer.getMap().setCenterAtLonLat(3.00, 46.50, 5);
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
