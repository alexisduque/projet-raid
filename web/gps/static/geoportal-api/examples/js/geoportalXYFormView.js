/*
 * Copyright (c) 2008-2013 Institut National de l'information Geographique et forestiere France, released under the
 * BSD license.
 */
/**
 * Constant: VIEWEROPTIONS
 * {Object} Geoportal.Viewer configuration.
 */
var VIEWEROPTIONS= {};

/**
 * Déplacement à la souris : mise à jour du formulaire
 */
function updateXYForm (feature, pix) {
    if (!feature || !feature.geometry  || !feature.geometry.x || !feature.geometry.y) {
        return;
    }
    var gpForm= viewer.getVariable('gpForm');
    var pt= feature.geometry.clone();
    pt.transform(viewer.getMap().getProjection(), gpForm.getNativeProjection());
    // Affichage dans l'élément
    var invp= gpForm.getPrecision();
    gpForm.setX(Math.round(pt.x*invp)/invp);
    gpForm.setY(Math.round(pt.y*invp)/invp);
    delete pt;
}

/**
 * Modification du formulaire : mise à jour des objets
 */
function updateFeature (elt, val) {
    var vlayer= viewer.getMap().getLayersByName(VIEWEROPTIONS.vectorLayerName)[0];
    var feature= vlayer.features[0];
    var gpForm= viewer.getVariable('gpForm');
    var x= gpForm.getX();
    var y= gpForm.getY();
    if (!isNaN(x) && !isNaN(y)) {
        // Supprimer l'ancien point
        vlayer.destroyFeatures();
        // transfo geo -> coord geop
        var geometry= new OpenLayers.Geometry.Point(x,y);
        geometry.transform(gpForm.getNativeProjection(), viewer.getMap().getProjection());

        // Ajouter l'objet
        feature= new OpenLayers.Feature.Vector(geometry);
        feature.state= OpenLayers.State.INSERT;
        vlayer.addFeatures(feature);

        // Centrer sur le point - on garde la même échelle que l'échelle courante
        viewer.getMap().setCenterAtLonLat(x, y);
    }
    // Initialiser
    updateXYForm(feature);
    return true;
}

/**
 * Initialiser la carte
 */
function loadInterface() {
    var params= unescape(window.location.search.substr(1)).split('&');
    var formOptions= {
    };
    for (var ip= 0; ip<params.length; ip++) {
        var param= params[ip];
        var kvp= param.split('=');
        if (kvp.length==2 &&
            ((typeof(kvp[1])=='string' && kvp[1].length>0) || typeof(kvp[1])!='string')) {
            formOptions[kvp[0]]= kvp[1];
        }
    }
    var gpForm= new Geoportal.GeoXYForm(formOptions);
    viewer.setVariable('gpForm',gpForm);
    // Affichage sous forme d'icone :
    var styles= null;
    if (gpForm.marker) {
        styles= new OpenLayers.StyleMap({
            'default'  : OpenLayers.Util.extend({
                    externalGraphic: gpForm.marker,
                    pointRadius: 10,
                    fillOpacity: 1
                }, OpenLayers.Feature.Vector['default']
            ),
            'temporary': OpenLayers.Util.extend({
                    display:'none'
                }, OpenLayers.Feature.Vector['temporary']
            )
        });
    }
    if (VIEWEROPTIONS.layerSwitcher=='mini') {
        viewer.openLayersPanel(false);
    } else {
        viewer.setLayersPanelVisibility(VIEWEROPTIONS.layerSwitcher=='on'? true:false);
    }
    if (VIEWEROPTIONS.toolboxCtrl=='mini') {
        viewer.openToolsPanel(false);
    } else {
        viewer.setToolsPanelVisibility(VIEWEROPTIONS.toolboxCtrl=='on'? true:false);
    }
    switch (VIEWEROPTIONS.infoPanel) {
    case 'off':
        viewer.setInformationPanelVisibility(false);
        break;
    case 'mini':
        viewer.infoCntrl.toggleControls(true);
        break;
    default    :
        break;
    }

    // Affichage des couches
    for (var i= 0, len= viewer.getMap().getNumLayers(); i<len; i++) {
        var lyr= viewer.getMap().layers[i];
        if (!lyr.isBaseLayer) {
            if (VIEWEROPTIONS.layerOptions.hasOwnProperty(lyr.name)) {
                var o= VIEWEROPTIONS.layerOptions[lyr.name];
                if (o.opacity!==undefined) {
                    lyr.setOpacity(o.opacity);
                }
                if (o.visibility!==undefined) {
                    lyr.setVisibility(o.visibility);
                }
            }
        }
    }

    // Couche vecteur pour la saisie
    var vlayer= new OpenLayers.Layer.Vector(
        VIEWEROPTIONS.vectorLayerName,
        {
            projection: gpForm.vectorProjection,
            displayInLayerSwitcher:false,
            calculateInRange: function() { return true; },
            styleMap: styles
        }
    );
    viewer.getMap().addLayer(vlayer);

    // Controle pour le deplacement
    var drag_feature= new OpenLayers.Control.DragFeature(
        vlayer,
        {
            onDrag : updateXYForm,
            onComplete : updateXYForm
        }
    );
    viewer.getMap().addControl(drag_feature);
    drag_feature.activate();

    // Controle pour la saisie
    var draw_feature= new OpenLayers.Control.DrawFeature(
        vlayer,
        OpenLayers.Handler.Point,
        {
            autoActivate:true,
            callbacks:{
                done: function (geometry) {
                    // Supprimer l'ancien point
                    this.layer.destroyFeatures();
                    // Creer le nouveau point
                    var feature= new OpenLayers.Feature.Vector(geometry);
                    feature.state= OpenLayers.State.INSERT;
                    this.layer.addFeatures([feature]);
                    updateXYForm(feature);
                }
            },
            handlerOptions:{
                persist: false,//true pour tester le Cntrl-Clic
                layerOptions:{
                    projection: gpForm.vectorProjection
                },
                keyMask: OpenLayers.Handler.MOD_CTRL
            }
        }
    );
    viewer.getMap().addControl(draw_feature);

    // Ajouter un observateur sur les donnees du formulaire
    OpenLayers.Event.observe(gpForm.getXInput(),"change",updateFeature);
    OpenLayers.Event.observe(gpForm.getYInput(),"change",updateFeature);
    updateFeature();
    if (gpForm.imgButton) {
        gpForm.button.src= gpForm.imgButton;
    }
    viewer.getMap().setCenter(viewer.viewerOptions.defaultCenter,viewer.viewerOptions.defaultZoom);
    // cache la patience - hide loading image
    viewer.div.style[OpenLayers.String.camelize('background-image')]= 'none';
}

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

    OpenLayers.Lang.setCode('fr'); // ensure French
    VIEWEROPTIONS= {
        mode: 'normal',
        territory: 'FXX',
        displayProjection: ['IGNF:RGF93G', 'IGNF:LAMB93', 'IGNF:LAMBE', 'IGNF:ETRS89LCC'],
        layerSwitcher: 'mini',  // on, off, mini
        toolboxCtrl: 'on',      // on, off, mini
        infoPanel: 'mini',      // on, off, mini
        vectorLayerName: 'POINT_XY',
        layerOptions: {
            'GEOGRAPHICALGRIDSYSTEMS.MAPS' : {
                opacity : 0.3
            },
            'ORTHOIMAGERY.ORTHOPHOTOS'     : {
                visibility : true
            }
        }
    };

    /**
     * Class: GeoXYForm
     * La classe de geoformulaire de saisie de (X,Y).
     */
    Geoportal.GeoXYForm = OpenLayers.Class({

        /**
         * APIProperty: containerId
         * {String} Identifiant du container HTML auquel sera ajouté la
         *      visualisation Géoportail.
         */
        containerId: null,

        /**
         * APIProperty: buttonId
         * {String} identifiant du container HTML activant/désactivant la
         *      visualisation Géoportail.
         */
        buttonId: null,

        /**
         * APIProperty: imgButton
         * {String} image associée au container HTML.
         */
        imgButton: null,

        /**
         * APIProperty: lonId
         * {String} identifiant du champ HTML contenant l'abscisse/longitude.
         */
        lonId: null,

        /**
         * APIProperty: latId
         * {String} identifiant du champ HTML contenant l'ordonnée/latitude.
         */
        latId: null,

        /**
         * APIProperty: vectorProjection
         * {String} nom de la projection associée aux coordonnées. Par défaut,
         * 'IGNF:RGF93G'.
         */
        vectorProjection: 'IGNF:RGF93G',

        /**
         * APIProperty: precision
         * {Number} 10**nombre de chiffres significatifs. Par défaut, 1000000 (30
         *      cm de précision en géographique).
         */
        precision: 1000000,

        /**
         * APIProperty: marker
         * {String} chemin d'accès à l'image figurant les coordonnées. Par défaut,
         *      aucune image.
         */
        marker: null,

        /**
         * Property: container
         * {DOMElement}
         */
        container: null,

        /**
         * Property: button
         * {DOMElement}
         */
        button: null,

        /**
         * Property: Lon
         * {DOMElement}
         */
        Lon: null,

        /**
         * Property: Lat
         * {DOMElement}
         */
        Lat: null,

        /**
         * Constructor: Geoportal.GeoXYForm
         * Définit un formulaire HTML lié à la visualisation Géoportail au travers
         * de la saisie d'un paire de coordonnées.
         *
         * Parameters:
         * options - {Object} les options du formulaire.
         *      Elles sont nombreuses :
         * - containerId
         * - buttonId
         * - imgButton
         * - lonId
         * - latId
         * - vectorProjection
         * - precision
         * - marker
         * - scale
         */
        initialize : function(options) {
            OpenLayers.Util.extend(this, options);

            if (typeof(this.vectorProjection)=='string') {
                this.vectorProjection= new OpenLayers.Projection(this.vectorProjection);
            }
            this.container= parent.document.getElementById(this.containerId);
            this.button= parent.document.getElementById(this.buttonId);
            this.Lon= parent.document.getElementById(this.lonId);
            this.Lat= parent.document.getElementById(this.latId);
        },

        /**
         * APIMethod: getXInput
         * Returns the coordinates input field associated with abscissa or
         * longitude.
         *
         * Returns:
         * {DOMElement}
         */
        getXInput : function() {
            return this.Lon;
        },

        /**
         * APIMethod: getYInput
         * Returns the coordinates input field associated with ordinate or
         * latitude.
         *
         * Returns:
         * {DOMElement}
         */
        getYInput : function() {
            return this.Lat;
        },

        /**
         * APIMethod: getX
         * Returns the coordinates input field value associated with abscissa or
         * longitude.
         *
         * Returns:
         * {Number}
         */
        getX : function() {
            if (this.Lon) {
                return parseFloat(this.Lon.value);
            }
            return NaN;
        },

        /**
         * APIMethod: getY
         * Returns the coordinates input field value associated with ordinate or
         * latitude.
         *
         * Returns:
         * {Number}
         */
        getY : function() {
            if (this.Lat) {
                return parseFloat(this.Lat.value);
            }
            return NaN;
        },

        /**
         * APIMethod: setX
         * Assigns the coordinates input field value associated with abscissa or
         * longitude.
         *
         * Parameters:
         * x - {Number}
         */
        setX : function(x) {
            if (this.Lon && !isNaN(parseFloat(x))) {
                this.Lon.value= x;
            }
        },

        /**
         * APIMethod: setY
         * Assigns the coordinates input field value associated with ordinate or
         * latitude.
         *
         * Parameters:
         * y - {Number}
         */
        setY : function(y) {
            if (this.Lat && !isNaN(parseFloat(y))) {
                this.Lat.value= y;
            }
        },

        /**
         * APIMethod: getPrecision
         * Returns the 10**number of figures
         *
         * Returns:
         * {Number}
         */
        getPrecision : function() {
            return this.precision? this.precision : 1000000;
        },

        /**
         * APIMethod: getNativeProjection
         * Returns the projection of the vector layer
         *
         * Returns:
         * {<OpenLayers.Projection>}
         */
        getNativeProjection : function() {
            return this.vectorProjection;
        },

        /**
         * Constant: CLASS_NAME
         * {String} *"Geoportal.GeoXYForm"*
         */
        CLASS_NAME: 'Geoportal.GeoXYForm'
    });

    //options for creating viewer:
    var options= {
        // default value
        // valeur par défaut
        'mode':VIEWEROPTIONS.mode,
        // default value
        // valeur par défaut
        'territory':VIEWEROPTIONS.territory,
        // default value
        // valeur par défaut
        displayProjection:VIEWEROPTIONS.displayProjection,
        // controls options
        // options pour les contrôles
        controlsOptions:{
            'Geoportal.Control.Logo':{
                logoSize:30
            }
        },
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

    // Initialiser l'application
    viewer.addGeoportalLayers([
        'ORTHOIMAGERY.ORTHOPHOTOS',
        'GEOGRAPHICALGRIDSYSTEMS.MAPS'
    ]);
    loadInterface();
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
