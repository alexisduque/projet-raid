/*
 * Copyright (c) 2008-2013 Institut National de l'information Geographique et forestiere France, released under the
 * BSD license.
 */
/**
 * Property: viewer
 * {<Geoportal.Viewer>} the viewer global instance.
 */
var viewer= null;

/**
 * Function: initMap
 * Load the application. Called when all information have been loaded by
 * <loadAPI>().
 */
function initMap() {
    //The api is loaded at this step
    //L'api est chargée à cette étape

    // ==========================================================================================================

    /*
     * Copyright (c) 2008-2010 Institut National de l'information Geographique et forestiere France, released
     * under the BSD license.
     */
    /*
     * AT.requires Geoportal/Viewer.js
     * AT.requires Geoportal/Util.js
     * AT.requires Geoportal/Control/Logo.js
     */
    /**
     * Class: Geoportal.Viewer.Basic
     * A viewer that mimic default OpenLayers map !
     * Class which must be instanciated to create a map viewer. This is a
     * helper class of the API for embedding a <Geoportal.Map>.
     *
     * Inherits from:
     *  - <Geoportal.Viewer>
     */
    Geoportal.Viewer.Basic= OpenLayers.Class( Geoportal.Viewer, {

        /**
         * Property: defaultControls
         * {Object} Control's that are added to the viewer.
         *      Currently supported controls are:
         *      * <OpenLayers.Control.KeyboardDefaults> ;
         *      * <Geoportal.Control.Logo> ;
         */
        defaultControls: {
            'OpenLayers.Control.KeyboardDefaults':{
                activeOverMapOnly: true
            },
            'Geoportal.Control.Logo':{
                logoSize: 0,
                destroy: function() {
                    if (this.map.getApplication()) {
                        this.map.getApplication().logoCntrl= null;
                    }
                    Geoportal.Control.Logo.prototype.destroy.apply(this,arguments);
                },
                viewerProperty: 'logoCntrl'
            }
        },

        /**
         * Constructor: Geoportal.Viewer.Basic
         * Generates the Geoportal OpenLayers like viewer. Controls are not
         * automatically added by the viewer as it is the case for
         * <Geoportal.Viewer.Default> and <Geoportal.Viewer.Standard>.
         *
         * Parameters:
         * div - {String} Id of the DIV tag in which you want
         *       to insert your viewer.
         *       Default is "geoportalViewerDiv".
         * options - {Object} Optional object with properties to
         *       tag onto the viewer.
         *       Supported options are : mode, territory,
         *       projection, displayProjection, proxy,
         *       nameInstance, [apiKey], {apiKey{}}, tokenServerUrl, tokenTtl.
         *       * mode defaults to *normal*
         *       * territory defaults to *FXX*
         *       * nameInstance defaults to *geoportalMap*
         *       Other options like resolutions, center, minExtent, maxExtent,
         *       zoom, minZoomLevel, maxZoomLevel, scales, minResolution,
         *       maxResolution,
         *       minScale, maxScale, numZoomLevels, events, restrictedExtent,
         *       fallThrough, eventListeners are handed over to the
         *       underlaying
         *       <Geoportal.Map>.
         */
        initialize: function(div, options) {
            if (this.defaultControls['Geoportal.Control.Logo'].logoSize==0) {
                this.defaultControls['Geoportal.Control.Logo'].logoSize=
                    Geoportal.Control.Logo.WHSizes.normal;
            }
            Geoportal.Viewer.prototype.initialize.apply(this,arguments);
        },

        /**
         * APIMethod: render
         * Render the map to a specified container.
         *
         * Parameters:
         * div - {String|DOMElement} The container that the map should be rendered
         *     to. If different than the current container, the map viewport
         *     will be moved from the current to the new container.
         */
        render: function(div) {
            if (this.getMap()) {
                this.getMap().render(div);
            }
        },

        /**
         * APIMethod: loadLayout
         * {Function} Called before creating the {<Geoportal.Map>} map.
         *      It expects an object parameter taken from options.layoutOptions of
         *      the constructor.
         *      It returns the id of the <OpenLayers.Map> div.
         *
         * Parameters:
         * options - {Object}
         *
         * Returns:
         * {DOMElement} the OpenLayers map's div.
         */
        loadLayout: function(options) {
            this.div.style.overflow= "hidden";

            OpenLayers.Element.addClass(this.div, 'gpMainMap');
            OpenLayers.Element.addClass(this.div, 'gpMainMapCellSimple');
            OpenLayers.Element.addClass(this.div, 'olMap');
            OpenLayers.Element.addClass(this.div, 'gpMap');
            return this.div;
        },

        /**
         * APIMethod: setSize
         * Defines the view viewer size.
         *
         * Parameters:
         * width - {String} The new width of the viewer.
         * height - {String} The new height of the viewer.
         * rendered size.
         */
        setSize: function(width, height) {
            width= typeof(width)=='number'? width+'px':width;//ensure compatibility with width in pixels
            var w= Geoportal.Util.convertToPixels(width,true);
            height= typeof(height)=='number'? height+'px':height;//ensure compatibility with height in pixels
            var h= Geoportal.Util.convertToPixels(height,false);

            var wg= this.div.offsetWidth - w;
            this.div.style.width= width;
            var hg= this.div.offsetHeight - h;
            this.div.style.height= height;
            this.getMap().updateSize();
            if (wg!=0 || hg!=0) {//width or height has changed ...
                // force computation :
                this.render(this.div);
            }
        },

        /**
         * Constant: CLASS_NAME
         * {String} *"Geoportal.Viewer.Basic"*
         */
        CLASS_NAME: "Geoportal.Viewer.Basic"
    });

    /*
     * Copyright (c) 2008-2010 Institut National de l'information Geographique et forestiere France, released
     * under the BSD license.
     */
    /*
     * AT.requires Geoportal/Control/LayerSwitcher.js
     */
    /**
     * Class: Geoportal.Control.TreeLayerSwitcher
     * Layer switcher class that display layers using a tree.
     *
     * The control's structure is as follows :
     *
     * (start code)
     * <div id="#{id}" class="gpControlTreeLayerSwitcher olControlNoSelect gpMainDivClass">
     *   <div id="#{id}_layersDiv" class="gpLayersClass">
     *     <div id="#{id}_layer_title" class="gpControlLabelClass"></div>
     *     <div id="#{id}_layers_container" class="gpGroupDivClass">
     *       <div id="#{id}_#{layer.id} class="gpLayerDivClass">
     *         <div class="gpLayerNameGroupDivClass">
     *           <div id="node1_#{layer.id}" class="gpTree gpBar|gpCorner|gpTee|gpCornerPlus|gpCornerMinus|gpTeePlus|gpTeeMinus" title=""></div>
     *           <div id="node2_#{layer.id}" class="gpTree gpLine|gpCorner|gpTee|gpCheckedAggregate|gpPartialCheckedAggregate|gpUnCheckedAggregate" title=""></div>
     *           <div id="node3_#{layer.id}" class="gpTree gpLayerVisible|gpLayerNotVisible" title=""></div>
     *           <div id="node4_#{layer.id}" class="gpTree gpLayerQueryable|gpLayerNotQueryable|gpLayerQueryableForbidden" title=""></div>
     *           <div id="node5_#{layer.id}" class="gpTree gpLayerFeatureQueryable|gpLayerFeatureNotQueryable|gpBlank"></div>
     *           <div id="basic_#{LayerId}" class="gpControlBasicLayerToolbar olControlNoSelect" style="display:"></div>
     *           <div id="buttonsChangeOrder_#{layer.id} class="gpButtonsChangeOrderClass">
     *             <div id="buttonUp_#{layer.id} class="gpButtonUp"></div>
     *             <div id="buttonDown_#{layer.id} class="gpButtonDown"></div>
     *           </div>
     *           <span id="label_#{layer.id}" class="gpLayerSpanClass">name</span>
     *           <div id="loading_#{layer.id} class="gpControlLoading olControlNoSelect" style="display:"></div>
     *         </div>
     *       </div>
     *     </div>
     *   </div>
     * </div>
     * (end)
     *
     * Inherits from:
     * - {<Geoportal.Control.LayerSwitcher>}
     */
    Geoportal.Control.TreeLayerSwitcher= OpenLayers.Class( Geoportal.Control.LayerSwitcher, {
        /**
         * Constant: EVENT_TYPES
         * {Array(String)} Supported application event types.
         *      Events are :
         *      - *beforegroupopened* Triggered before opening an aggregate;
         *      - *beforegroupclosed* Triggered before closing an aggregate;
         *      - *groupopened* Triggered after opening an aggregate;
         *      - *groupclosed* Triggered after closing an aggregate.
         */
        EVENT_TYPES: ["beforegroupopened", "groupopened",
                      "beforegroupclosed", "groupclosed"],

        /**
         * Property: layersMap
         * {Object} A map of layer's id and their rank in the layerStates array.
         *
         */
        layersMap: null,

        /**
         * Constructor: Geoportal.Control.TreeLayerSwitcher
         * Build the layer switcher.
         *
         * Parameters:
         * options - {Object}
         */
        initialize: function(options) {
            // concatenate events specific to this control with those from the base
            this.EVENT_TYPES =
                Geoportal.Control.TreeLayerSwitcher.prototype.EVENT_TYPES.concat(
                Geoportal.Control.LayerSwitcher.prototype.EVENT_TYPES
            );
            Geoportal.Control.LayerSwitcher.prototype.initialize.apply(this, arguments);
            this.layersMap= {};
        },

        /**
         * APIMethod: destroy
         * The DOM elements handling base layers are not suppressed.
         */
        destroy: function() {
            this.layersMap= null;
            Geoportal.Control.LayerSwitcher.prototype.destroy.apply(this, arguments);
        },

        /**
         * APIMethod: clearLayersArray
         * User specifies either "base" or "data". we then clear all the
         *     corresponding listeners, the div, and reinitialize a new array.
         *
         * Parameters:
         * layersType - {String}
         */
        clearLayersArray: function(layersType) {
            var layers= this[layersType + "Layers"];
            if (layers) {
                for(var i= 0, len= layers.length; i<len; i++) {
                    var layer= layers[i];
                    if (layer.isAnAggregate) {
                        OpenLayers.Event.stopObservingElement(layer.d1);
                        OpenLayers.Event.stopObservingElement(layer.d2);
                    } else {
                        OpenLayers.Event.stopObservingElement(layer.d3);
                        OpenLayers.Event.stopObservingElement(layer.d4);
                    }
                    OpenLayers.Event.stopObservingElement(layer.labelSpan);
                    OpenLayers.Event.stopObservingElement(OpenLayers.Util.getElement("buttonUp_"+layer.id));
                    OpenLayers.Event.stopObservingElement(OpenLayers.Util.getElement("buttonDown_"+layer.id));
                }
            }
            this[layersType + "LayersDiv"].innerHTML= "";
            this[layersType + "Layers"]= [];
        },

        /**
         * APIMethod: redraw
         *  Goes through and takes the current state of the Map and rebuilds the
         *  control to display that state.  Show layers using folder tree display.
         *
         * Returns:
         * {DOMElement} A reference to the DIV DOMElement containing the control
         */
        redraw: function() {
            //if the state hasn't changed since last redraw, no need
            // to do anything. Just return the existing div.
            if (!Geoportal.Control.TreeLayerSwitcher.prototype.checkRedraw.apply(this,arguments)) {
                return this.div;
            }

            var i, j, l= this.map.layers.length;
            var layer;
            // Save state -- for checking layer if the map state changed.
            // We save this before redrawing, because in the process of redrawing
            // we will trigger more visibility changes, and we want to not redraw
            // and enter an infinite loop. Same for opacity changes.
            this.layerStates= [];
            this.layersMap= {};
            for (i= 0; i<l; i++) {
                layer= this.map.layers[i];
                // adding preventControls option to disallow some control's class by the user
                if (!layer.preventControls) {
                    layer.preventControls= {};
                }
                OpenLayers.Util.extend(layer.preventControls, this.preventControls);
                this.layerStates[i]= {
                    'displayInLayerSwitcher': layer.displayInLayerSwitcher,
                    'name': layer.name,
                    'visibility': layer.visibility,
                    'opacity': layer.opacity,
                    'inRange': layer.inRange,
                    'id': layer.id,
                    'visibilityRatio': this.dataLayers && this.dataLayers[i]? this.dataLayers[i].visibilityRatio || 0 : 0,
                    'unfolded': this.dataLayers && this.dataLayers[i]? this.dataLayers[i].unfolded : undefined
                };
                for (var x in this.cntrlKeys) {
                    var cntrl= this.map.getControl(x+'_'+this.layerStates[i].id);
                    if (cntrl) {
                        var searchDiv= cntrl.div;
                        if (searchDiv.parentNode!=null) {
                            searchDiv.parentNode.removeChild(searchDiv);
                        }
                    }
                }
                this.layersMap[layer.id]= i;
            }

            //clear out previous layers, build clean array :
            this.clearLayersArray("data");
            this.dataLayers= [];
            for (i= 0; i<l; i++) {
                this.dataLayers.push({});
            }

            var containsOverlays= false;

            var layers= this.map.layers.slice();
            var groupDiv= this.dataLayersDiv;
            var lup= false, ldown= false;
            for (i= l-1; i>=0; i--) {
                // don't want baseLayers ...
                if (layers[i].displayInLayerSwitcher && !layers[i].baseLayer) {
                    containsOverlays= true;
                    layer= layers[i];

                    var infos= this.drawLayer(layers,l,i,this.layerStates[i]);
                    groupDiv.appendChild(infos.elem);

                    this.dataLayers[i]= {
                        'layer': layer,
                        'inputElem': infos.elem,
                        'd1': infos.d1,
                        'd2': infos.d2,
                        'd3': infos.d3,
                        'd4': infos.d4,
                        'd5': infos.d5,
                        'labelSpan': infos.span,
                        'isAnAggregate': layer.layers!=null,
                        'isAggregated': false,
                        'visibilityRatio': layer.layers!=null? this.layerStates[i].visibilityRatio : 0,
                        'unfolded': layer.layers!=null? this.layerStates[i].unfolded : undefined
                    };

                    if (layer.layers!=null) {
                        // display aggregation's content
                        var innerLayers= layer.layers.slice();
                        var ll= innerLayers.length;
                        for (var ii= ll-1; ii>=0; ii--) {
                            var lyr= innerLayers[ii];
                            var rank= this.layersMap[lyr.id];
                            var innerInfos= this.drawLayer(innerLayers,ll,ii,this.layerStates[rank]);
                            // is the aggregate open ?
                            if (this.layerStates[i].unfolded!==true) {
                                innerInfos.elem.style.display= 'none';
                            }
                            groupDiv.appendChild(innerInfos.elem);
                            // insert at the right rank (same as map's layers'
                            // rank !)
                            this.dataLayers[rank]= {
                                'layer': lyr,
                                'inputElem': innerInfos.elem,
                                'd1': innerInfos.d1,
                                'd2': innerInfos.d2,
                                'd3': innerInfos.d3,
                                'd4': innerInfos.d4,
                                'd5': innerInfos.d5,
                                'labelSpan': innerInfos.span,
                                'isAnAggregate': false,
                                'isAggregated': true,
                                'visibilityRatio': 0,
                                'unfolded': undefined
                            };
                        }
                    }
                }
            }

            if (!this.outsideViewport) {
                // if no overlays, don't display the overlay label
                this.dataLbl.style.display= containsOverlays? '' : 'none';
            }

            return this.div;
        },

        /**
         * Method: drawLayer
         * Build the layer's informations in the switcher.
         *
         * Parameters:
         * layers - {<OpenLayers.Layer>} the array of layers the current layer belongs to.
         * len - {Integer} total number of layers in the array.
         * rank - {Integer} the current layer's position within the array of layers.
         * state - {Object} the current layer's state.
         *
         * Returns:
         * {Object} An object {'elem', 'd1', 'd2', 'd3', 'd4', 'd5', 'span'} having the div
         * containing the layer's informations and its span.
         */
        drawLayer: function(layers,len,rank,state) {
            var layer= layers[rank];
            var checked= layer.getVisibility();
            var isAnAggregate= layer.layers!=null;
            var isAggregated= layer.aggregate!=null;
            var layerDiv= document.createElement("div");
            layerDiv.id= this.id+"_"+layer.id;
            layerDiv.className= "gpLayerDivClass";
            layerDiv.checked= checked;

            // +, -, |-, -, | icon :
            var d1= document.createElement('div');
            d1.id= "node1_"+layer.id;
            OpenLayers.Element.addClass(d1, 'gpTree');
            var isLast= true;
            for (var j=rank-1; j>=0; j--) {
                if (((!isAggregated && layers[j].displayInLayerSwitcher) || isAggregated) && !layers[j].baseLayer) {
                    isLast= false;
                    break;
                }
            }
            var isFirst= true;
            for (var j= rank+1; j<len; j++) {
                if (((!isAggregated && layers[j].displayInLayerSwitcher) || isAggregated) && !layers[j].baseLayer) {
                    isFirst= false;
                    break;
                }
            }
            if (isAnAggregate) {
                if (isLast) {
                    if (state.unfolded===true) {
                        OpenLayers.Element.addClass(d1, 'gpCornerMinus');
                    } else {
                        OpenLayers.Element.addClass(d1, 'gpCornerPlus');
                    }
                } else {
                    if (state.unfolded===true) {
                        OpenLayers.Element.addClass(d1, 'gpTeeMinus');
                    } else {
                        OpenLayers.Element.addClass(d1, 'gpTeePlus');
                    }
                }
                if (state.unfolded===true) {
                    d1.title= OpenLayers.i18n('gpControlTreeLayerSwitcher.aggregate.unfolded.title');
                } else {
                    d1.title= OpenLayers.i18n('gpControlTreeLayerSwitcher.aggregate.folded.title');
                }
            } else {
                if (isAggregated) {
                    OpenLayers.Element.addClass(d1, 'gpBar');
                } else {
                    if (isLast) {
                        OpenLayers.Element.addClass(d1, 'gpCorner');
                    } else {
                        OpenLayers.Element.addClass(d1, 'gpTee');
                    }
                }
            }
            OpenLayers.Event.observe(
                d1,
                "click",
                OpenLayers.Function.bindAsEventListener(
                    this.onFolderClick,
                    ({
                        'inputElem': layerDiv,
                        'd1': d1,
                        'layer': layer,
                        'isLast': isLast,
                        'layerSwitcher': this
                    })));
            layerDiv.appendChild(d1);

            // X, - icon :
            var d2= document.createElement('div');
            d2.id= "node2_"+layer.id;
            OpenLayers.Element.addClass(d2, 'gpTree');
            if (isAnAggregate) {
                state.visibilityRatio= 0;
                for (var ii= 0, ll= layer.layers.length; ii<ll; ii++) {
                    if (layer.layers[ii].getVisibility()) {
                        state.visibilityRatio+= 1;
                    }
                }
                if (checked) {
                    d2.title= OpenLayers.i18n('gpControlTreeLayerSwitcher.aggregate.checked.title');
                    if (state.visibilityRatio==layer.layers.length) {
                        OpenLayers.Element.addClass(d2, 'gpCheckedAggregate');
                    } else {
                        OpenLayers.Element.addClass(d2, 'gpPartialCheckedAggregate');
                    }
                } else {
                    d2.title= OpenLayers.i18n('gpControlTreeLayerSwitcher.aggregate.unchecked.title');
                    OpenLayers.Element.addClass(d2, 'gpUnCheckedAggregate');
                }
                layerDiv.visibilityRatio= state.visibilityRatio;
            } else {
                if (isAggregated) {
                    if (isLast) {
                        OpenLayers.Element.addClass(d2, 'gpCorner');
                    } else {
                        OpenLayers.Element.addClass(d2, 'gpTee');
                    }
                } else {
                    OpenLayers.Element.addClass(d2, 'gpLine');
                }
            }
            OpenLayers.Event.observe(
                d2,
                "click",
                OpenLayers.Function.bindAsEventListener(
                    this.onCheckClick,
                    ({
                        'inputElem': layerDiv,
                        'd2': d2,
                        'layer': layer,
                        'layerSwitcher': this
                    })));
            layerDiv.appendChild(d2);

            var d3= null, d4= null, d5= null;
            if (!isAnAggregate) {
                // o, x icon :
                d3= document.createElement('div');
                d3.id= "node3_"+layer.id;
                OpenLayers.Element.addClass(d3, 'gpTree');
                if (checked) {
                    d3.title= OpenLayers.i18n('gpControlTreeLayerSwitcher.layer.checked.title');
                    OpenLayers.Element.addClass(d3, 'gpLayerVisible');
                } else {
                    d3.title= OpenLayers.i18n('gpControlTreeLayerSwitcher.layer.unchecked.title');
                    OpenLayers.Element.addClass(d3, 'gpLayerNotVisible');
                }
                //FIXME: title (minScale/maxScale)
                OpenLayers.Event.observe(
                    d3,
                    "click",
                    OpenLayers.Function.bindAsEventListener(
                        this.onInputClick,
                        ({
                            'inputElem': layerDiv,
                            'd3': d3,
                            'layer': layer,
                            'layerSwitcher': this
                        })));
                layerDiv.appendChild(d3);

                // i icon
                d4= document.createElement('div');
                d4.id= "node4_"+layer.id;
                OpenLayers.Element.addClass(d4, 'gpTree');
                if (layer instanceof OpenLayers.Layer.WMS) {
                    if (layer.queryable===true) {
                        if (checked) {
                            d4.title= OpenLayers.i18n('gpControlTreeLayerSwitcher.wmslayer.queryable.checked.title');
                            OpenLayers.Element.addClass(d4, 'gpLayerQueryable');
                        } else {
                            d4.title= OpenLayers.i18n('gpControlTreeLayerSwitcher.wmslayer.queryable.unchecked.title');
                            OpenLayers.Element.addClass(d4, 'gpLayerQueryableForbidden');
                        }
                    } else {
                        if (layer.queryable===false) {
                            if (checked) {
                                d4.title= OpenLayers.i18n('gpControlTreeLayerSwitcher.wmslayer.notqueryable.checked.title');
                                OpenLayers.Element.addClass(d4, 'gpLayerNotQueryable');
                            } else {
                                d4.title= OpenLayers.i18n('gpControlTreeLayerSwitcher.wmslayer.notqueryable.unchecked.title');
                                OpenLayers.Element.addClass(d4, 'gpLayerQueryableForbidden');
                            }
                        } else {
                            d4.title= OpenLayers.i18n('gpControlTreeLayerSwitcher.wmslayer.notqueryable.unchecked.title');
                            OpenLayers.Element.addClass(d4, 'gpLayerQueryableForbidden');
                        }
                    }
                } else {
                    d4.title= OpenLayers.i18n('gpControlTreeLayerSwitcher.layer.notwmsqueryable.title');
                    OpenLayers.Element.addClass(d4, 'gpBlank');
                }
                var context4= {
                };
                OpenLayers.Event.observe(
                    d4,
                    "click",
                    OpenLayers.Function.bindAsEventListener(
                        this.onQueryableClick,
                        ({
                            'inputElem': layerDiv,
                            'd4': d4,
                            'layer': layer,
                            'layerSwitcher': this
                        })));
                layerDiv.appendChild(d4);

                //FIXME: # icon : GetFeature ?
                d5= document.createElement('div');
                d5.id= "node5_"+layer.id;
                OpenLayers.Element.addClass(d5, 'gpTree');
                if (layer instanceof OpenLayers.Layer.WFS) {
                    if (layer.queryable===true && checked) {
                        d5.title= OpenLayers.i18n('gpControlTreeLayerSwitcher.wfslayer.queryable.checked.title');
                        OpenLayers.Element.addClass(d5, 'gpLayerFeatureQueryable');
                    } else {
                        d5.title= OpenLayers.i18n('gpControlTreeLayerSwitcher.wfslayer.notqueryable.checked.title');
                        OpenLayers.Element.addClass(d5, 'gpLayerFeatureNotQueryable');
                    }
                } else {
                    d5.title= OpenLayers.i18n('gpControlTreeLayerSwitcher.layer.notwfsqueryable.title');
                    OpenLayers.Element.addClass(d5, 'gpBlank');
                }
                layerDiv.appendChild(d5);

                // trash, opacity slider, zoom to extent icons :
                if (layer.preventControls['Geoportal.Control.BasicLayerToolbar']!==true &&
                    ((layer.view && (layer.view.drop || layer.view.zoomToExtent)) ||
                     (layer.opacity!=undefined))) {
                    var ctrlId= 'basic_'+layer.id;
                    var basicCtrl= this.map.getControl(ctrlId);
                    if (basicCtrl) {
                        layerDiv.appendChild(basicCtrl.div);
                        for (var ibc= 0, lbc= basicCtrl.controls.length; ibc<lbc; ibc++) {
                            if (basicCtrl.controls[ibc] instanceof Geoportal.Control.LayerOpacity) {
                                basicCtrl.controls[ibc].refreshOpacity();
                                break;
                            }
                        }
                    } else {
                        var basicCtrlDiv= document.createElement('div');
                        basicCtrlDiv.id= ctrlId;
                        basicCtrlDiv.className= 'gpControlBasicLayerToolbar olControlNoSelect';
                        //TODO: title = opacity%
                        var basicCtrl= new Geoportal.Control.BasicLayerToolbar(
                                                layer, {
                                                    id : basicCtrlDiv.id,
                                                    div: basicCtrlDiv
                                                });
                        layerDiv.appendChild(basicCtrlDiv);
                        this.map.addControl(basicCtrl);
                        for (var ibc= 0, lbc= basicCtrl.controls.length; ibc<lbc; ibc++) {
                            if (basicCtrl.controls[ibc] instanceof Geoportal.Control.PanelToggle) {
                                basicCtrl.activateControl(basicCtrl.controls[ibc]);
                            }
                        }
                    }
                }

            }

            // Layers order management:
            var buttons= document.createElement('div');
            buttons.idt='buttonsChangeOrder'+layer.id;
            buttons.className= 'gpButtonsChangeOrderClass';
            layerDiv.appendChild(buttons);

            // Moving a layer up ...
            var buttonUp= document.createElement('div');
            buttonUp.id="buttonUp_" +layer.id;
            buttonUp.className= "gpButtonUp";
            // if it is the first displayed in layer stack ...
            if (isFirst) {
                buttonUp.className+= "Deactive";
            }
            OpenLayers.Event.observe(
                buttonUp,
                "click",
                OpenLayers.Function.bindAsEventListener(
                    this.onButtonUpClick,
                    ({
                        'layerSwitcher':this,
                        'layerRank':isAggregated? this.layersMap[layer.id] : rank
                    })
                ));
            buttons.appendChild(buttonUp);

            //Moving a layer down ...
            var buttonDown= document.createElement('div');
            buttonDown.id="buttonDown_" +layer.id;
            buttonDown.className= "gpButtonDown";
            // if it is the last displayed in layer stack ...
            if (isLast) {
                buttonDown.className+= "Deactive";
            }
            OpenLayers.Event.observe(
                buttonDown,
                "click",
                OpenLayers.Function.bindAsEventListener(
                    this.onButtonDownClick,
                    ({
                        'layerSwitcher':this,
                        'layerRank':isAggregated? this.layersMap[layer.id] : rank
                    })
                ));
            buttons.appendChild(buttonDown);

            // display name
            var labelSpan= document.createElement("span");
            labelSpan.id= 'label_' + layer.id;
            var layerLab= OpenLayers.i18n(layer.name);
            // convert HTML entities to get the right length :
            var entityBuffer= document.createElement("textarea");
            entityBuffer.innerHTML= layerLab.replace(/</g,"&lt;").replace(/>/g,"&gt;");
            layerLab= entityBuffer.value;
            entityBuffer= null;
            if (!isAnAggregate && layerLab.length >= Geoportal.Control.LayerSwitcher.LAYER_LABEL_MAXLENGTH) {
                //FIXME : HTML tags within string
                layerLab= layerLab.substring(0,Geoportal.Control.LayerSwitcher.LAYER_LABEL_REPLACEMENT_INDEX)+
                          Geoportal.Control.LayerSwitcher.LAYER_LABEL_SUFFIX_REPLACEMENT;
            }
            labelSpan.innerHTML= layerLab;
            labelSpan.className= "gpLayerSpanClass";
            labelSpan.title= OpenLayers.i18n(layer.name);
            if (!layer.inRange) {
                labelSpan.className+= "NotInRange";
            }
            if (layer.description || layer.dataURL || layer.metadataURL || layer.legends) {
                labelSpan.style.cursor= "help";
                // a pop-up for description, dataURL, metadataURL, ...
                var context= {
                    'inputElem': layerDiv,
                    'layer': layer,
                    'layerSwitcher': this
                };
                OpenLayers.Event.observe(
                    labelSpan,
                    "click",
                    OpenLayers.Function.bindAsEventListener(this.onLabelClick,context)
                );
            }
            layerDiv.appendChild(labelSpan);

            var ctrlId= 'loading_'+layer.id;
            var loadingCtrl= this.map.getControl(ctrlId);
            if (loadingCtrl) {
                layerDiv.appendChild(loadingCtrl.div);
            } else {
                var loadingCtrlDiv= document.createElement('div');
                loadingCtrlDiv.id= ctrlId;
                loadingCtrlDiv.className= 'gpControlLoading olControlNoSelect';
                loadingCtrl= new Geoportal.Control.Loading(
                                    layer, {
                                        id : loadingCtrlDiv.id,
                                        div: loadingCtrlDiv
                                    });
                layerDiv.appendChild(loadingCtrlDiv);
                this.map.addControl(loadingCtrl);
            }

            return {'elem':layerDiv, 'd1':d1, 'd2':d2, 'd3':d3, 'd4':d4, 'd5':d5, 'span': labelSpan};
        },

        /**
         * APIMethod: onFolderClick
         * A folder icon has been clicked, display or hide the aggregate's content
         * and change the icon accordingly.
         *
         * Parameters:
         * e - {Event}
         *
         * Context:
         * inputElem - {DOMElement}
         * layerSwitcher - {<Geoportal.Control.LayerSwitcher>}
         * isLast - {Boolean}
         * d1 - {DOMElement}
         * layer - {<OpenLayers.Layer>}
         */
        onFolderClick: function(e) {
            if (e != null) {
                OpenLayers.Event.stop(e);
            }
            if (this.layer.layers && this.layer.inRange) {
                var rank= this.layerSwitcher.layersMap[this.layer.id];
                var state= this.layerSwitcher.layerStates[rank];
                if (this.layerSwitcher.events.triggerEvent("beforegroup"+(state.unfolded===true? "closed":"opened"), {
                        'state':state
                    })===false) {
                    return;
                }
                for (var i= 0, l= this.layer.layers.length; i<l; i++) {
                    var innerRank= this.layerSwitcher.layersMap[this.layer.layers[i].id];
                    if (state.unfolded===true) {
                        this.layerSwitcher.dataLayers[innerRank].inputElem.style.display= 'none';
                    } else {
                        this.layerSwitcher.dataLayers[innerRank].inputElem.style.display= 'block';
                    }
                }
                if (state.unfolded===true) {
                    state.unfolded= false;
                    this.layerSwitcher.dataLayers[rank].unfolded= false;
                    if (this.isLast) {
                        OpenLayers.Element.removeClass(this.d1,'gpCornerMinus');
                        OpenLayers.Element.addClass(this.d1,'gpCornerPlus');
                    } else {
                        OpenLayers.Element.removeClass(this.d1,'gpTeeMinus');
                        OpenLayers.Element.addClass(this.d1,'gpTeePlus');
                    }
                } else {
                   state.unfolded= true;
                    this.layerSwitcher.dataLayers[rank].unfolded= true;
                    if (this.isLast) {
                        OpenLayers.Element.removeClass(this.d1,'gpCornerPlus');
                        OpenLayers.Element.addClass(this.d1,'gpCornerMinus');
                    } else {
                        OpenLayers.Element.removeClass(this.d1,'gpTeePlus');
                        OpenLayers.Element.addClass(this.d1,'gpTeeMinus');
                    }
                }
                if (this.layerSwitcher.events.triggerEvent("group"+(state.unfolded===true? "opened":"closed"), {
                        'state':state
                    })===false) {
                    return;
                }
            }
        },

        /**
         * APIMethod: onCheckClick
         * A visibility aggregate's icon has been clicked, display or hide its corresponding
         * layer and change the icon accordingly.
         *
         * Parameters:
         * e - {Event}
         *
         * Context:
         * inputElem - {DOMElement}
         * layerSwitcher - {<Geoportal.Control.LayerSwitcher>}
         * d2 - {DOMElement}
         * layer - {<OpenLayers.Layer>}
         */
        onCheckClick: function(e) {
            if (e != null) {
                OpenLayers.Event.stop(e);
            }
            if (this.layer.layers && this.layer.inRange) {
                if (this.inputElem.checked) {
                    if (this.inputElem.visibilityRatio==this.layer.layers.length) {
                        OpenLayers.Element.removeClass(this.d2,'gpCheckedAggregate');
                    } else {
                        OpenLayers.Element.removeClass(this.d2,'gpPartialCheckedAggregate');
                    }
                    OpenLayers.Element.addClass(this.d2,'gpUnCheckedAggregate');
                    this.inputElem.visibilityRatio= 0;
                } else {
                    OpenLayers.Element.removeClass(this.d2,'gpUnCheckedAggregate');
                    OpenLayers.Element.addClass(this.d2,'gpCheckedAggregate');
                    this.inputElem.visibilityRatio= this.layer.layers.length;
                }
                this.inputElem.checked= !this.inputElem.checked;
                this.layerSwitcher.updateMap();
            }
        },

        /**
         * APIMethod: onInputClick
         * A visibility icon has been clicked, display or hide its corresponding
         * layer and change the icon accordingly.
         *
         * Parameters:
         * e - {Event}
         *
         * Context:
         * inputElem - {DOMElement}
         * layerSwitcher - {<Geoportal.Control.LayerSwitcher>}
         * d3 - {DOMElement}
         * layer - {<OpenLayers.Layer>}
         */
        onInputClick: function(e) {
            if (e != null) {
                OpenLayers.Event.stop(e);
            }
            if (this.layer.inRange) {
                if (this.inputElem.checked) {
                    OpenLayers.Element.removeClass(this.d3,'gpLayerVisible');
                    OpenLayers.Element.addClass(this.d3,'gpLayerNotVisible');
                } else {
                    OpenLayers.Element.removeClass(this.d3,'gpLayerNotVisible');
                    OpenLayers.Element.addClass(this.d3,'gpLayerVisible');
                }
                if (this.layer.aggregate) {//belongs to an aggregation
                    var rank= this.layerSwitcher.layersMap[this.layer.aggregate.id];
                    var ie= this.layerSwitcher.dataLayers[rank].inputElem;
                    var d2= this.layerSwitcher.dataLayers[rank].d2;
                    var ag= this.layerSwitcher.dataLayers[rank].layer;
                    var inc= this.inputElem.checked? -1 : 1;
                    var vr= ie.visibilityRatio+inc;
                    ie.visibilityRatio+= inc;
                    this.layerSwitcher.dataLayers[rank].visibilityRatio= ie.visibilityRatio;
                    if (vr==this.layer.aggregate.layers.length) {
                        ie.checked= ag.visibility= true;
                    } else if (vr!=0) {
                        ie.checked= ag.visibility= true;
                    } else {
                        ie.checked= ag.visibility= false;
                    }
                }
                this.inputElem.checked= !this.inputElem.checked;
                this.layerSwitcher.updateMap();
            }
        },

        /**
         * APIMethod: onQueryableClick
         * A queryable icon has been clicked.
         *
         * Parameters:
         * e - {Event}
         *
         * Context:
         * inputElem - {DOMElement}
         * layerSwitcher - {<Geoportal.Control.LayerSwitcher>}
         * d4 - {DOMElement}
         * layer - {<OpenLayers.Layer>}
         */
        onQueryableClick: function(e) {
            if (e != null) {
                OpenLayers.Event.stop(e);
            }
            if ((this.layer instanceof OpenLayers.Layer.WMS) && this.inputElem.checked) {
                if (typeof(this.layer.queryable)!=='undefined') {
                    if (this.layer.queryable===true) {
                        OpenLayers.Element.removeClass(this.d4, 'gpLayerQueryable');
                        this.d4.title= OpenLayers.i18n('gpControlTreeLayerSwitcher.wmslayer.notqueryable.checked.title');
                        OpenLayers.Element.addClass(this.d4, 'gpLayerNotQueryable');
                    } else {
                        OpenLayers.Element.removeClass(this.d4, 'gpLayerNotQueryable');
                        this.d4.title= OpenLayers.i18n('gpControlTreeLayerSwitcher.wmslayer.queryable.checked.title');
                        OpenLayers.Element.addClass(this.d4, 'gpLayerQueryable');
                    }
                    this.layer.queryable= !this.layer.queryable;
                }
            }
        },

        /**
         * APIMethod: onButtonUpClick
         * the button up has been clicked, move layer accordingly
         *
         * Parameters:
         * e - {Event}
         *
         * Context:
         * layerSwitcher - {<Geoportal.Control.LayerSwitcher>}
         * layerRank - {Integer}
         */
        onButtonUpClick: function(e) {
            var lastlayer= null;
            var orderCanBeChanged= false;
            var layersTemp= this.layerSwitcher.map.layers;
            var layer= layersTemp[this.layerRank];//layer moving up
            var layerRank= this.layerRank;
            var candidateLayer, candidateRank;
            for (var i= this.layerRank+1, n= layersTemp.length; i<n; i++) {
                candidateLayer= layersTemp[i];
                candidateRank= i;
                // candidate is not a baselayer :
                if (candidateLayer.isBaseLayer) {
                    continue;
                }
                if (layer.layers) {
                    // layer is an aggregate : exchange only with aggregates or standalone layers :
                    if (!(candidateLayer.layers || !candidateLayer.aggregate)) {
                        continue;
                    }
                } else {
                    // layer is aggregated : exchange only with aggregated layers of the same aggregate :
                    if (layer.aggregate) {
                        if (!(candidateLayer.aggregate===layer.aggregate)) {
                            continue;
                        }
                    } else {
                        // layer is standalone : exchange only with aggregates or standalone layers :
                        if (!(candidateLayer.layers || !candidateLayer.aggregate)) {
                            continue;
                        }
                    }
                }
                // layer is displayable (not aggregated)=> candidate too
                // layer is not displayable (aggregated)=> candidate too
                if (!(layer.displayInLayerSwitcher===candidateLayer.displayInLayerSwitcher)) {
                    continue;
                }
                orderCanBeChanged= true;
                lastlayer= candidateLayer;//layer to switch with
                var zIndexTemp= lastlayer.getZIndex();
                lastlayer.setZIndex(layer.getZIndex());
                layer.setZIndex(zIndexTemp);
                break;
            }
            if (orderCanBeChanged) {
                if (layer.aggregate) {
                    var r= -1, cr= -1;
                    for (var i= 0, n= layer.aggregate.layers.length; i<n; i++) {
                        if (layer.aggregate.layers[i]===layer) {
                            r= i;
                            if (cr!=-1) { break; }
                        }
                        if (layer.aggregate.layers[i]===candidateLayer) {
                            cr= i;
                            if (r!=-1) { break; }
                        }
                    }
                    var lyr= layer.aggregate.layers[r];
                    layer.aggregate.layers[r]= layer.aggregate.layers[cr];
                    layer.aggregate.layers[cr]= lyr;
                }
                var d= this.layerSwitcher.dataLayers[layerRank];
                layersTemp[layerRank]= lastlayer;
                layersTemp[candidateRank]= layer;
                this.layerSwitcher.layersMap[layer.id]= candidateRank;
                this.layerSwitcher.layersMap[lastlayer.id]= layerRank;
                this.layerSwitcher.dataLayers[layerRank]= this.layerSwitcher.dataLayers[candidateRank];
                this.layerSwitcher.dataLayers[candidateRank]= d;
                this.layerSwitcher.redraw();
            }
            if (e != null) {
                OpenLayers.Event.stop(e);
            }
        },

        /**
         * APIMethod: onButtonDownClick
         * the button down has been clicked, move layer accordingly
         *
         * Parameters:
         * e - {Event}
         *
         * Context:
         * layerSwitcher - {<Geoportal.Control.LayerSwitcher>}
         * layerRank - {Integer}
         */
        onButtonDownClick: function(e) {
            var lastlayer= null;
            var orderCanBeChanged= false;
            var layersTemp= this.layerSwitcher.map.layers;
            var layer= layersTemp[this.layerRank];//layer moving down
            var layerRank= this.layerRank;
            var candidateLayer, candidateRank;
            for (var i= this.layerRank-1; i>=1; i--) {
                candidateLayer= layersTemp[i];
                candidateRank= i;
                // candidate is not a baselayer :
                if (candidateLayer.isBaseLayer) {
                    continue;
                }
                if (layer.layers) {
                    // layer is an aggregate : exchange only with aggregates or standalone layers :
                    if (!(candidateLayer.layers || !candidateLayer.aggregate)) {
                        continue;
                    }
                } else {
                    // layer is aggregated : exchange only with aggregated layers of the same aggregate :
                    if (layer.aggregate) {
                        if (!(candidateLayer.aggregate===layer.aggregate)) {
                            continue;
                        }
                    } else {
                        // layer is standalone : exchange only with aggregates or standalone layers :
                        if (!(candidateLayer.layers || !candidateLayer.aggregate)) {
                            continue;
                        }
                    }
                }
                orderCanBeChanged= true;
                lastlayer= candidateLayer;//layer to switch with
                var zIndexTemp= lastlayer.getZIndex();
                lastlayer.setZIndex(layer.getZIndex());
                layer.setZIndex(zIndexTemp);
                break;
            }
            if (orderCanBeChanged) {
                var r= this.layerSwitcher.layersMap[layer.id];
                var cr= this.layerSwitcher.layersMap[lastlayer.id];
                var d= this.layerSwitcher.dataLayers[r];
                layersTemp[r]= lastlayer;
                layersTemp[cr]= layer;
                this.layerSwitcher.dataLayers[r]= this.layerSwitcher.dataLayers[cr];
                this.layerSwitcher.dataLayers[cr]= d;
                this.layerSwitcher.redraw();
            }
            if (e != null) {
                OpenLayers.Event.stop(e);
            }
        },

        /**
         * APIMethod: loadContents
         * Set up the labels and divs for the control.
         * DOM elements for the base layers are not created here.
         */
        loadContents: function() {
            OpenLayers.Element.addClass(this.div, "gpMainDivClass");

            OpenLayers.Event.observe(
                this.div,
                "dblclick",
                OpenLayers.Function.bindAsEventListener(this.ignoreEvent,this)
            );
            OpenLayers.Event.observe(
                this.div,
                "click",
                OpenLayers.Function.bindAsEventListener(this.ignoreEvent,this)
            );
            OpenLayers.Event.observe(
                this.div,
                "mousedown",
                OpenLayers.Function.bindAsEventListener(this.mouseDown,this)
            );
            OpenLayers.Event.observe(
                this.div,
                "mouseup",
                OpenLayers.Function.bindAsEventListener(this.mouseUp,this)
            );

            // layers list div
            this.layersDiv= document.createElement("div");
            this.layersDiv.id= this.id+"_layersDiv";
            this.layersDiv.className= "gpLayersClass";

            if (!this.outsideViewport) {
                this.dataLbl= document.createElement("div");
                this.dataLbl.id= this.id+"_layer_title";
                this.dataLbl.innerHTML= OpenLayers.i18n(this.getDisplayClass()+'.label');
                this.dataLbl.className= "gpControlLabelClass";
                OpenLayers.Event.observe(
                    this.dataLbl,
                    "click",
                    OpenLayers.Function.bindAsEventListener(this.clickOnLabel,this)
                );
                OpenLayers.Event.observe(
                    this.dataLbl,
                    "dblclick",
                    OpenLayers.Function.bindAsEventListener(this.clickOnLabel,this)
                );
                this.layersDiv.appendChild(this.dataLbl);
            }

            this.dataLayersDiv= document.createElement("div");
            this.dataLayersDiv.id= this.id+"_layers_container";
            this.dataLayersDiv.className= "gpGroupDivClass";
            this.layersDiv.appendChild(this.dataLayersDiv);
            if (this.outsideViewport) {
                this.dataLayersDiv.style.display= 'block';
            }

            this.div.appendChild(this.layersDiv);
        },

        /**
         * APIMethod: clickOnLabel
         * In case of double click on the label, open or close it.
         *
         * Parameters:
         * evt - {Event} the browser event
         */
        clickOnLabel: function(evt) {
            var minimize= this.dataLayersDiv.style.display=="block";
            this.showControls(minimize);
            this.ignoreEvent(evt);
        },

        /**
         * Constant: CLASS_NAME
         * {String} *"Geoportal.Control.TreeLayerSwitcher"*
        */
        CLASS_NAME: "Geoportal.Control.TreeLayerSwitcher"
    });

    /*
     * Copyright (c) 2008-2010 Institut National de l'information Geographique et forestiere France, released
     * under the BSD license.
     */
    /*
     * AT.requires Geoportal/Control/LayerSwitcher.js
     */
    /**
     * Class: Geoportal.Control.GetLegendGraphics
     * Layer switcher class that display layer's legend.
     *
     * The control's structure is as follows :
     *
     * (start code)
     * <div id="#{id}" class="gpControlGetLegendGraphics olControlNoSelect gpLegendMainDivClass">
     *   <div id="#{id}_layersDiv" class="gpLegendLayersClass">
     *     <div id="#{id}_layer_title" class="gpControlLegendLabelClass"></div>
     *     <div id="#{id}_layers_container" class="gpLegendGroupDivClass">
     *       <div id="#{id}_#{layer.id} class="gpLegendLayerDivClass(|Aggregate|Aggregated)">
     *         <div class="gpLegendLayerNameGroupDivClass">
     *           <span id="label_#{layer.id}" class="gpLegendLayerSpanClass(|Aggregate|Aggregated)">name</span>
     *         </div>
     *       </div>
     *     </div>
     *   </div>
     * </div>
     * (end)
     *
     * Inherits from:
     * - {<Geoportal.Control.LayerSwitcher>}
     */
    Geoportal.Control.GetLegendGraphics= OpenLayers.Class( Geoportal.Control.LayerSwitcher, {
        /**
         * Property: layersMap
         * {Object} A map of layer's id and their rank in the layerStates array.
         *
         */
        layersMap: null,

        /**
         * Constructor: Geoportal.Control.GetLegendGraphics
         * Build the layer's legend switcher.
         *
         * Parameters:
         * options - {Object}
         */
        initialize: function(options) {
            //TODO: Lang/*.js :
            Geoportal.Lang.add({
                'gpControlGetLegendGraphics.label':{
                    'de':"Legenden",
                    'en':"Legends",
                    'es':"Leyendas",
                    'fr':"Légendes",
                    'it':"Leggende"
                },
                'gpControlGetLegendGraphics.noLegend':{
                    'de':"Keine legende definiert",
                    'en':"No legend defined",
                    'es':"Ninguna leyenda definido",
                    'fr':"Pas de légende définie",
                    'it':"No leggenda definito"
                }
            });
            Geoportal.Control.LayerSwitcher.prototype.initialize.apply(this, arguments);
            this.layersMap= {};
        },

        /**
         * APIMethod: destroy
         * The DOM elements handling base layers are not suppressed.
         */
        destroy: function() {
            this.layersMap= null;
            OpenLayers.Event.stopObservingElement(this.div);

            this.layerStates= [];
            this.preventControls= null;
            if (this.dataLbl) {
                OpenLayers.Event.stopObservingElement(this.dataLbl);
            }
            this.clearLayersArray("data");
            if (this.masterSwitcher) {
                this.masterSwitcher.events.unregister("groupopened",this,this.onGroupOpened);
                this.masterSwitcher.events.unregister("groupclosed",this,this.onGroupClosed);
                this.masterSwitcher= null;
            }
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
            if (this.masterSwitcher) {
                this.masterSwitcher.events.register("groupopened",this,this.onGroupOpened);
                this.masterSwitcher.events.register("groupclosed",this,this.onGroupClosed);
            }
        },

        /**
         * Method: onGroupOpened
         * Callback when layer switcher raises "groupopened" event.
         *
         * Parameters:
         * evt - {Event} event fired.
         *      evt.state contains information about the opened aggregate.
         */
        onGroupOpened: function(evt) {
            if (evt==null) { return; }
            OpenLayers.Event.stop(evt);
            var rank= this.layersMap[evt.state.id];
            this.dataLayers[rank].inputElem.style.display= '';
            this.dataLayers[rank].unfolded= this.layerStates[rank].unfolded= true;
            var layers= this.dataLayers[rank].layer.layers;
            for (var i= 0, l= layers.length; i<l; i++) {
                this.dataLayers[this.layersMap[layers[i].id]].inputElem.style.display= '';
            }
        },

        /**
         * Method: onGroupClosed
         * Callback when layer switcher raises "groupclosed" event.
         *
         * Parameters:
         * evt - {Event} event fired.
         *      evt.state contains information about the closed aggregate.
         */
        onGroupClosed: function(evt) {
            if (evt==null) { return; }
            OpenLayers.Event.stop(evt);
            var rank= this.layersMap[evt.state.id];
            var layers= this.dataLayers[rank].layer.layers;
            for (var i= 0, l= layers.length; i<l; i++) {
                this.dataLayers[this.layersMap[layers[i].id]].inputElem.style.display= 'none';
            }
            this.dataLayers[rank].inputElem.style.display= 'none';
            this.dataLayers[rank].unfolded= this.layerStates[rank].unfolded= false;
        },

        /**
         * APIMethod: clearLayersArray
         * User specifies either "base" or "data". we then clear all the
         *     corresponding listeners, the div, and reinitialize a new array.
         *
         * Parameters:
         * layersType - {String}
         */
        clearLayersArray: function(layersType) {
            this[layersType + "LayersDiv"].innerHTML= "";
            this[layersType + "Layers"]= [];
        },

        /**
         * APIMethod: redraw
         *  Goes through and takes the current state of the Map and rebuilds the
         *  control to display that state.  Show layers using folder tree display.
         *
         * Returns:
         * {DOMElement} A reference to the DIV DOMElement containing the control
         */
        redraw: function() {
            //if the state hasn't changed since last redraw, no need
            // to do anything. Just return the existing div.
            if (!Geoportal.Control.GetLegendGraphics.prototype.checkRedraw.apply(this,arguments)) {
                return this.div;
            }

            var i, j, l= this.map.layers.length;
            var layer;
            // Save state -- for checking layer if the map state changed.
            // We save this before redrawing, because in the process of redrawing
            // we will trigger more visibility changes, and we want to not redraw
            // and enter an infinite loop. Same for opacity changes.
            this.layerStates= [];
            this.layersMap= {};
            for (i= 0; i<l; i++) {
                layer= this.map.layers[i];
                // adding preventControls option to disallow some control's class by the user
                if (!layer.preventControls) {
                    layer.preventControls= {};
                }
                OpenLayers.Util.extend(layer.preventControls, this.preventControls);
                this.layerStates[i]= {
                    'displayInLayerSwitcher': layer.displayInLayerSwitcher,
                    'name': layer.name,
                    'visibility': layer.visibility,
                    'inRange': layer.inRange,
                    'id': layer.id,
                    'unfolded': this.dataLayers && this.dataLayers[i]? this.dataLayers[i].unfolded : undefined
                };
                this.layersMap[layer.id]= i;
            }

            //clear out previous layers, build clean array :
            this.clearLayersArray("data");
            this.dataLayers= [];
            for (i= 0; i<l; i++) {
                this.dataLayers.push({});
            }

            var containsOverlays= false;

            var layers= this.map.layers.slice();
            var groupDiv= this.dataLayersDiv;
            var lup= false, ldown= false;
            for (i= l-1; i>=0; i--) {
                // don't want baseLayers ...
                if (layers[i].displayInLayerSwitcher && !layers[i].baseLayer) {
                    containsOverlays= true;
                    layer= layers[i];

                    var infos= this.drawLayer(layers,l,i,this.layerStates[i]);
                    // is the aggregate open ?
                    if (layer.layers && this.layerStates[i].unfolded!==true) {
                        infos.elem.style.display= 'none';
                    }
                    groupDiv.appendChild(infos.elem);

                    this.dataLayers[i]= {
                        'layer': layer,
                        'inputElem': infos.elem,
                        'legend': infos.legend,
                        'labelSpan': infos.span,
                        'isAnAggregate': layer.layers!=null,
                        'isAggregated': false,
                        'unfolded': layer.layers!=null? this.layerStates[i].unfolded : undefined
                    };

                    if (layer.layers!=null) {
                        // display aggregation's content
                        var innerLayers= layer.layers.slice();
                        var ll= innerLayers.length;
                        for (var ii= ll-1; ii>=0; ii--) {
                            var lyr= innerLayers[ii];
                            var rank= this.layersMap[lyr.id];
                            var innerInfos= this.drawLayer(innerLayers,ll,ii,this.layerStates[rank]);
                            // is the aggregate open ?
                            if (this.layerStates[i].unfolded!==true) {
                                innerInfos.elem.style.display= 'none';
                            }
                            groupDiv.appendChild(innerInfos.elem);
                            // insert at the right rank (same as map's layers' rank !
                            this.dataLayers[rank]= {
                                'layer': lyr,
                                'inputElem': innerInfos.elem,
                                'legend': innerInfos.legend,
                                'labelSpan': innerInfos.span,
                                'isAnAggregate': false,
                                'isAggregated': true,
                                'unfolded': undefined
                            };
                        }
                    }
                }
            }

            if (!this.outsideViewport) {
                // if no overlays, don't display the overlay label
                this.dataLbl.style.display= containsOverlays? '' : 'none';
            }

            return this.div;
        },

        /**
         * Method: drawLayer
         * Build the layer's informations in the switcher.
         *
         * Parameters:
         * layers - {<OpenLayers.Layer>} the array of layers the current layer belongs to.
         * len - {Integer} total number of layers in the array.
         * rank - {Integer} the current layer's position within the array of layers.
         * state - {Object} the current layer's state.
         *
         * Returns:
         * {Object} An object {'elem', 'legend', 'span'} having the div
         * containing the layer's informations and its span.
         */
        drawLayer: function(layers,len,rank,state) {
            var layer= layers[rank];
            var checked= layer.getVisibility();
            var isAnAggregate= layer.layers!=null;
            var isAggregated= layer.aggregate!=null;
            var layerDiv= document.createElement("div");
            layerDiv.id= this.id+"_"+layer.id;
            layerDiv.className= "gpLegendLayerDivClass";
            if (isAnAggregate) {
                layerDiv.className+= "Aggregate";
            }
            if (isAggregated) {
                layerDiv.className+= "Aggregated";
            }
            layerDiv.checked= checked;

            var labelSpan= document.createElement("span");
            labelSpan.id= 'label_' + layer.id;
            var layerLab= OpenLayers.i18n(layer.name);
            // convert HTML entities to get the right length :
            var entityBuffer= document.createElement("textarea");
            entityBuffer.innerHTML= layerLab.replace(/</g,"&lt;").replace(/>/g,"&gt;");
            layerLab= entityBuffer.value;
            entityBuffer= null;
            labelSpan.innerHTML= layerLab;
            labelSpan.className= "gpLegendLayerSpanClass";
            if (isAnAggregate) {
                labelSpan.className+= "Aggregate";
            }
            if (isAggregated) {
                labelSpan.className+= "Aggregated";
            }
            if (!layer.inRange) {
                labelSpan.className+= "NotInRange";
            }
            layerDiv.appendChild(labelSpan);

            if (!isAnAggregate) {
                var layerLegend= document.createElement("div");
                layerLegend.id= 'legends_'+layer.id;
                layerLegend.className= "gpLegendLayerLegendsDivClass";
                if (layer.legends) {
                    for (var i=0, l= layer.legends.length; i<l; i++) {
                        var legend= layer.legends[i];
                        var img= document.createElement("img");
                        img.id= 'legend_' + i + '_' + (legend.style ||'') + '_' + layer.id;
                        img.src= legend.href.replace(/&amp;/g,'&');
                        if (legend.width && legend.height) {
                            img.width= legend.width;
                            img.height= legend.height;
                        }
                        if (legend.title) {
                            img.alt= legend.title;
                            img.title= legend.title;
                        }
                        img.vspace= img.hspace= 0;
                        layerLegend.appendChild(img);
                    }
                } else {
                    layerLegend.className+= "No";
                    var span= document.createElement("span");
                    span.id= 'nolegends_'+layer.id;
                    span.className= "gpLegendLayerNoLegend";
                    if (!layer.inRange) {
                        span.className+= "NotInRange";
                    }
                    span.innerHTML= OpenLayers.i18n('gpControlGetLegendGraphics.noLegend');
                    layerLegend.appendChild(span);
                }
                layerDiv.appendChild(layerLegend);
            }

            return {'elem':layerDiv, 'legend': layerLegend, 'span': labelSpan};
        },

        /**
         * APIMethod: loadContents
         * Set up the labels and divs for the control.
         * DOM elements for the base layers are not created here.
         */
        loadContents: function() {
            OpenLayers.Element.addClass(this.div, "gpLegendMainDivClass");

            OpenLayers.Event.observe(
                this.div,
                "dblclick",
                OpenLayers.Function.bindAsEventListener(this.ignoreEvent,this)
            );
            OpenLayers.Event.observe(
                this.div,
                "click",
                OpenLayers.Function.bindAsEventListener(this.ignoreEvent,this)
            );
            OpenLayers.Event.observe(
                this.div,
                "mousedown",
                OpenLayers.Function.bindAsEventListener(this.mouseDown,this)
            );
            OpenLayers.Event.observe(
                this.div,
                "mouseup",
                OpenLayers.Function.bindAsEventListener(this.mouseUp,this)
            );

            // layers list div
            this.layersDiv= document.createElement("div");
            this.layersDiv.id= this.id+"_layersDiv";
            this.layersDiv.className= "gpLegendLayersClass";

            if (!this.outsideViewport) {
                this.dataLbl= document.createElement("div");
                this.dataLbl.id= this.id+"_layer_title";
                this.dataLbl.innerHTML= OpenLayers.i18n(this.getDisplayClass()+'.label');
                this.dataLbl.className= "gpControlLegendLabelClass";
                OpenLayers.Event.observe(
                    this.dataLbl,
                    "click",
                    OpenLayers.Function.bindAsEventListener(this.clickOnLabel,this)
                );
                OpenLayers.Event.observe(
                    this.dataLbl,
                    "dblclick",
                    OpenLayers.Function.bindAsEventListener(this.clickOnLabel,this)
                );
                this.layersDiv.appendChild(this.dataLbl);
            }

            this.dataLayersDiv= document.createElement("div");
            this.dataLayersDiv.id= this.id+"_layers_container";
            this.dataLayersDiv.className= "gpLegendGroupDivClass";
            this.layersDiv.appendChild(this.dataLayersDiv);
            if (this.outsideViewport) {
                this.dataLayersDiv.style.display= 'block';
            }

            this.div.appendChild(this.layersDiv);
        },

        /**
         * Constant: CLASS_NAME
         * {String} *"Geoportal.Control.GetLegendGraphics"*
        */
        CLASS_NAME: "Geoportal.Control.GetLegendGraphics"
    });

    OpenLayers.Control.MouseWheel= OpenLayers.Class(OpenLayers.Control, {
        /**
         * APIProperty: handleRightClicks
         * {Boolean} Whether or not to handle right clicks. Default is false.
         */
        handleRightClicks: false,

        /**
         * Constructor: OpenLayers.Control.MouseWheel
         * Create a new mouse wheel control
         *
         * Parameters:
         * options - {Object} An optional object whose properties will be set on
         *                    the control
         */
        initialize: function(options) {
            this.handlers = {};
            OpenLayers.Control.prototype.initialize.apply(this, arguments);
        },

        /**
         * Method: destroy
         * The destroy method is used to perform any clean up before the control
         * is dereferenced.  Typically this is where event listeners are removed
         * to prevent memory leaks.
         */
        destroy: function() {
            this.deactivate();
            OpenLayers.Control.prototype.destroy.apply(this,arguments);
        },

        /**
         * Method: activate
         */
        activate: function() {
            this.handlers.wheel.activate();
            this.handlers.click.activate();
            return OpenLayers.Control.prototype.activate.apply(this,arguments);
        },

        /**
         * Method: deactivate
         */
        deactivate: function() {
            this.handlers.click.deactivate();
            this.handlers.wheel.deactivate();
            return OpenLayers.Control.prototype.deactivate.apply(this,arguments);
        },

        /**
         * Method: draw
         */
        draw: function() {
            // disable right mouse context menu for support of right click events
            if (this.handleRightClicks) {
                this.map.viewPortDiv.oncontextmenu= function () { return false;};
            }

            var clickCallbacks= {};
            var clickOptions= {
                'double': false,
                'stopDouble': false
            };
            this.handlers.click= new OpenLayers.Handler.Click(
                this, clickCallbacks, clickOptions
            );
            this.handlers.wheel= new OpenLayers.Handler.MouseWheel(
                this, {
                    "up"  : this.wheelUp,
                    "down": this.wheelDown
                });
            this.activate();
        },

        /**
         * Method: wheelChange
         *
         * Parameters:
         * evt - {Event}
         * deltaZ - {Integer}
         */
        wheelChange: function(evt, deltaZ) {
            var newZoom= this.map.getZoom() + deltaZ;
            if (!this.map.isValidZoomLevel(newZoom)) {
                return;
            }
            var size= this.map.getSize();
            var deltaX= size.w/2 - evt.xy.x;
            var deltaY= evt.xy.y - size.h/2;
            var newRes= this.map.baseLayer.getResolutionForZoom(newZoom);
            var zoomPoint= this.map.getLonLatFromPixel(evt.xy);
            var newCenter= new OpenLayers.LonLat(
                                zoomPoint.lon + deltaX * newRes,
                                zoomPoint.lat + deltaY * newRes );
            this.map.setCenter( newCenter, newZoom );
        },

        /**
         * Method: wheelUp
         * User spun scroll wheel up
         *
         * Parameters:
         * evt - {Event}
         */
        wheelUp: function(evt) {
            this.wheelChange(evt, 1);
        },

        /**
         * Method: wheelDown
         * User spun scroll wheel down
         *
         * Parameters:
         * evt - {Event}
         */
        wheelDown: function(evt) {
            this.wheelChange(evt, -1);
        },

        /**
         * Method: disableZoomWheel
         */
        disableZoomWheel: function() {
            this.zoomWheelEnabled= false;
            this.handlers.wheel.deactivate();
        },

        /**
         * Method: enableZoomWheel
         */
        enableZoomWheel: function() {
            this.zoomWheelEnabled= true;
            if (this.active) {
                this.handlers.wheel.activate();
            }
        },

        CLASS_NAME: "OpenLayers.Control.MouseWheel"
    });

    /**
     * APIFunction: enhancingHover
     * Change the background image of a {DOMElement} attached to a control when the mouse
     * is over the control's container to get a enhancing effect.
     *      The scope of the call is an object embeded in the control that
     *      supports :
     *      * mouseEvents : the listener (mouseover and mouseout events);
     *      * w, h : width and height of the control's container;
     *      * x, y : top and left absolute position of the control's container.
     *
     * Parameters:
     * evt - {<Event>} the current mouseover event.
     */
    Geoportal.Control.enhancingHover= function(evt) {
        if (!evt || !evt.element) { return; }
        if (this.enhanced===true) { return; }
        var elt= evt.element;
        this.enhanced= true;
        var bgi= OpenLayers.Element.getStyle(elt, 'background-image');
        elt.style.backgroundImage= 'none';
        var img= elt.ownerDocument.createElement('img');
        img.src= bgi.replace(/^\s*url\("?/,'').replace(/"?\)\s*$/,'');
        img.width= 2*this.w;
        img.height= 2*this.h;
        img.style.top= (-this.w/2)+"px";
        img.style.left= (-this.h/2)+"px";
        img.style.position= "relative";
        img.style.zIndex= 7000;
        this.mouseEvents.un({
            'mouseover': Geoportal.Control.enhancingHover
        });
        elt.appendChild(img);
        OpenLayers.Event.stop(evt);
    };

    /**
     * APIFunction: enhancingClean
     * Reset the control's container to the original layout.
     *
     * Parameters:
     * obj - {Object} the object embeded in the control for enhancing the background image.
     * elt - {DOMElement} the control's container.
     */
    Geoportal.Control.enhancingClean= function(obj, elt) {
        elt.style.backgroundImage= "";
        elt.innerHTML= "";
        obj.enhanced= false;
    };

    /**
     * APIFunction: enhancingOut
     * Change the background image of a {DOMElement} attached to a control when the mouse
     * is leaving the control's container to get the original rendering.
     *      For the scope, See <Geoportal.Control.enhancingHover>.
     *
     * Parameters:
     * evt - {<Event>} the current mouseover event.
     */
    Geoportal.Control.enhancingOut= function(evt) {
        if (!evt || !evt.element) { return; }
        var elt= evt.element;
        if (this.enhanced!==true) { return; }
        if (!((this.x<=evt.clientX && evt.clientX<this.x+this.w) &&
              (this.y<=evt.clientY && evt.clientY<this.y+this.h))) {
            Geoportal.Control.enhancingClean(this, elt);
            this.mouseEvents.on({
                'mouseover': Geoportal.Control.enhancingHover
            });
        }
        OpenLayers.Event.stop(evt);
    };

    /**
     * APIFunction: addEnhanceEffectOnControl
     * Add the enhancing effect on a basic control.
     *
     * Parameters:
     * control - {<OpenLayers.Control>} the control to enhance.
     */
    Geoportal.Control.addEnhanceEffectOnControl= function(control) {
        var pfDestroy= control.destroy;
        control.destroy= function() {
            if (this.enhance) {
                if (this.enhance.mouseEvents) {
                    this.enhance.mouseEvents.destroy();
                    this.enhance.mouseEvents= null;
                }
            }
            pfDestroy.apply(this,arguments);
        };
        var elt= control.getUI().getDom();
        var p= OpenLayers.Util.pagePosition(elt);
        control.enhance= {};
        control.enhance.mouseEvents= new OpenLayers.Events(control.enhance, elt, null, true);
        control.enhance.w= elt.clientWidth || parseInt(OpenLayers.Element.getStyle(elt, 'width'));
        control.enhance.h= elt.clientHeight || parseInt(OpenLayers.Element.getStyle(elt, 'height'));
        control.enhance.x= p[0];
        control.enhance.y= p[1];
        control.enhance.mouseEvents.on({
            'mouseover': Geoportal.Control.enhancingHover,
            'mouseout' : Geoportal.Control.enhancingOut
        });
    };

    /**
     * APIFunction: addEnhanceEffectOnPanel
     * Add the enhancing effect on controls embedded in a panel.
     *
     * Parameters:
     * panel - {<OpenLayers.Control.Panel>} the panel to modify.
     */
    Geoportal.Control.addEnhanceEffectOnPanel= function (panel) {
        var pfOnClick= OpenLayers.Control.Panel.prototype.onClick;
        panel.onClick= function(ctrl, evt) {
            if (ctrl.enhance) {
                Geoportal.Control.enhancingClean(ctrl.enhance, ctrl.getUI().getDom());
            }
            pfOnClick.apply(this,arguments);
            if (ctrl.enhance) {
                ctrl.enhance.mouseEvents.on({
                    'mouseover': Geoportal.Control.enhancingHover
                });
            }
        };
        for (var i= 0, l= panel.controls.length; i<l; i++) {
            var cntrl= panel.controls[i];
            var elt= cntrl.getUI().getDom();
            OpenLayers.Event.stopObservingElement(elt);
            Geoportal.Control.addEnhanceEffectOnControl(cntrl);
            OpenLayers.Event.observe( elt, "click",
                OpenLayers.Function.bind(panel.onClick, panel, cntrl));
            OpenLayers.Event.observe( elt, "dblclick",
                OpenLayers.Function.bind(panel.onDoubleClick, panel, cntrl));
            OpenLayers.Event.observe( elt, "mousedown",
                OpenLayers.Function.bindAsEventListener(OpenLayers.Event.stop));
        }
    };

    // ==========================================================================================================
    // add translations
    translate();
    // ==========================================================================================================
    viewer= new Geoportal.Viewer.Basic(
        "viewerDiv",                                // div id where to display dataset
        OpenLayers.Util.extend({                    // viewer parameters :
                nameInstance:'viewer',
                territory:'FXX',                    // map's area of interest
                displayProjection:'IGNF:ETRS89GEO', // allowed display projections - could be an array of strings
                proxy: '/geoportail/api/xmlproxy'+'?url='
            },
            window.gGEOPORTALRIGHTSMANAGEMENT===undefined?
                {apiKey:['nhf8wztv3m9wglcda6n6cbuf']}:gGEOPORTALRIGHTSMANAGEMENT // API configuration with regard to the API key
        )
    );
    if (!viewer) {
        OpenLayers.Console.error(OpenLayers.i18n('new.instance.failed'));
        return;
    }
    viewer.addGeoportalLayers([                    // load some available layers
        'ORTHOIMAGERY.ORTHOPHOTOS',
        'GEOGRAPHICALGRIDSYSTEMS.MAPS'],
        {
        });

    // ==========================================================================================================
    viewer.getMap().addLayer(
        "WMS",
        {
            'sandre.layer.name':{
                'de':"Wasser kurses",
                'en':"Water courses",
                'es':"Cursos de agua",
                'fr':"Cours d'eau",
                'it':"Corsi d'acqua"
            }
        },
        "http://services.sandre.eaufrance.fr/geo/zonage-shp?",
        {
            layers:'RWBODY',
            format:'image/png',
            transparent:'true'
        },
        {
            singleTile:false,
            projection:'EPSG:4326',
            units:'degrees',
            // maxExtent expressed in EPSG:4326 :
            maxExtent: new OpenLayers.Bounds(-180,-90,180,90),
            minZoomLevel: 5,
            maxZoomLevel:15,
            opacity:1,
            isBaseLayer: false,
            visibility: false,
            queryable: true,
            legends:[{
                href:'http://services.sandre.eaufrance.fr/geo/zonage?SERVICE=WMS&amp;REQUEST=GetLegendGraphic&amp;VERSION=1.1.1&amp;FORMAT=image/png&amp;WIDTH=200&amp;HEIGHT=20&amp;LAYER=RWBODY&amp;',
                width:100,
                height:20
            }],
            originators:[
                {
                    logo:'sandre',
                    pictureUrl:'http://api.ign.fr/geoportail/api/doc/examples/img/logo_sandre.gif',
                    url:'http://sandre.eaufrance.fr'
                }
            ]
        });

    // ==========================================================================================================
    /*Geoportal.Lang.add({

    });*/
    viewer.getMap().addLayer(
        new Geoportal.Layer.Aggregate(
            'risks.avalanche.aggregate.name',
            [
                new OpenLayers.Layer.WMS(
                    'avalanche.zone.layer.name',
                    "http://cartorisque.prim.net/wms/france",
                    {
                        layers:'zont_alp,zont_pyr',
                        format:'image/gif',
                        transparent:true
                    },
                    {
                        singleTile:true,
                        projection: "EPSG:4326",
                        queryable: true,
                        legends:[{
                            href:'http://cartorisque.prim.net/dpt/legende/clpa_temoignage.png'
                        }],
                        // maxExtent expressed in EPSG:4326 :
                        maxExtent: new OpenLayers.Bounds(-2.5,46.7,9.5,51.7),
                        minZoomLevel:5,
                        maxZoomLevel:15,
                        opacity:0.5
                    }
                ),
                new OpenLayers.Layer.WMS(
                    'interpreted.zone.layer.name',
                    "http://cartorisque.prim.net/wms/france",
                    {
                        layers:'zonpi_alp,zonpi_pyr',
                        format:'image/gif',
                        transparent:true
                    },
                    {
                        singleTile:true,
                        projection: "EPSG:4326",
                        //queryable: true,
                        legends:[{
                            href:'http://cartorisque.prim.net/wms/france?VERSION=1.1.1&amp;SERVICE=WMS&amp;REQUEST=GetLegendGraphic&amp;LAYER=zonpi_alp&amp;FORMAT=image/png&amp;WIDTH=200&amp;HEIGHT=50&amp;',
                            width:310
                        },{
                            href:'http://cartorisque.prim.net/wms/france?VERSION=1.1.1&amp;SERVICE=WMS&amp;REQUEST=GetLegendGraphic&amp;LAYER=zonpi_pyr&amp;FORMAT=image/png&amp;WIDTH=200&amp;HEIGHT=50&amp;',
                            width:310
                        }],
                        // maxExtent expressed in EPSG:4326 :
                        maxExtent: new OpenLayers.Bounds(-2.5,46.7,9.5,51.7),
                        minZoomLevel:5,
                        maxZoomLevel:15,
                        opacity:0.5
                    }
                ),
                new OpenLayers.Layer.WMS(
                    'unchecked.zone.layer.name',
                    "http://cartorisque.prim.net/wms/france",
                    {
                        layers:'front_alp,front_pyr',
                        format:'image/gif',
                        transparent:true
                    },
                    {
                        singleTile:true,
                        projection: "EPSG:4326",
                        //queryable: false,
                        // maxExtent expressed in EPSG:4326 :
                        maxExtent: new OpenLayers.Bounds(-2.5,46.7,9.5,51.7),
                        minZoomLevel:8,
                        maxZoomLevel:15,
                        opacity:1.0
                    }
                ),
                new OpenLayers.Layer.WMS(
                    'corridors.layer.name',
                    "http://cartorisque.prim.net/wms/france",
                    {
                        layers:'linpi_alp,linpi_pyr',
                        format:'image/gif',
                        transparent:true
                    },
                    {
                        singleTile:true,
                        projection: "EPSG:4326",
                        //queryable: false,
                        // maxExtent expressed in EPSG:4326 :
                        maxExtent: new OpenLayers.Bounds(-2.5,46.7,9.5,51.7),
                        minZoomLevel:10,
                        maxZoomLevel:15,
                        opacity:1.0
                    }
                ),
                new OpenLayers.Layer.WMS(
                    'num.avalanche.layer.name',
                    "http://cartorisque.prim.net/wms/france",
                    {
                        layers:'Num_emprise_Alpes,Num_emprise_Pyrenees',
                        format:'image/gif',
                        transparent:true
                    },
                    {
                        singleTile:true,
                        queryable:true,
                        projection: "EPSG:4326",
                        // maxExtent expressed in EPSG:4326 :
                        maxExtent: new OpenLayers.Bounds(-2.5,46.7,9.5,51.7),
                        minZoomLevel:13,
                        maxZoomLevel:15,
                        opacity:1.0
                    }
                )
            ],
            {
                visibility: false,
                originators:[
                    {
                        logo:'meddtl',
                        pictureUrl:'http://www.developpement-durable.gouv.fr/squelettes/img/logo.gif',
                        url:'http://www.developpement-durable.gouv.fr/'
                    },
                    {
                        logo:'irstea',
                        picturelUrl:'http://www.irstea.fr/sites/default/files/logo_entete.png',
                        url:'http://www.irstea.fr/'
                    }
                ]
            }
        ));

    // ==========================================================================================================
       /* Geoportal.Lang.add({

    });*/
    var dpCntrl= new OpenLayers.Control.DragPan({
        type:OpenLayers.Control.TYPE_TOGGLE,
        uiOptions:{title:'olControlDragPan.title'}
    });
    var ziCntrl= new OpenLayers.Control.ZoomBox({
        uiOptions:{title:'olControlZoomBox.title'}
    });
    var zoCntrl= new OpenLayers.Control.ZoomOut({
        uiOptions:{title:'olControlZoomOut.title'}
    });
    var zxCntrl= new OpenLayers.Control.ZoomToMaxExtent({
        uiOptions:{title:'olControlZoomToMaxExtent.title'}
    });
    var nhCntrl= new OpenLayers.Control.NavigationHistory({
        uiOptions:{title:'olControl.NavigationHistory.title'},
        previousOptions:{
            uiOptions:{title:'olControlNavigationHistory.previous.title'}
        },
        nextOptions:{
            uiOptions:{title:'olControlNavigationHistory.next.title'}
        }
    });
    viewer.getMap().addControl(nhCntrl);
    var prCntrl= new Geoportal.Control.PrintMap();

    var queryableLayers=viewer.getMap().getLayersByClass("OpenLayers.Layer.WMS");
    for (var i=(queryableLayers.length-1);i>=0;i--){
        if (queryableLayers[i].queryable!=true){
            queryableLayers.splice(i);
        }
    }
    var wiCntrl= new OpenLayers.Control.WMSGetFeatureInfo({
        uiOptions:{title:'olControlWMSGetFeatureInfo.title'},
        queryVisible: true,
        layers: queryableLayers,
        maxFeatures: 10,
        infoFormat:'text/plain',
        eventListeners: {
            getfeatureinfo: function(evt) {
                //this===control
                var txt= '';
                if (typeof(evt.features)!='undefined') {
                    for (var i= 0, l= evt.features.length; i<l; i++) {
                        var T= Geoportal.Control.renderFeatureAttributes(evt.features[i]);
                        txt+= '<div class="gpPopupHead">' + T[0] + '</div>' +
                              '<div class="gpPopupBody">' + T[1] + '</div>';
                    }
                } else {
                    if (evt.text) {
                        var txt=
                            evt.object.infoFormat=='text/plain'?
                                '<div class="gpPopupBody">' +
                                    evt.text.replace(/[\r\n]/g,'<br/>').replace(/ /g,'&nbsp;') +
                                '</div>'
                            :   evt.text;
                    }
                }
                if (txt) {
                    this.map.addPopup(new OpenLayers.Popup.FramedCloud(
                        "chicken",
                        this.map.getLonLatFromPixel(evt.xy),
                        null,
                        Geoportal.Util.cleanContent(txt),
                        null,
                        true));
                }
            }
        }
    });

    var toolsPanel= new Geoportal.Control.Panel({
        div:OpenLayers.Util.getElement('outilsBar')
    });
    toolsPanel.addControls([
        dpCntrl,
        ziCntrl, zoCntrl, zxCntrl,
        nhCntrl.previous, nhCntrl.next,
        wiCntrl,
        prCntrl
    ]);
    toolsPanel.defaultControl= dpCntrl;
    viewer.getMap().addControl(toolsPanel);

    var mdCntrl= new Geoportal.Control.MeasureToolbar({
        div:OpenLayers.Util.getElement('mesuresBar'),
        displaySystem: (viewer.getMap().getProjection().getProjName()=='longlat'? 'geographic':'metric'),
        targetElement: OpenLayers.Util.getElement('mesures')
    });
    viewer.getMap().addControl(mdCntrl);

    var zwCntrl= new OpenLayers.Control.MouseWheel();
    viewer.getMap().addControl(zwCntrl);
    zwCntrl.activate();

    var lsCntrl= new Geoportal.Control.TreeLayerSwitcher({
        div:OpenLayers.Util.getElement('themes')
    });
    viewer.getMap().addControl(lsCntrl);
    lsCntrl.activate();

    var lgCntrl= new Geoportal.Control.GetLegendGraphics({
        div:OpenLayers.Util.getElement('legends'),
        masterSwitcher:lsCntrl
    });
    viewer.getMap().addControl(lgCntrl);
    lgCntrl.activate();

    var inCntrl= new Geoportal.Control.Information({
        div:OpenLayers.Util.getElement('informations'),
        displayProjections: viewer.allowedDisplayProjections,
        // prevent minimizing
        toggleControls:function(minimize) {
        }
    });
    viewer.getMap().addControl(inCntrl);
    inCntrl.activate();

    // default center and zoom location :
    viewer.getMap().setCenter(viewer.viewerOptions.defaultCenter,viewer.viewerOptions.defaultZoom);

    // enhancing additions :
    Geoportal.Control.addEnhanceEffectOnPanel(toolsPanel,[nhCntrl.previous, nhCntrl.next]);
    Geoportal.Control.addEnhanceEffectOnPanel(mdCntrl);
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
    if (checkApiLoading('loadAPI();',['OpenLayers','Geoportal','Geoportal.Viewer'])===false) {
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
