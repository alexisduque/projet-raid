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
     * Function: getMBP
     * Return element margin, border and padding left and right size.
     *
     * Parameters:
     * e - {DOMElement}
     *
     * Returns:
     * {<OpenLayers.Size>} the total number of pixels at left and right of the
     * given element.
     */
    function getMBP(e) {
        var sl= 0, sr= 0;
        var ml= Geoportal.Util.getComputedStyle(e,"margin-left",true);
        var mr= Geoportal.Util.getComputedStyle(e,"margin-right",true);
        var bl= Geoportal.Util.getComputedStyle(e,"border-left-width",true);
        var br= Geoportal.Util.getComputedStyle(e,"border-right-width",true);
        var pl= Geoportal.Util.getComputedStyle(e,"padding-left",true);
        var pr= Geoportal.Util.getComputedStyle(e,"padding-right",true);
        sl= ml + bl + pl;
        sr= mr + br + pr;
        if (ml==0 && mr==0 && bl==0 && br==0 && pl==0 && pr==0) {
            var html= "<div class='"+e.className+"'>X</div>";
            var realSize= OpenLayers.Util.getRenderedDimensions(html,null,{});
            sl= realSize.w;
            sr= 0;
            realSize= null;
            html= "<div class='"+e.className+"' style='border:0px none!important;'>X</div>";
            realSize= OpenLayers.Util.getRenderedDimensions(html,null,{});
            sl-= realSize.w;
            realSize= null;
        }

        return new OpenLayers.Size(sl,sr);
    }

    /**
     * Class: Geoportal.Control.LayerSwitcher
     * The Geoportal layer switch class "à la Google".
     * Basically, only one overlay is visible at a time ...
     *
     * The control's structure is as follows :
     *
     * (start code)
     * <div id="#{id}" class="gpControlLayerSwitcherSimple olControlNoSelect">
     *   <div id="#{id}_layers_container" class="gpControlLayerSwitcherSimpleGroupDivClass">
     *     <div id="#{id}_#{layer.id} class="gpControlLayerSwitcherSimpleDivClass">
     *       <span id="label_#{layer.id}" class="gpControlLayerSwitcherSimpleSpanClass">name</span>
     *     </div>
     *   </div>
     * </div>
     * (end)
     *
     * Inherits from:
     * - {<Geoportal.Control>}
     */
    Geoportal.Control.LayerSwitcherSimple= OpenLayers.Class(Geoportal.Control, {

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
         * Constructor: Geoportal.Control.LayerSwitcherSimple
         * Build the layer switcher.
         *
         * Parameters:
         * options - {Object}
         */
        initialize: function(options) {
            Geoportal.Control.prototype.initialize.apply(this, arguments);
            this.layerStates= [];
        },

        /**
         * APIMethod: destroy
         * The DOM elements handling base layers are not suppressed.
         */
        destroy: function() {
            OpenLayers.Event.stopObservingElement(this.div);
            this.clearLayersArray("data");
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
            Geoportal.Control.prototype.draw.apply(this,arguments);

            // create layout divs
            this.loadContents();

            // populate div with current info
            this.redraw();

            return this.div;
        },

        /**
         * APIMethod: loadContents
         * Set up the labels and divs for the control.
         * DOM elements for the base layers are not created here.
         */
        loadContents: function() {
            var doc= this.div.ownerDocument;

            // layers list div
            this.dataLayersDiv= doc.createElement("div");
            this.dataLayersDiv.id= this.id+"_layers_container";
            this.dataLayersDiv.className= "gpControlLayerSwitcherSimpleGroupDivClass";
            this.dataLayersDiv.style.display= 'block';
            this.div.appendChild(this.dataLayersDiv);
        },

        /**
         * APIMethod: clearLayersArray
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
                    OpenLayers.Event.stopObservingElement(layer.labelSpan);
                }
            }
            this[layersType + "Layers"]= [];
            this[layersType + "LayersDiv"].innerHTML= "";
        },

        /**
         * APIMethod: checkRedraw
         * Checks if the layer state has changed since the last redraw() call.
         *
         * Returns:
         * {Boolean} The layer state changed since the last redraw() call.
         */
        checkRedraw: function() {
            var redraw= false;
            if ( !this.layerStates.length ||
                 (this.map.layers.length != this.layerStates.length) ) {
                redraw= true;
            } else {
                for (var i=0, len= this.layerStates.length; i<len; i++) {
                    var layerState= this.layerStates[i];
                    var layer= this.map.layers[i];
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
         * APIMethod: redraw
         *  Goes through and takes the current state of the Map and rebuilds the
         *  control to display that state.  Lists each data layer with a checkbox.
         *
         * Returns:
         * {DOMElement} A reference to the DIV DOMElement containing the control
         */
        redraw: function() {
            //if the state hasn't changed since last redraw, no need
            // to do anything. Just return the existing div.
            if (!this.checkRedraw()) {
                return this.div;
            }

            var doc= this.div.ownerDocument;
            var i, j, l= this.map.layers.length;
            var layer;
            // Save state -- for checking layer if the map state changed.
            // We save this before redrawing, because in the process of redrawing
            // we will trigger more visibility changes, and we want to not redraw
            // and enter an infinite loop. Same for opacity changes.
            this.layerStates= [];
            for (i= 0; i < l; i++) {
                layer= this.map.layers[i];
                this.layerStates[i]= {
                    'displayInLayerSwitcher': layer.displayInLayerSwitcher,
                    'name': layer.name,
                    'visibility': layer.visibility,
                    'id': layer.id
                };
            }

            //clear out previous layers
            this.clearLayersArray("data");

            var layers= this.map.layers.slice();
            var groupDiv= this.dataLayersDiv;
            //for (i= l-1; i>=0; i--) {
            for (i= 0; i<l; i++) {
                layer= layers[i];
                var baseLayer= layer.isBaseLayer;
                var layerState= this.layerStates[i];

                // don't want baseLayers ...
                if (layer.displayInLayerSwitcher && !baseLayer) {
                    var layerDiv= doc.createElement("div");
                    layerDiv.id= this.id+"_"+layer.id;
                    layerDiv.className= "gpControlLayerSwitcherSimpleDivClass";
                    groupDiv.appendChild(layerDiv);

                    // create span
                    var labelSpan= doc.createElement("span");
                    labelSpan.id= 'label_' + layer.id;
                    var layerLab= OpenLayers.i18n(layer.name);
                    labelSpan.innerHTML= layerLab;
                    labelSpan.className= "gpControlLayerSwitcherSimpleSpanClass";
                    labelSpan.title= layer.name;
                    if (!layer.visibility) {
                        labelSpan.className+= "NotVisible";
                    }
                    layerDiv.appendChild(labelSpan);
                    OpenLayers.Event.observe(
                        labelSpan,
                        "click",
                        OpenLayers.Function.bindAsEventListener(
                            this.onLabelClick,
                            ({
                                'labelSpan': labelSpan,
                                'layer': layer,
                                'layerSwitcher': this
                            })));

                    this.dataLayers.push({
                        'layer': layer,
                        'labelSpan': labelSpan
                    });
                }
            }

            return this.div;
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
         * labelSpan - {DOMElement}
         * layerSwitcher - {<Geoportal.Control.LayerSwitcher>}
         * layer - {<OpenLayers.Layer>}
         */
        onLabelClick: function(e) {
            this.layerSwitcher.ignoreEvent(e);
            // set the correct visibilities for the overlays
            for (var i= 0, len= this.layerSwitcher.dataLayers.length; i<len; i++) {
                var layerEntry= this.layerSwitcher.dataLayers[i];
                layerEntry.layer.setVisibility(
                    this.layer===layerEntry.layer? true : false
                );
            }
            this.layerSwitcher.redraw();
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
            this.redraw();
        },

        /**
         * APIMethod: ignoreEvent
         * Stop the given event.
         *
         * Parameters:
         * e - {Event} the browser event
         */
        ignoreEvent: function(e) {
            if (e!=null) {
                OpenLayers.Event.stop(e);
            }
        },

        /**
         * APIMethod: mouseDown
         * Register a local 'mouseDown' flag so that we'll know whether or not
         *     to ignore a mouseUp event
         *
         * Parameters:
         * e - {Event} the browser event
         */
        mouseDown: function(e) {
            this.isMouseDown= true;
            this.ignoreEvent(e);
        },

        /**
         * APIMethod: mouseUp
         * If the 'isMouseDown' flag has been set, that means that the drag was
         *     started from within the LayerSwitcher control, and thus we can
         *     ignore the mouseup. Otherwise, let the Event continue.
         *
         * Parameters:
         * e - {Event} the browser event
         */
        mouseUp: function(e) {
            if (this.isMouseDown) {
                this.isMouseDown= false;
                this.ignoreEvent(e);
            }
        },

        /**
         * Constant: CLASS_NAME
         * {String} *"Geoportal.Control.LayerSwitcherSimple"*
         */
        CLASS_NAME: "Geoportal.Control.LayerSwitcherSimple"
    });


    // add translations
    translate();

    // ===========================================================================================================
    // Configuration : change those values to generate a new map !
    // points of interest (POIs) :
    // les points d'intérêt (POIs) :
    var pictosMap= {
        'justice':"http://www.demarches-interactives.fr/api/img/map/administration_justice.png",
        'ambassade':"http://www.demarches-interactives.fr/api/img/map/administration_ambassade.png"
    };
    // one simulates service retrieval - on simule l'accès à une BDD ...
    var poiSet= [{
        // longitude
        lon: 2.129777,
        // latitude
        lat:48.802314,
        // picto's code - code du pictogramme
        picto:"justice",
        // popup's title - titre de la pop-up
        title:"Cour d'appel de Versailles (Eure-et-Loir, Hauts-de-Seine, Val-d'Oise et Yvelines)",
        // popup's body - corps de la pop-up (line break - ligne=|)
        body:"5 rue CarnotRP 1113|78011 VERSAILLES CEDEX"
    },{
        lon:2.315926,
        lat:48.848396,
        picto:"ambassade",
        title:"Service de la légalisation - Ministère des affaires étrangères et européennes",
        body:"57, bd. des Invalides,|75700 Paris."
    },{
        lon:2.345716,
        lat:48.855139,
        picto:"justice",
        title:"Cour d'appel - Paris",
        body:"34 quai des Orfèvres|75055 PARIS CEDEX 01"
    }];

    // Width/Height map - Largeur/Hauteur de la carte
    var mapW= 400;
    var mapH= 400;
    // Zooms
    var mapZ= 10;
    var fullMapZ= 15;

    // ===========================================================================================================

    var xTdom= OpenLayers.Util.getElement('example_title');
    var vWdom= OpenLayers.Util.getElement('viewerDiv');
    var xEdom= OpenLayers.Util.getElement('example_explain');
    var fOdom= OpenLayers.Util.getElement('footer');
    var xCdom= OpenLayers.Util.getElement('example_jscode');

    // process fullscreen first from url :
    var Args= OpenLayers.Util.getParameters();
    var nbArgs= 0;
    for (kArg in Args) if (Args.hasOwnProperty(kArg)) {
        if (kArg=='full') {
            nbArgs++;
        } else {
            // disable other parameters ...
            Args[kArg]= null;
        }
    }
    if (nbArgs>0 && Args.full==='1') {
        // if full parameter set, then enlarge map - si le paramètre full est
        // défini, alors carte en plein navigateur
        var smap= Geoportal.Util.getMaxDimensions();
        var slr= getMBP(OpenLayers.Util.getElement('viewerDiv').parentNode);
        var wmap= smap.w - 3*slr.w;
        var hmap= smap.h - 6*slr.h;
        // hide some elements - cache certains éléments
        xTdom.style.display= 'none';
        xEdom.style.display= 'none';
        xCdom.style.display= 'none';
        // set new size - assignation de la nouvelle taille
        fOdom.style.width= wmap+'px';
        vWdom.style.width= wmap+'px';
        vWdom.style.height= hmap+'px';
        mapZ= fullMapZ;
    } else {
        xTdom.style.width= mapW+'px';
        vWdom.style.width= mapW+'px';
        vWdom.style.height= mapH+'px';
        xEdom.style.width= mapW+'px';
        fOdom.style.width= mapW+'px';
        xCdom.style.width= mapW+'px';
    }
    // create map - création de la carte
    // seek territory based on the first point - recherche du territoire en fonction du premier point:
    var pt0= new OpenLayers.LonLat(poiSet[0].lon, poiSet[0].lat);
    var ter= Geoportal.Catalogue.prototype.findTerritory.apply(this, [pt0]);
    viewer= new Geoportal.Viewer.Default(           // Default viewer (one could use Geoportal.Viewer.Standard)
            "viewerDiv",                            // div id where to display dataset
            OpenLayers.Util.extend({                // viewer parameters :
                mode:'mini',
                territory:ter,                      // territory
                displayProjection:'CRS:84',
                nameInstance:'viewer'
                },
                gGEOPORTALRIGHTSMANAGEMENT          // API configuration with regard to the API key
            )
        );
    if (!viewer) {
        alert(OpenLayers.i18n('new.instance.failed'));
        return;
    }
    var zmCntrl= new OpenLayers.Control.ZoomPanel();
    viewer.getMap().addControl(zmCntrl);
    var lsCntrl= new Geoportal.Control.LayerSwitcherSimple({autoActivate:true});
    viewer.getMap().addControl(lsCntrl);

    viewer.addGeoportalLayer('GEOGRAPHICALGRIDSYSTEMS.MAPS',{
        name:'Cartes',
        opacity:0.6,
        visibility:true
    });
    // layers in the reverse order of insertion - couches dans l'ordre inverse du dessin :
    var lyrs=     ['TRANSPORTNETWORKS.ROADS', 'ORTHOIMAGERY.ORTHOPHOTOS'];
    var lyrsOpts= [{opacity:0.6},                  {opacity:1.0}];
    var mixteLayers= [];
    for (var i= 0, l= lyrs.length, n= viewer.getMap().layers.length; i<l; i++) {
        var lyrId= lyrs[i];
        var lyrOpt= lyrsOpts[i];
        viewer.addGeoportalLayer(
            lyrId,
            OpenLayers.Util.extend({
                visibility:false,
                displayInLayerSwitcher:false
            },lyrOpt)
        );
        var nn= viewer.getMap().layers.length;
        if (nn>n) {// layers just added (1 territory, 1 world at best - couches que l'on vient d'ajouter (1 territoire, 1 monde au mieux)
            for (var j=nn-1; j>=n; j--) {
                var lyr= viewer.getMap().layers[j];
                if (lyr.territory==ter) {
                    mixteLayers.push(lyr);
                    n= nn;
                    break;
                }
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
            description:'Ortho-imagerie et Réseaux routiers'
        }
    );
    viewer.getMap().addLayer(mixte);

    var osm= new Geoportal.Layer.Grid(
        'OpenStreetMap (Mapnik)',
        "http://tile.openstreetmap.org/${z}/${x}/${y}.png",
        {},
        {
            isBaseLayer:false,
            zoomOffset:0,
            sphericalMercator:false,
            projection:new OpenLayers.Projection("EPSG:900913"),
            units:"m",
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
            maxExtent:new OpenLayers.Bounds(-20037508, -20037508, 20037508, 20037508),
            tileOrigin:new OpenLayers.LonLat(0,0),
            visibility:false,
            originators:[{
                logo:'osm',
                pictureUrl:'http://wiki.openstreetmap.org/Wiki.png',
                url:'http://wiki.openstreetmap.org/wiki/WikiProject_France'
            }],
            opacity:1.0,
            destroy:function () {
                this.nativeMaxExtent = null;
                Geoportal.Layer.Grid.prototype.destroy.apply(this, arguments);
            },
            getURL:function (bounds) {
                var res= this.nativeResolution;
                var x= Math.round((bounds.left - this.nativeMaxExtent.left)
                    / (res * this.nativeTileSize.w));
                var y= Math.round((this.nativeMaxExtent.top - bounds.top)
                    / (res * this.nativeTileSize.h));
                var z= this.map.getZoom() + this.zoomOffset;

                var url= this.url;
                var s= '' + x + y + z;
                if (url instanceof Array) {
                    url= this.selectUrl(s, url);
                }

                var path= OpenLayers.String.format(url, {'x': x, 'y': y, 'z': z});

                return path;
            },
            addTile:function(bounds,position,size) {
                return new Geoportal.Tile.Image(this, position, bounds, null, size);
            }
        }
    );
    viewer.getMap().addLayer(osm);

    // center the map on the first point or on the extent's center - on se centre sur le premier point ou sur le centre de l'emprise :
    if (poiSet.length==1) {
        viewer.getMap().setCenterAtLonLat(pt0.lon, pt0.lat, ter=='WLD'? 4 : mapZ);
    } else {
        var lmin= 180, pmin= 90, lmax= -180, pmax= -90;
        for (var i= 0, l= poiSet.length; i<l; i++) {
            if (poiSet[i].lon<lmin) { lmin= poiSet[i].lon; }
            if (poiSet[i].lon>lmax) { lmax= poiSet[i].lon; }
            if (poiSet[i].lat<pmin) { pmin= poiSet[i].lat; }
            if (poiSet[i].lat>pmax) { pmax= poiSet[i].lat; }
        }
        viewer.getMap().setCenterAtLonLat((lmax+lmin)/2, (pmax+pmin)/2, ter=='WLD'? 4 : mapZ);
    }

    // we create the markers layer - on crée la couche de ponctuels:
    var markers= new OpenLayers.Layer.Vector("POIs",{
        displayInLayerSwitcher:false,
        projection:OpenLayers.Projection.CRS84,
        visibility:false,
        styleMap:new OpenLayers.StyleMap(
            new OpenLayers.Style({
                cursor:"pointer",
                // display icon based on type property - on va chercher le picto en fonction de la valeur de la propriété type
                externalGraphic:"${getPicto}",
                graphicWidth:22,
                graphicHeight:22,
                backgroundGraphic:"http://www.demarches-interactives.fr/api/img/icons/shadow.png", // 26*26
                backgroundWidth:26,
                backgroundHeight:26,
                backgroundXOffset:-11,//-26/2 + 2
                backgroundYOffset:-11 //-26/2 + 2
            },{
                // display rule - règle d'affichage :
                context:{
                    getPicto:function(f) {
                        return pictosMap[f.attributes.type];
                    }
                }
            })
        ),
        eventListeners:{
            // we just inserted the marker - on vient d'ajouter le marqueur ...
            // we create the popup - on crée la pop-up !
            "featureadded"        :function(o) {
                if (!o || !o.feature) { return false; }
                if (!o.feature.popup) {
                    o.feature.popup= new OpenLayers.Popup.FramedCloud(
                        "icons",
                        o.feature.geometry.getBounds().getCenterLonLat(),
                        null,
                        "<div class='acpopup'>"+
                            "<h3>"+OpenLayers.i18n(o.feature.attributes.titre)+"</h3>"+
                            "<p>"+OpenLayers.i18n(o.feature.attributes.adresse).replace(/\|/g,"</p><p>")+"</p>"+
                        "</div>",
                        null,
                        true
                    );
                    o.feature.popup.autoSize= true;
                    o.feature.popup.contentDiv.style.overflow= 'auto';
                }
                return true;
            },
            // we are going to remove the marker - on va détruire le marqueur ...
            // we close the popup - on ferme la pop-up
            "beforefeatureremoved":function(o) {
                if (!o || !o.feature) { return false; }
                if (o.feature.popup) {
                    o.feature.popup.hide();
                }
                return true;
            }
        }
    });
    viewer.getMap().addLayer(markers);

    // POIs addition - ajout des POIs:
    var features= [];
    for (var i= 0, l= poiSet.length; i<l; i++) {
        var f= new OpenLayers.Feature.Vector(
            new OpenLayers.Geometry.Point(poiSet[i].lon, poiSet[i].lat),
            {
                id:''+i,
                type:poiSet[i].picto,
                titre:poiSet[i].title,
                adresse:poiSet[i].body
            });
        f.geometry.transform(markers.getNativeProjection(),viewer.getMap().getProjection());
        features.push(f);
    }
    markers.addFeatures(features);

    // control for selecting POIs - on active le clic sur les POIs:
    var selector= new OpenLayers.Control.SelectFeature(markers, {
        autoActivate:true,
        toggle: true,   // allows switching popup on and off - permet de sélectionner en recliquant sur le pictogramme
        // a click on the picto shows the popup - sur le clic, on affiche la pop-up
        onSelect: function(f) {
            if (f && f.popup) {
                if (OpenLayers.Util.indexOf(f.layer.map.popups,f.popup)==-1 &&
                    viewer.getMap().getExtent().containsLonLat(f.popup.lonlat,false)) {
                    f.layer.map.addPopup(f.popup);
                }
                f.popup.show();
            }
        },
        // another click hides the popup - sur un autre clic, on cache la pop-up
        onUnselect: function(f) {
            if (f && f.popup) {
                f.popup.hide();
            }
        },
        handlersOptions: {
            feature:{
                stopDown:false //prevent map's panning when panning picto - permet de déplacer la carte en déplaçant le pictogramme
            }
        }
    });
    viewer.getMap().addControl(selector);

    // display POIs - on affiche les POIs:
    if (features.length>1) {
        viewer.getMap().zoomToExtent(markers.getDataExtent());
    }
    markers.setVisibility(true);
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
