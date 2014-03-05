/*
 * Copyright (c) 2008-2013 Institut National de l'information Geographique et forestiere France, released under the
 * BSD license.
 */
/**
 * Property: viewer
 * {<Geoportal.Viewer>} the viewer global instance.
 * The viewer variable is declared by the API through the instance parameter,
 * there is no need to redeclare it.
 * La variable viewer est déclarée lors de l'appel au script de chargement de
 * l'api en paramètre de instance, pas besoin de la redéclarer.
 */
viewer= null;

//Changing the renderIntent depending on whether the feature is selected or not
//Changement du style de rendu de l'objet selon s'il est selectionné ou pas
function changeRenderIntent (o) {
    if (o && o.feature) {
        o.feature.renderIntent= o.feature.renderIntent=="default"?
            "select"
        :   "default";
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

    ////The GPX layer going from 10 to 13, so we must set the right zoom level :
    //La couche GPX allant de 10 à 13, on se met au bon niveau de zoom :
    viewer.getMap().setCenter(viewer.viewerOptions.defaultCenter,10);
    // cache la patience - hide loading image
    viewer.div.style[OpenLayers.String.camelize('background-image')]= 'none';

    //Adding a GPX layer: a bike ride
    //Ajout d'une couche GPX : une ballade en vélo ...
    var gpx= viewer.getMap().addLayer("GPX",

        /**
         * layer_name parameter
         * holds the text that will be displayed by the layers switcher
         * contient le texte qui sera affiché dans le gestionnaire de couches
         *
         * Translations can directly be put here !
         * Les traductions peuvent être mises directement içi !
         */
        {
            'track.gpx.name':
            {
                'de':"Reise",
                'en':"Trip",
                'es':"Viaje",
                'fr':"Ballade",
                'it':"Viaggio"
            }
        },
        /**
         * url_to_gpx parameter
         *  holds the path to the GPX resource
         * Chemin d'accès aux données GPX
         */
        "../data/Campomoro-Tizzano-Sartene_3029.gpx",
        {
            /**
             * gpx_options
             * optional: holds information about the GPX layer behavior
             * optionnel:  contient les informations permettant d'affiner le comportement de la couche GPX
             */
            visibility:true,
            opacity:1.0,
            minZoomLevel:10,
            maxZoomLevel:14,
            originators:[{
                pictureUrl:'./img/tracegps.gif',
                url:'http://www.tracegps.com/'
            }],
            styleMap:new OpenLayers.StyleMap({
                "default": new OpenLayers.Style(
                    OpenLayers.Util.applyDefaults({
                        fillColor: "#FFFF00",
                        fillOpacity: 0.75,
                        strokeColor: "#FF9900",
                        strokeWidth: 2,
                        graphicZIndex: "${zIndex}",
                        graphicName: "triangle",
                        pointRadius: 8,
                        //see context object below
                        label:"${getName}",
                        labelAlign: "rb",
                        labelXOffset: -20,
                        labelYOffset: -20,
                        labelBackgroundColor: "#FFFF00",
                        labelBorderColor: "black",
                        labelBorderSize: "1px",
                        fontColor: "black",
                        fontWeight: "bold",
                        fontSize: "12px",
                        fontFamily: "Courier New, monospace"
                    },OpenLayers.Feature.Vector.style["default"]),{
                        /**
                         * The context object contains a function which is referenced in the symbolizer
                         * This function will be called with the feature as an argument when using the appropriate style("temporary")
                         *
                         * L'objet contexte contient une fonction appelée dans le symboliseur
                         * Cette fonction qui prend comme argument feature ,sera appelée lors de l'utilisation du style "temporary"
                         */
                        context:{
                            getName: function(f) {
                                if (f.attributes['typeName']=='wpt') {
                                    return f.attributes['name'];
                                }
                                return '';
                            }
                        }
                    }),
                "select": new OpenLayers.Style(
                    OpenLayers.Util.applyDefaults({
                        fillColor: "#FF9900",
                        fillOpacity: 0.75,
                        strokeColor: "#FFFF00",
                        strokeWidth: 4,
                        pointRadius: 12
                    },OpenLayers.Feature.Vector.style["select"]))
            }),

            /**
             * In order to customize the display and behavior of the GPX popups, one has to overload the following options:
             * Pour modifier le rendu et le comportement par défaut des fiches GPX, il faut surcharger les options:
             * preFeatureInsert, onFeatureInsert, onSelect, onUnselect, et, éventuellement, hover.
             */

            preFeatureInsert:
                /**
                 * Set waypoints over tracks and routes.
                 *
                 * Parameters:
                 * f - {OpenLayers.Feature} the newly created feature.
                 */
                function(f) {
                    if (f) {
                        // default Geoportal API : cursor pointer on hover ...
                        Geoportal.Popup.setPointerCursorForFeature(f);
                        var zidx= 0;
                        if (f.attributes['typeName']=='wpt') {
                            zidx= 1;
                        }
                        f.attributes['zIndex']= zidx;
                    }
                },
            rendererOptions: {

              /**
               * Z-Index:
               * allows to play on display order of the layers
               * Permet de jouer sur l'ordre d'affichage des couches
               * see the example: http://openlayers.org/dev/examples/ordering.html
               */
                zIndexing: true
            },

            /**
             * skipAttributes
             * table of attributes which should not be put in the popup
             * tableau des attributs à ne pas mettre dans la popup
             */
            skipAttributes:['zIndex'],//do not render zIndex in popups!
            eventListeners:{
                "loadend"              : function() {
                    if (this.maxExtent) {
                        //Zoom and refocusing on the max extent
                        //Zoom et recentrage sur l'emprise maxi
                        this.map.zoomToExtent(this.maxExtent);
                    }
                },
                //Changing the feature's style
                "beforefeatureselected": changeRenderIntent,
                "featureunselected"    : changeRenderIntent
            }
        },
        /**
         * options_popup
         * optional: holds information about the gpx popup behavior
         * optionnel: contient les informations permettant d'affiner le comportement des popups associées à la couche gpx
         */
        {
        }
    );
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
