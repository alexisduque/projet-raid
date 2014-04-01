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
 * Function: addGetFeatureInfoControl
 * Add a {<OpenLayers.Control.GetFeatureInfoControl>} to the layer.
 */
function addGetFeatureInfoControl() {
    //this===layer

    //Retrieval of the appropriate tool box
    //Récupération de la barre d'outils qui nous interesse
    var blc= this.map.getControlsBy('id', 'basic_'+this.id)[0];
    if (!blc) { return ; }

    //{<OpenLayers.Control.WMSGetFeatureInfo>} : uses a WMS query to get information about a point on the map
    var wic= new OpenLayers.Control.WMSGetFeatureInfo({
        url:'http://services.sandre.eaufrance.fr/geo/zonage-shp?',
        layers:[this],
        uiOptions:{title:'OpenLayers.Control.WMSGetFeatureInfo.title'},
        //When this button is clicked, the function trigger() below is executed
        type: OpenLayers.Control.TYPE_BUTTON,
        queryVisible: true,
        infoFormat:'text/plain',//The mimetype to request from the server
        maxFeatures:1,//Maximum number of features to return from a WMS query
        eventListeners: {

            //Creation of a popup containing the request's result
            //Création d'une infobulle contenant le résultat de la requête
            getfeatureinfo: function(evt) {
                //this===control
                var txt= '';
                if (typeof(evt.features)!='undefined') {// when infoFormat==='application/vnd.ogc.gml'
                    for (var i= 0, l= evt.features.length; i<l; i++) {
                        var T= Geoportal.Control.renderFeatureAttributes(evt.features[i]);
                        txt+= '<div class="gpPopupHead">' + T[0] + '</div>' +
                              '<div class="gpPopupBody">' + T[1] + '</div>';
                    }
                } else {
                    if (evt.text) {// when infoFormat==='text/plain' || 'text/html'
                        var txt=
                            evt.object.infoFormat=='text/plain'?
                                '<div class="gpPopupBody">' +
                                    evt.text.replace(/[\r\n]/g,'<br/>').replace(/ /g,'&nbsp;') +
                                '</div>'
                            :   evt.text;
                    }
                }
                if (txt) {
                    if (!OpenLayers.Popup.FramedCloudMaxSize) {
                        OpenLayers.Popup.FramedCloudMaxSize= OpenLayers.Class(OpenLayers.Popup.FramedCloud, {
                            'autoSize': false, 
                            'maxSize': new OpenLayers.Size(200,200)
                        });
                    }

                    var popup= new OpenLayers.Popup.FramedCloudMaxSize(
                        "sandre",
                        this.map.getLonLatFromPixel(evt.xy),
                        null,
                        Geoportal.Util.cleanContent(txt),
                        null,
                        true);
                    this.map.addPopup(popup,true);
                }
                this.deactivate();
            }
        },
        trigger: function() {
            //this===control
            if (this.active) {
                this.deactivate();
            } else {
                this.activate();
            }
        }
    });
    blc.addControls([wic]);//On ajoute ce contrôle à la barre d'outils blc
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
        'GEOGRAPHICALGRIDSYSTEMS.MAPS',
        'BUILDINGS.BUILDINGS:WMS'
    ],
    {});

    viewer.getMap().addLayer(
        "WMS",
        'sandre.layer.name',
        "http://services.sandre.eaufrance.fr/geo/zonage-shp?",
        {//paramètres_du_wms: contient tous les paramètres nécessaires au paramétrage du service WMS
            layers:'RWBODY',
            format:'image/png',
            transparent:'true'
        },
        { //options_couche: contient les paramètres pour gérer le comportement de la couche WMS
            singleTile:false,
            projection:'EPSG:4326',
            units:'degrees',
            // maxExtent expressed in EPSG:4326 :
            //maxExtent: new OpenLayers.Bounds(-180,-90,180,90),
            maxExtent: new OpenLayers.Bounds(-4.52096,39.4787,11.6976,51.3959),
            minZoomLevel: 5,
            maxZoomLevel:15,
            opacity:1,
            isBaseLayer: false,
            visibility: false,
            // add GetFeatureInfo button :
            afterAdd: addGetFeatureInfoControl,
            originators:[
                {
                    logo:'sandre',
                    pictureUrl: 'img/logo_sandre.gif',
                    url: 'http://sandre.eaufrance.fr'
                }
            ]
        }
    );

    viewer.getMap().addLayer(
        "WMS",
        /**
         * layer_name parameter
         * holds the text that will be displayed by the layers switcher
         * contient le texte qui sera affiché dans le gestionnaire de couches
         */
        'cartorisque.wms.name',
        /**
         * url_to_wms parameter
         * holds the path to the wms resource
         * Chemin d'accès aux données wms
         */
        "http://cartorisque.prim.net/wms/france",
        /** wms_parameters
         * holds all parameters needed to define the WMS
         * contient tous les paramètres nécessaires au paramétrage du service WMS
         */
        {
            layers:'zont_pyr,zont_alp,front_pyr,front_alp,zonpi_pyr,zonpi_alp,linpi_alp,lint_pyr,lint_alp',
            format:'image/gif',
            transparent:'true'
        },
        /**
         * wms_options
         * optional: holds information about the wms layer behavior
         * optionnel: contient les informations permettant d'affiner le comportement de la couche wms
         */
        {
            singleTile:false,
            projection: 'EPSG:4326',
            // maxExtent expressed in EPSG:4326 :
            maxExtent: new OpenLayers.Bounds(-4.52096,39.4787,11.6976,48.3959),
            minZoomLevel:5,
            maxZoomLevel:15,
            opacity:0.5,
            units:'degrees',
            isBaseLayer: false,
            visibility:false,
            originators:[
                {
                    logo:'meddtl',
                    pictureUrl:'http://www.developpement-durable.gouv.fr/squelettes/img/logo.gif',
                    url:'http://www.developpement-durable.gouv.fr/'
                },
                {
                    logo:'irstea',
                    pictureUrl:'http://www.irstea.fr/sites/default/files/2.1_irstea_logoweb.png',
                    url:'http://www.irstea.fr/'
                }
            ]
        }
        /**
        * options_popup
        * optional: holds information about the gpx popup behavior
        * optionnel: contient les informations permettant d'affiner le comportement des popups associées à la couche wms
        */
    );

    var ll= new OpenLayers.LonLat(3.329444, 44.636111);
    ll.transform(OpenLayers.Projection.CRS84, viewer.getMap().getProjection());
    viewer.getMap().setCenter(ll, 6);
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
