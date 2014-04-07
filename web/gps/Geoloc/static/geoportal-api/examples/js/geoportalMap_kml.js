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
 * Function: openWikipediaPopup
 * Opens a new window whose content is fetched from the Extended tags of KML.
 *
 * Parameters:
 * f - {OpenLayers.Feature} the selected feature.
 */
function openWikipediaPopup(f) {
    if (f) {
        //get Extendata/Data[name="url"]/value :
        window.open(f.data.url.value,"Wikipedia","width=750,height=350,menubar=no,status=no,scrollbars=yes,resizable=yes");
        this.unselect(f);
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
        'ORTHOIMAGERY.ORTHOPHOTOS',
        'GEOGRAPHICALGRIDSYSTEMS.MAPS'],
        {});

    //Adding a KML layer: centers of territories
    //Ajout d'une couche KML : les centres des territoires
    viewer.getMap().addLayer("KML",
        {
        /**
        * layer_name parameter
        * holds the text that will be displayed by the layers switcher
        * contient le texte qui sera affiché dans le gestionnaire de couches
        */
        'places.kml.name':
            {
                'de':"Bemerkenswerte Orte",
                'en':"Outstanding places",
                'es':"Lugares destacables",
                'fr':"Lieux remarquables",
                'it':"Luoghi di notevole"
            }
        },
        /**
        * url_to_kml parameter
        *  holds the path to the KML resource
        * Chemin d'accès aux données KML
        */

        "../data/territories_centers.kml",
        {
           /**
            * kml_options
            * optional: holds information about the KML layer behavior
            * optionnel:  contient les informations permettant d'affiner le comportement de la couche KML
            */
            //layer's projection. By default, it is set to the map's projection
            projection:OpenLayers.Projection.CRS84,//always set projection when setting maxExtent

            //The maximum viewable extent for the layer
            //Emprise visible maximale de la couche
            maxExtent:new OpenLayers.Bounds(-180, -90, 180, 90),
            /**
            * minZoomLevel
            * smallest scale. Defaults to 0 (world zoom)
            * échelle la plus petite d'affichage. Par défaut, c'est 0 (échelle monde entier)
            */

            minZoomLevel:0,
            /**
            * maxZoomLevel
            * highest scale. Defaults the zoom mapped with the base layers' highest scale;
            * échelle la plus grande d'affichage. Par défaut, c'est le zoom correspondant à l'échelle maximale de la carte de base;
            */

           maxZoomLevel:10
        }
        /**
        * options_popup
        * optional: holds information about the KML popup behavior
        * optionnel: contient les informations permettant d'affiner le comportement des popups associées à la couche KML
        */

    );

    //Adding a KML layer: territories
    //Ajout d'une couche KML : les territoires

    viewer.getMap().addLayer("KML",
        {
            'territories.kml.name':
            {
                'de':"Gebiete",
                'en':"Territories",
                'es':"Territorios",
                'fr':"Territoires",
                'it':"Territori"
            }
        },
        "../data/territories.kml",
        {//kml_options:
            /**
             * In order to customize the display and behavior of the KML popups, one has to overload the following options:
             * Pour modifier le rendu et le comportement par défaut des fiches KML, il faut surcharger les options:
             * preFeatureInsert, onFeatureInsert, onSelect, onUnselect, et, éventuellement, hover.
             */

            preFeatureInsert:

                /**
                 *  Add a label styling on feature's style.
                 *       Only applied when OpenLayers >= 2.8
                 * Parameters:
                 * f - {OpenLayers.Feature} the newly created feature.
                 */

                function(f) {
                    if (f) {
                        // default Geoportal API : cursor pointer on hover ...
                        Geoportal.Popup.setPointerCursorForFeature(f);
                        // See. http://code.google.com/intl/fr/apis/kml/documentation/kmlreference.html#labelstyle
                        OpenLayers.Util.extend(f.style, {
                            label: f.attributes.name,
                            labelAlign: "rb",
                            fontColor: "yellow",
                            fontWeight: "bold",
                            fontSize: "12px",
                            fontFamily: "Courier New, monospace"
                        });
                    }
                },
            projection:OpenLayers.Projection.CRS84,//always set projection when setting maxExtent
            maxExtent:new OpenLayers.Bounds(-180, -90, 180, 90),
            minZoomLevel: 0,
            maxZoomLevel:10
        },
        {//options_popup
            onSelect:openWikipediaPopup,
            onUnselect:function(f){},//default OpenLayers : do nothing
            handlersOptions:{
                feature:{
                    stopDown:false//allow pan map when drag in feature
                }
            }
        });
    //Adding a KML layer: 1/100,000th scale maps
    //Ajout d'une couche KML : la série 1:100 000

    //on hover => highlight the sheet's name (TITRE_COMP)
    //au survol => mettre en évidence le nom de la feuille (TITRE_COMP)

    var s100Style= new OpenLayers.StyleMap({
        "default": new OpenLayers.Style({
            strokeColor:'#ffffff',
            strokeWidth:2,
            fillColor:'#000000',
            fillOpacity:0.5
        }),
        "temporary": new OpenLayers.Style({
            strokeColor:'#00ff00',
            strokeWidth:2,
            fillColor:'#00ff00',
            fillOpacity:0.5,
            //see context object below
            label: "${getTITRE_COMP}",
            labelAlign: "rb",
            labelBackgroundColor: "yellow",
            labelBorderColor: "black",
            labelBorderSize: "1px",
            fontColor: "black",
            fontWeight: "bold",
            fontSize: "12px",
            fontFamily: "Courier New, monospace"
        },{

            /**
            * The context object contains a function which is referenced in the symbolizer
            * This function will be called with the feature as an argument when using the appropriate style("temporary")
            *
            * L'objet contexte contient une fonction appelée dans le symboliseur
            * Cette fonction qui prend comme argument feature ,sera appelée lors de l'utilisation du style "temporary"
            */

            context:{
                getTITRE_COMP: function(f) {
                    return f.attributes['TITRE_COMP'].value;
                }
            }
        }),
        "select": new OpenLayers.Style({
            strokeColor:'#ff0000',
            strokeWidth:2,
            fillColor:'#ff0000',
            fillOpacity:0.5
        })
    });

    var s100= viewer.getMap().addLayer("KML",
        {
            'top100.kml.name':
            {
                'de':"1/100000 Maßstab Karten",
                'en':"1/100,000th scale maps",
                'es':"Mapas a escala 1/100000",
                'fr':"Cartes 1:100 000ième",
                'it':"Mappe in scala 1/100000"
            }
        },
        "../data/S_TOP100.kml",
        {
            projection:OpenLayers.Projection.CRS84,//always set projection when setting maxExtent
            // don't give maxExtent, let the API compute it ...
            minZoomLevel: 0,
            maxZoomLevel:10,
            opacity: 0.75,
            styleMap:s100Style,
            eventListeners:{
            /**
            * beforefeaturehighlighted: function(e){},//e.feature to get access to the feature
            * featurehighlighted: function(e){},
            * featureunhighlighted: function(e){}
            */

            }
        },
        {

            /**
            * extractStyles:
            * eading indicator of KML styles
            * By default, it is set to true. If it is set to false, it is up to the developper to add the styles
            *
            * indicateur de lecture des styles KML
            * Par défaut, il est mis à true. Si mis à false, c'est au développeur d'ajouter les styles
            */

            formatOptions:{
                extractStyles:false //styles deactivation
            },
            hover:true,

            // Permet de mettre en évidence les données
            highlightOnly:true,
            //name of the style to be applied
            //Nom du style à appliquer
            renderIntent:"temporary",
            onSelect: function(f){},//do nothing
            onUnselect: function(f){},//do nothing
            handlersOptions:{
                feature:{
                    stopDown:false//allow pan map when drag in feature
                }
            }
        });
    /**
     * getPopupDefaults:
     * Builds popup feature default behaviours for:
     * Crée une popup avec des comportements par défaut pour:
     * select, unselect and hover callbacks.
     *
     * We create a popup object which values are:
     * On crée un objet popup dont les valeurs sont :
     *
     {
         multipleKey: null,
         toggleKey: null,
         multiple: false,
         clickout: true,
         toggle: true,
         hover: false,
         highlightOnly: false,
         box: false,
         onBeforeSelect: function() {},
         onSelect: Geoportal.Control.selectFeature,
         onUnselect: Geoportal.Control.unselectFeature,
         scope: null,
         geometryTypes: null,
         callbacks: null,
         handlersOptions: null,
         selectStyle: null,
         renderIntent: "select"
     }
     */

    var selectS100Opts= OpenLayers.Util.extend( viewer.getMap().getPopupDefaults('KML'), {
        handlersOptions:{
            feature:{
                stopDown:false//allow pan map when drag in feature
            }
        }
    });

    //The object that is created is used to make a selection control
    //L'objet crée est utilisé pour faire un contrôle de sélection

            var selectS100= new OpenLayers.Control.SelectFeature(s100, selectS100Opts);
            viewer.getMap().addControl(selectS100);
            /**
     * onVisibilityChange:
     * Activate or Deactivate the select control of a layer or layers.
     * When all layers are not visible, the control is deactivated, otherwise it is activated.
     */

    viewer.getMap().events.on({"changelayer":Geoportal.Map.onVisibilityChange, scope:selectS100});

    viewer.getMap().setCenterAtLonLat(3.00, 36.25, 2);
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
