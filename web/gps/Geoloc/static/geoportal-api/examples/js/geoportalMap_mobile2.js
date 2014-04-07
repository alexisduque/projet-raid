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

    /**
     * Class: Geoportal.UI.JQuery.Mobile.SimpleLayerSwitcher
     * Render a list of layers in a mobile web application
     *
     * The component's structure is as follows :
     *
     * (start code)
     * <ul id="#{id}" data-role="listview" data-inset="true" class="gpControlSimpleLayerSwitcher olControlNoSelect">
     *   <li id="#{id}_layers_container" data-role="list-divider" role="heading" class="gpControlSimpleLayerSwitcherGroupDivClass">title</li>
     *   <li id="#{id}_#{layer.id} data-icon="check" class="check| gpControlSimpleLayerSwitcherDivClass">
     *     <a id="label_#{layer.id}" class="gpControlSimpleLayerSwitcherSpanClass">name</a>
     *   </li>
     * </ul>
     * (end)
     *
     * Inherits from:
     * - {<Geoportal.UI.JQuery.Mobile>}
     */
    Geoportal.UI.JQuery.Mobile.SimpleLayerSwitcher= OpenLayers.Class(Geoportal.UI.JQuery.Mobile, {

        /**
         * Property: layerStates
         * {Array(Object)} Basically a copy of the "state" of the map's layers
         *     the last time the control was drawn. We have this in order to avoid
         *     unnecessarily redrawing the control.
         *
         */
        layerStates: null,

        // DOM Elements

        /**
         * Property: dataLayersDiv
         * {DOMElement} The inner layerSwitcher div. Holds each layer information
         * div.
         */
        dataLayersDiv: null,

        /**
         * Property: dataLayers
         * {Array(<OpenLayers.Layer>)} Information to display about each layer.
         */
        dataLayers: null,

        /**
         * APIMethod: draw
         * The draw method is called to complete the component's content on the page.
         *
         * Returns:
         * {DOMElement} A reference to the DOMElement containing the
         * component.
         */
        draw: function () {
            // create layout
            this.loadContents();

            // populate container with current info
            this.redraw();

            return OpenLayers.UI.prototype.draw.apply(this,arguments);
        },

        /**
         * Method: loadContents
         * Set up the main layout for the component.
         * DOM elements for the base layers are not created here. FIXME: options ?
         */
        loadContents: function() {
            $('#layers-page').page();
            // layers list layout :
            $('<li>', {
                'id':this.id+"_layers_container",
                'data-role':"list-divider"
            }).addClass("gpControlSimpleLayerSwitcherGroupDivClass").appendTo('#layerslist');
            this.dataLayersDiv= $("#"+this.id+"_layers_container").get(0);
        },

        /**
         * APIMethod: redraw
         *  Goes through and takes the current state of the Map and rebuilds the
         *  component to display that state.  Lists each data layer with a checkbox.
         *
         * Returns:
         * {DOMElement} A reference to the DOMElement containing the
         * component.
         */
        redraw: function() {
            //if the state hasn't changed since last redraw, no need
            // to do anything. Just return the existing div.
            if (!this.checkRedraw()) {
                return this.container;
            }

            $('#layers-page').page();
            var i, j, l= this.getComponent().map.layers.length;
            var layer;
            // Save state -- for checking layer if the map state changed.
            // We save this before redrawing, because in the process of redrawing
            // we will trigger more visibility changes, and we want to not redraw
            // and enter an infinite loop. Same for opacity changes.
            this.layerStates= [];
            for (i= 0; i < l; i++) {
                layer= this.getComponent().map.layers[i];
                this.layerStates[i]= {
                    'displayInLayerSwitcher': layer.displayInLayerSwitcher,
                    'name': layer.name,
                    'visibility': layer.visibility,
                    'id': layer.id
                };
            }

            //clear out previous layers
            this.clearLayersArray("data");

            var layers= this.getComponent().map.layers.slice();
            for (i= 0; i<l; i++) {
                layer= layers[i];
                var baseLayer= layer.isBaseLayer;
                var layerState= this.layerStates[i];

                // don't want baseLayers ...
                if (layer.displayInLayerSwitcher && !baseLayer) {
                    var labelA= $('<a>', {
                        'id': "label_"+layer.id,
                        'text': OpenLayers.i18n(layer.name)
                    }).addClass("gpControlSimpleLayerSwitcherSpanClass").append($('<img>', {
                        'id': "label_"+layer.legends[0].style+"_"+layer.id,
                        'src': layer.legends[0].src,
                        'width': layer.legends[0].width+"px",
                        'height': layer.legends[0].height+"px",
                        'alt': OpenLayers.i18n(layer.legends[0].title)
                    }));
                    var layerDiv= $('<li>', {
                        'id': this.id+"_"+layer.id,
                        'data-icon': "check"
                    }).addClass(
                        "gpControlSimpleLayerSwitcherDivClass" +
                        (layer.visibility? " checked" : "")
                    ).append(
                        labelA
                    ).click({
                        'layer': layer,
                        'ui': this
                    },this.onLabelClick).appendTo("#layerslist");

                    this.dataLayers.push({
                        'layer': layer,
                        'layerDiv': layerDiv
                    });

                    layer.events.on({
                        'visibilitychanged': function() {
                            if (this.getVisibility()) {
                                $(layerDiv).addClass('checked');
                            } else {
                                $(layerDiv).removeClass('checked');
                            }
                        }
                    });
                }
            }
            $('#layerslist').listview('refresh');

            return this.container;
        },

        /**
         * Method: checkRedraw
         * Checks if the layer state has changed since the last redraw() call.
         *
         * Returns:
         * {Boolean} The layer state changed since the last redraw() call.
         */
        checkRedraw: function() {
            var redraw= false;
            if ( !this.layerStates.length ||
                 (this.getComponent().map.layers.length != this.layerStates.length) ) {
                redraw= true;
            } else {
                for (var i=0, len= this.layerStates.length; i<len; i++) {
                    var layerState= this.layerStates[i];
                    var layer= this.getComponent().map.layers[i];
                    if ( (layerState.displayInLayerSwitcher != layer.displayInLayerSwitcher) ||
                         (layerState.name != layer.name) ||
                         (layerState.id != layer.id) ||
                         (layerState.visibility != layer.visibility) ) {
                        redraw= true;
                        break;
                    }
                }
            }
            return redraw;
        },

        /**
         * Method: clearLayersArray
         * User specifies either "base" or "data". we then clear all the
         *     corresponding listeners, the div, and reinitialize a new array.
         *
         * Parameters:
         * layersType - {String} Only "data" is allowed
         */
        clearLayersArray: function(layersType) {
            var layers= this[layersType + "Layers"];
            if (layers) {
                for(var i= 0, len= layers.length; i<len; i++) {
                    var layer= layers[i];
                    layer.layerDiv.unbind();
                }
            }
            this[layersType + "Layers"]= [];
            $("#layerslist > li.gpControlSimpleLayerSwitcherDivClass").remove();
        },

        /**
         * APIMethod: onLabelClick
         * A layer's label has been clicked, make the layer visible, make
         * other layers not visible.
         *
         * Parameters:
         * e - {Event}
         *
         * Context:
         * ui - {<Geoportal.UI>}
         * layer - {<OpenLayers.Layer>}
         */
        onLabelClick: function(e) {
            e.stopPropagation();
            // set the correct visibilities for the overlays
            for (var i= 0, l= e.data.ui.dataLayers.length; i<l; i++) {
                var layerEntry= e.data.ui.dataLayers[i];
                layerEntry.layer.setVisibility(
                    e.data.layer===layerEntry.layer? true : false
                );
            }
            $.mobile.changePage($("#mapping-page"));
        },

        /**
         * Constant: Geoportal.UI.JQuery.Mobile.SimpleLayerSwitcher.CLASS_NAME
         *  Defaults to *Geoportal.UI.JQuery.Mobile.SimpleLayerSwitcher*
         */
        CLASS_NAME: "Geoportal.UI.JQuery.Mobile.SimpleLayerSwitcher"
    });

    /**
     * Class: Geoportal.Control.SimpleLayerSwitcher
     * A simple layers switcher class.
     * Basically, only one overlay is visible at a time ...
     * Inherits from:
     * - {<Geoportal.Control.SimpleLayerSwitcher>}
     */
    Geoportal.Control.SimpleLayerSwitcher= OpenLayers.Class(Geoportal.Control, {

        /**
         * Constructor: Geoportal.Control.SimpleLayerSwitcher
         * Build the layer switcher.
         *
         * Parameters:
         * options - {Object}
         */
        initialize: function(options) {
            Geoportal.Control.prototype.initialize.apply(this, arguments);
            this.getUI().layerStates= [];
        },

        /**
         * APIMethod: destroy
         * The DOM elements handling base layers are not suppressed.
         */
        destroy: function() {
            OpenLayers.Event.stopObservingElement(this.div);
            this.getUI().clearLayersArray("data");
            if (this.map) {
                this.map.events.un({
                    "addlayer": this.redraw,
                    "changelayer": this.redraw,
                    "changebaselayer": this.redraw,
                    "removelayer": this.removeLayer,
                    scope:this});
            }
            Geoportal.Control.prototype.destroy.apply(this, arguments);
        },

        /**
         * APIMethod: setMap
         * Register events and set the map.
         *
         * Parameters:
         * map - {<OpenLayers.Map>}
         */
        setMap: function(map) {
            Geoportal.Control.prototype.setMap.apply(this, arguments);
            this.map.events.on({
                "addlayer": this.redraw,
                "changelayer": this.redraw,
                "changebaselayer": this.redraw,
                "removelayer": this.removeLayer,
                scope: this});
        },

        /**
         * APIMethod: draw
         * Call the default draw, and then draw the control.
         *
         * Parameters:
         * px - {<OpenLayers.Pixel>} the position where to draw the control.
         *
         * Returns:
         * {DOMElement} the control's div.
         */
        draw: function(px) {
            return Geoportal.Control.prototype.draw.apply(this,arguments);
        },

        /**
         * Method: redraw
         * Redraw the control if necessary.
         */
        redraw: function() {
            this.getUI().redraw();
        },

        /**
         * APIMethod: removeLayer
         * Listener of "removelayer" event.
         *
         * Parameters:
         * e - {Event} the browser event
         */
        removeLayer: function(e) {
            // layerStates is cleaned during redraw (checkRedraw() will return true) ...
            this.getUI().redraw();
        },

        /**
         * Constant: CLASS_NAME
         * {String} *"Geoportal.Control.SimpleLayerSwitcher"*
         */
        CLASS_NAME: "Geoportal.Control.SimpleLayerSwitcher"
    });

    /**
     * Class: OpenLayers.Control.Geolocate
     * Overwrite constructor, destroy, setMap and
     * Keep an eye on the OpenLayers' class source code as it is copied here
     * to prevent infinite recurse.
     */
    OpenLayers.Control.Geolocate= OpenLayers.overload(OpenLayers.Control.Geolocate, {
        /**
         * Property: vPosLayer
         * {<OpenLayers.Layer.Vector>} track and current geo-location.
         */
        vPosLayer:null,

        /**
         * Constructor: OpenLayers.Control.Geolocate
         * Create a new control to deal with browser geolocation API
         */
        initialize:function(options) {
            // concatenate events specific to this control with those from the base
            this.EVENT_TYPES =
                OpenLayers.Control.Geolocate.prototype.EVENT_TYPES.concat(
                OpenLayers.Control.prototype.EVENT_TYPES
            );
            this.geolocationOptions = {};
            OpenLayers.Control.prototype.initialize.apply(this, [options]);
            this.vPosLayer= new OpenLayers.Layer.Vector("Geolocation track", {
                displayInLayerSwitcher:false
            });
        },

        /**
         * Method: destroy
         */
        destroy:function() {
            if (this.map) {
                this.map.removeLayer(this.vPosLayer);
            } else {
                this.vPosLayer.destroy();
            }
            this.vPosLayer= null;
            OpenLayers.Event.stopObservingElement(this.div);
            this.deactivate();
            OpenLayers.Control.prototype.destroy.apply(this, arguments);
        },

        /**                             
         * Method: activate
         * Activates the control.
         *  
         * Returns:
         * {Boolean} The control was effectively activated.
         */ 
        activate: function () {
            if (!this.geolocation) {
                this.events.triggerEvent("locationuncapable");
                return false;
            }
            if (OpenLayers.Control.prototype.activate.apply(this, arguments)) {
                if (this.watch) {
                    this.watchId = this.geolocation.watchPosition(
                        OpenLayers.Function.bind(this.geolocate, this),
                        OpenLayers.Function.bind(this.failure, this),
                        this.geolocationOptions
                    );
                } else {
                    this.getCurrentLocation();
                }
                return true;
            }
            return false;
        },

        /**
         * Method: setMap
         * Set the map property for the control. This is done through an accessor
         * so that subclasses can override this and take special action once 
         * they have their map variable set. 
         *
         * Parameters:
         * map - {<OpenLayers.Map>} 
         */
        setMap:function(map) {
            OpenLayers.Control.prototype.setMap.apply(this,arguments);
            map.addLayer(this.vPosLayer);
        },

        /**
         * Method: draw
         * The draw method is called when the control is ready to be displayed
         * on the page.  If a div has not been created one is created.  Controls
         * with a visual component will almost always want to override this method 
         * to customize the look of control. 
         *
         * Parameters:
         * px - {<OpenLayers.Pixel>} The top-left pixel position of the control
         *      or null.
         *
         * Returns:
         * {DOMElement} A reference to the DIV DOMElement containing the control
         */
        draw:function(px) {
            OpenLayers.Control.prototype.draw.apply(this,arguments);
            OpenLayers.Event.observe(this.div,"click",
                OpenLayers.Function.bindAsEventListener(function() {
                    if (this.active) {
                        this.getCurrentLocation();
                    } else {
                        this.activate();
                    }
                }, this)
            );
        }
    });

    //add translations
    translate(['searchButton','searchTitle','locateButton','layersButton','layersTitle','explainButton','explainTitle']);

    //options for creating viewer:
    var options= {
        // default value
        // valeur par défaut
        //territory:'FXX',
        // default value
        // valeur par défaut
        //displayProjection:'IGNF:RGF93G'
        // only usefull when loading external resources
        // utile uniquement pour charger des resources externes
        //proxy:'/geoportail/api/xmlproxy'+'?url='
        // new controls if necessary
        // nouveaux contrôleurs si besoin :
        defaultControls:OpenLayers.Util.extend(
            // clone controls first - on clone les contrôleurs d'abord :
            OpenLayers.Util.extend({},Geoportal.Viewer.Mobile.prototype.defaultControls),
            // add new controls
            // nouveaux contrôleurs additionnels :
            {
                'Geoportal.Control.SimpleLayerSwitcher':{
                    uis: ["Geoportal.UI.JQuery.Mobile"],
                    autoActivate:false
                }
            }
        ),
        // control options - options des contrôleurs :
        controlsOptions:{
            'OpenLayers.Control.ZoomPanel':{
                'OpenLayers.Control.ZoomIn':{
                    div:$("#zoom-panel-plus").get(0)
                },
                'OpenLayers.Control.ZoomToMaxExtent':{
                },
                'OpenLayers.Control.ZoomOut':{
                    div:$("#zoom-panel-minus").get(0)
                }
            },
            'OpenLayers.Control.Geolocate':{
                div:$("#locateButton").get(0),
                watch:true,
                eventListeners:{
                    'locationupdated':function(obj) {
                        var empty= (this.vPosLayer.features.length==0);
                        if (empty) {
                            // first feature is track ...
                            this.vPosLayer.addFeatures([
                                new OpenLayers.Feature.Vector(
                                    new OpenLayers.Geometry.LineString(),
                                    {},
                                    {
                                        strokeColor: '#f00',
                                        strokeWidth: 8
                                    }
                                )
                            ]);
                        } else {
                            // clean up :
                            var line= this.vPosLayer.features[0].geometry;
                            // remove last track' point :
                            this.vPosLayer.features[0].geometry.removeComponents([
                                line.components[line.components-1]
                            ]);
                            // remove current position :
                            this.vPosLayer.removeFeatures([
                                this.vPosLayer.features[1]
                            ]);
                        }
                        // add last point to the track twice :
                        this.vPosLayer.features[0].geometry.addComponents([
                            obj.point, obj.point
                        ]);
                        // add current position :
                        this.vPosLayer.addFeatures([
                            new OpenLayers.Feature.Vector(
                                obj.point,
                                {},
                                {
                                    graphicName: 'cross',
                                    strokeColor: '#99ff00',
                                    strokeWidth: 2,
                                    fillOpacity: 0.8,
                                    fillColor: '#99ff00',
                                    pointRadius: 16
                                }
                            )
                        ]);
                        if (empty) {
                            this.map.zoomTo(10);
                        } else {
                            this.map.zoomToExtent(this.vPosLayer.getDataExtent());
                        }
                    }
                }
            }
        }
    };

    // viewer creation of type <Geoportal.Viewer>
    // création du visualiseur du type <Geoportal.Viewer>
    //                                  HTML div id, options
    viewer= new Geoportal.Viewer.Mobile('viewerDiv', OpenLayers.Util.extend(
        options,
        // API keys configuration variable set by <Geoportal.GeoRMHandler.getConfig>
        // variable contenant la configuration des clefs API remplie par <Geoportal.GeoRMHandler.getConfig>
        window.gGEOPORTALRIGHTSMANAGEMENT===undefined? {'apiKey':'nhf8wztv3m9wglcda6n6cbuf'} : gGEOPORTALRIGHTSMANAGEMENT)
    );
    if (!viewer) {
        // problem ...
        OpenLayers.Console.error(OpenLayers.i18n('new.instance.failed'));
        return;
    }

    // add photos and maps with default settings
    // ajout des cartes avec une opacité à 100%
    viewer.addGeoportalLayers([
        'GEOGRAPHICALGRIDSYSTEMS.MAPS',
        'ORTHOIMAGERY.ORTHOPHOTOS',
        'TRANSPORTNETWORKS.ROADS',
        'GEOGRAPHICALNAMES.NAMES'
    ], {
        'GEOGRAPHICALGRIDSYSTEMS.MAPS':{
            opacity:0.95,
            visibility:true,
            legends:[{
                src:'img/quicklook-maps.jpg',
                style:'quicklook',
                title:'GEOGRAPHICALGRIDSYSTEMS.MAPS',
                width:130,
                height:68
            }]
        },
        'ORTHOIMAGERY.ORTHOPHOTOS':{
            opacity:1.0,
            visibility:false,
            displayInLayerSwitcher:false
        },
        'TRANSPORTNETWORKS.ROADS':{
            opacity:0.75,
            visibility:false,
            displayInLayerSwitcher:false
        },
        'GEOGRAPHICALNAMES.NAMES':{
            opacity:1.0,
            visibility:false,
            displayInLayerSwitcher:false
        }
    });
    // set center at default location and zoom
    // centrage en utilisant la position et la résolution par défaut
    viewer.getMap().setCenter(viewer.viewerOptions.defaultCenter,viewer.viewerOptions.defaultZoom);
    // cache la patience - hide loading image
    viewer.div.style[OpenLayers.String.camelize('background-image')]= 'none';

    // build aggregate:
    // construction de la carte agrégée:
    var mixteLayers= [];
    var mlNames= ['GEOGRAPHICALNAMES.NAMES', 'TRANSPORTNETWORKS.ROADS', 'ORTHOIMAGERY.ORTHOPHOTOS'];
    for (var i= 0, l= mlNames.length; i<l; i++) {
        var lyrs= viewer.getMap().getLayersByName(mlNames[i]);
        for (var j= 0, n= lyrs.length; j<n; j++) {
            if (lyrs[j] instanceof Geoportal.Layer.WMTS) {
                mixteLayers.push(lyrs[j]);
            }
        }
    }
    var mixte= new Geoportal.Layer.Aggregate(
        'Mixte',
        mixteLayers,
        {
            visibility:false,
            minZoomLevel:0,
            maxZoomLevel:17,
            description:'Ortho-imagerie, Réseaux routiers et Toponymes',
            legends:[{
                src:'img/quicklook-mixte.jpg',
                style:'quicklook',
                title:'Mixte',
                width:130,
                height:68
            }]
        }
    );
    viewer.getMap().addLayer(mixte);

    // configure search services
    // configuration de la page de recherche
    setUpSearch();
    // build layers' list
    // construction de la liste des cartes
    (viewer.getMap().getControlsByClass("Geoportal.Control.SimpleLayerSwitcher")[0]).activate();
    // Put track on top of overlays
    // Met la trace au dessus des autres couches
    viewer.getMap().raiseLayer((viewer.getMap().getControlsByClass("OpenLayers.Control.Geolocate")[0]).vPosLayer,99);
}

/**
 * Function: setUpSearch
 */
function setUpSearch() {
    $('#searching-page').live('pageshow', function(event, ui) {
        $('#xls-query').bind('change', function(e) {
            $('#xls-results').empty();
            if ($('#xls-query')[0].value === '') {
                return;
            }
            $.mobile.showPageLoadingMsg();

            // Prevent form send
            e.preventDefault();

            var opts= {
                defaultCenter:viewer.getMap().getCenter(),
                onSuccess:function(r) {
                    // this==Geoportal.Layer.OpenLS.Core.LocationUtilityService
                    if (!this.queriedAddresses) {
                        opts.onFailure.apply(this,[r]);
                        return;
                    }
                    var fs= this.queriedAddresses[0].features;
                    if (!fs) {
                        opts.onFailure.apply(this,[r]);
                        return;
                    }
                    // sort by geoname's type and response accuracy :
                    if (this.isGeonames) {
                        fs= fs.sort(Geoportal.Control.LocationUtilityService.GeoNames.orderBDNyme);
                    }
                    opts.onComplete.apply(viewer.getMap(),[fs, this]);
                },
                onFailure:function(r) {
                    // this==Geoportal.Layer.OpenLS.Core.LocationUtilityService
                    OpenLayers.Console.info("onFailure");
                    opts.onComplete.apply(viewer.getMap(),[[], this]);
                },
                onComplete:function(features, layer) {
                    // this==Geoportal.Map
                    $('#xls-results').hide();
                    for (var i= 0, ilen= features.length; i<ilen; i++) {
                        // closure for capturing each attribute and DOM element :
                        (function(feature,layer) {
                            $('<li>').hide().append($('<p/>', {
                               'html':feature.attributes.address.toHTMLString()
                            })).appendTo('#xls-results').click(function() {
                                $.mobile.changePage($("#mapping-page"));
                                var center= new OpenLayers.LonLat(feature.geometry.x, feature.geometry.y);
                                var zoom= 10;
                                if (layer.isGeonames) {
                                    zoom= Geoportal.Control.LocationUtilityService.GeoNames.setZoomForBDNyme(feature);
                                } else {
                                    zoom= Geoportal.Control.LocationUtilityService.Geocode.prototype.setZoom.apply(layer,[feature]);
                                }
                                viewer.getMap().setCenter(center, zoom);
                            }).show();
                        })(features[i],layer);
                    }
                    $('#xls-results').show().listview('refresh');
                    $.mobile.hidePageLoadingMsg();
                    opts.afterCentered.apply(viewer.getMap(),[]);
                },
                afterCentered:function() {
                    // this==Geoportal.Map
                    $("#xls-query")[0].value= '';
                }
            };
            var searchString= $('#xls-query')[0].value;
            // decide place or address ?
            if (searchString.match(/^(\d+|[^,]+)(,(.+))?,(.+)/)) {
                opts['address']= searchString;
            } else {
                opts['place']= searchString;
            }
            viewer.getMap().setCenterAtLocation(opts);
        });
        // only listen to the first event triggered
        $('#searching-page').die('pageshow', arguments.callee);
    });
}

/**
 * Function: fixContentHeight
 * Fix height of content
 */
function fixContentHeight() {
    var footer= $("div[data-role='footer']:visible"),
        content= $("div[data-role='content']:visible:visible"),
        viewHeight= $(window).height(),
        contentHeight= viewHeight - footer.outerHeight();
    if ((content.outerHeight() + footer.outerHeight()) !== viewHeight) {
        contentHeight-= (content.outerHeight() - content.height() + 1);
        content.height(contentHeight);
    }
    if (window.viewer) {
        viewer.getMap().updateSize();
    } else {
        initMap();
    }
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
    if (checkApiLoading('loadAPI();',['OpenLayers','Geoportal','Geoportal.Viewer','Geoportal.Viewer.Simple','Geoportal.Viewer.Mobile'])===false) {
        return;
    }

    // load API keys configuration, then load the interface
    // on charge la configuration de la clef API, puis on charge l'application
    Geoportal.GeoRMHandler.getConfig(['nhf8wztv3m9wglcda6n6cbuf'], null,null, {
        onContractsComplete: function() {
            $(window).bind("orientationchange resize pageshow", fixContentHeight);
            fixContentHeight();
        }
    });
}

// To execute code whenever a new page is loaded and created in jQuery Mobile,
// you can bind to the pagecreate event.
// Pour exécuter du code quant une nouvelle page est chargée and créée par
// JQuery Mobile, on peut utiliser l'évènement pagecreate.
$(document).delegate("#mapping-page", "pagecreate", loadAPI);
