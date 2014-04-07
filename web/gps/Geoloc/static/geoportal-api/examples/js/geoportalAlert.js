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
 * Function: addTools
 * Call when a <Geoportal.Control.EditingToolbar> is activated to add new
 * tools to <Geoportal.Control.BasicToolbar>.
 *
 * Parameters:
 * evt - {<OpenLayers.Event>} evt.object holds the activated control.
 */
function addTools(evt) {
    if (!evt || !evt.object) { return; }
    var blc= evt.object.map.getControlsBy('id',evt.object.id.replace(/edit/,'basic'));
    if (blc==0) { return; }
    blc= blc[0];
    var cs= blc.getControlsByClass('Geoportal.Control.AddAttributeToLayer');
    if (cs.length!=0) { return; }
    var dl= new Geoportal.Control.AddAttributeToLayer(blc.layer,{
        uiOptions:{title: 'gpControlAddAttributeToLayer.title'},
        defaultAttributes:{
            'name':{
                defaultValue: "Libellé de l'anomalie",
                persistent: true
            },
            'description':{
                defaultValue: "Aucune",
                type: 'text',
                persistent:true
            }
        }});
    blc.addControls([dl]);
    cs= blc.getControlsByClass('Geoportal.Control.LayerStyling');
    if (cs.length!=0) { return; }
    dl= new Geoportal.Control.LayerStyling(blc.layer,{
        uiOptions:{title: 'gpControlLayerStyling.title'}
    });
    blc.addControls([dl]);
    cs= blc.getControlsByClass('Geoportal.Control.SaveLayer');
    if (cs.length!=0) { return; }
    dl= new Geoportal.Control.SaveLayer(blc.layer,{
        uiOptions:{title: 'gpControlSaveLayer.title'},
        url: '/geoportail/api/save'
    });
    blc.addControls([dl]);
    blc.activateControl(blc.getControlsByClass('Geoportal.Control.PanelToggle')[0]);//open toggle
}

/**
 * Function: closeFeatureInfo
 * Callback when a popup is closed.
 *
 *  Parameters:
 * evt - {<OpenLayers.Event>}
 */
function closeFeatureInfo(evt) {
    OpenLayers.Event.stop(evt);
    this.hide();//this===OpenLayers.Popup
    if (OpenLayers.Util.getBrowserName() == 'firefox') {
        if (this.map && this.map.events) {
            this.map.events.unregister("movestart", this, this.onMoveStartPopup);//See OpenLayers patch
            this.map.events.unregister("moveend", this, this.onMoveEndPopup);
        }
    }
    if (this.feature) {
        this.feature.layer.drawFeature(this.feature, "default");
        OpenLayers.Util.removeItem(this.feature.layer.selectedFeatures, this.feature);
        onUnselectCallback(this.feature);
    }
}

/**
 * Function: onSelectCallback
 * Callback when a feature gets selected.
 *      Called by <OpenLayers.Control.SelectFeature.select>().
 *
 * Parameters:
 * feature - {<OpenLayers.Feature.Vector>} currently selected object.
 */
function onSelectCallback(feature) {
    if (feature && feature.layer && feature.layer.map) {
        if (!feature.popup) {
            var bA= function(n,f) { return '__featureInfo'+n+f.id+'__'; };
            var ll= feature.geometry.getBounds().getCenterLonLat();
            var nm= '';
            var atts= '';
            for (var i= 0, l= feature.layer.schema.length; i<l; i++) {
                var a= feature.layer.schema[i];
                var id= bA(a.attributeName,feature.id);
                var v= (feature.attributes[a.attributeName]?
                    feature.attributes[a.attributeName]
                :   a.defaultValue || '').replace(/'/g,"&#39;");
                if (a.attributeName==='name') {
                    nm= '<input type="text" size="22" value="'+v+'" id="'+id+'" name="'+id+'"/>';
                    continue;
                }
                var h= '<label id="lbl'+id+'" for="'+id+'">'+a.attributeName+'</label>&nbsp;:<br/>';
                if (a.type==='text') {
                    h+= '<textarea id="'+id+'" name="'+id+'" rows="5" cols="25">' + v + '</textarea>';
                } else {
                    h+= '<input type="text" size="22" value="'+v+'" id="'+id+'" name="'+id+'"/>';
                }
                h+= '<br/>';
                atts+= h;
            }
            feature.popup= new OpenLayers.Popup.FramedCloud(
                "chicken",
                ll,
                null,
                "<form id='edit"+ bA('',feature.id) + "' action='javascript:(void)null'>" +
                    "<div class='gpPopupHead'>" + nm + "</div>" +
                    "<div class='gpPopupBody'>" + atts + "</div>" +
                "</form>",
                null,
                true,
                closeFeatureInfo);
            feature.popup.autoSize= true;
            feature.popup.minSize= new OpenLayers.Size(200, 120);
            feature.popup.maxSize= new OpenLayers.Size(200, 200);
            feature.popup.feature= feature;//mimic Geoportal.Popup (See closeFeatureInfo)
        }
        if (feature.popup) {
            feature.layer.map.addPopup(feature.popup,true);
            var kbControl= viewer.getVariable('kbControl');
            for (var i= 0, l= feature.layer.schema.length; i<l; i++) {
                var a= feature.layer.schema[i];
                var id= bA(a.attributeName,feature.id);
                var npt= OpenLayers.Util.getElement(id);
                // closure for capturing each attribute and DOM element :
                (function(att,el) {
                    el.onfocus= function() {
                        if (kbControl && kbControl.active) {
                            kbControl.deactivate();
                        }
                    };
                    el.onblur= function() {
                        if (kbControl && !kbControl.active) {
                            kbControl.activate();
                        }
                        if (this.value) {//WARNING: text/textarea ok - select ! ok
                            feature.attributes[att.attributeName]=
                                this.value.replace(/&#039;/g,"'").replace(/\r/g,"_br_") ||  att.defautValue || '';
                        }
                        this.blur();
                    };
                })(a,npt);
            }
        }
    }
}

/**
 * Function: onUnselectCallback
 * Callback when a feature gets deselected.
 *      Called by <OpenLayers.Control.SelectFeature.unselect>().
 *
 * Parameters:
 * feature - {<OpenLayers.Feature.Vector>} currently selected object.
 */
function onUnselectCallback(feature) {
    Geoportal.Control.unselectFeature(feature);
    setStyle(
        feature,
        //feature.attributes['icon'] ?
        //    feature.attributes['icon']
        //:
            '',
        false
    );
    feature.layer.drawFeature(feature,'default');
}

/**
 * Function: beforeFeatureAddedLayerListener
 * Unselect all features except the one accessed through the object
 * parameter. Assign "select" rendering. Called before the feature is
 * drawn.
 *
 * Parameters:
 * object - {Object}
 *
 * Returns:
 * {Boolean} true
 */
function beforeFeatureAddedLayerListener(object) {
    if (object.feature.layer.format) {
        // KML, GPX, OSM
        return true;
    }
    unselectAll(object.feature);
    // add attributes :
    if (object.feature.layer.schema) {
        for (var i= 0, l= object.feature.layer.schema.length; i<l; i++) {
            var a= object.feature.layer.schema[i];
            if (typeof(object.feature.attributes[a.attributeName])=='undefined') {
                object.feature.attributes[a.attributeName]= a.defaultValue;
            }
        }
    }
    setStyle(object.feature,
        //object.feature.attributes['icon'] ?
        //    object.feature.attributes['icon']
        '',
        true
    );
    onSelectCallback(object.feature);
    return true;
}

/**
 * Function: featureAddedLayerListener
 * Push the feature accessed through the object parameter into the
 * underlaying layer selectedFeatures list.
 *
 * Parameters:
 * object - {Object}
 *
 * Returns:
 * {Boolean} true
 */
function featureAddedLayerListener(object) {
    if (object.feature.layer.format) {
        // KML, GPX
        return true;
    }
    if (OpenLayers.Util.indexOf(object.feature.layer.selectedFeatures,object.feature)==-1) {
        object.feature.layer.selectedFeatures.push(object.feature);
    }
    return true;
}

/**
 * Function: beforeFeatureSelectedLayerListener
 * Unselect all features except the one accessed through the object
 * parameter. Assign "select" rendering. Called before the feature is
 * drawn.
 *
 * Parameters:
 * object - {Object}
 *      - object instanceof OpenLayers.Layers.Vector ;
 *      - object instanceof OpenLayers.Control.ModifyFeature (then raise
 *      "beforefeaturemodified");
 *
 * Returns:
 * {Boolean} true
 */
function beforeFeatureSelectedLayerListener(object) {
    unselectAll(object.feature);
    setStyle(object.feature,
        //object.feature.attributes['icon'] ?
        //    object.feature.attributes['icon']
        //:
        '',
        true
    );
    return true;
}

/**
 * Function: featureSelectedLayerListener
 * Print out the selected feature.
 *
 * Parameters:
 * object - {Object}
 *      - object instanceof OpenLayers.Layers.Vector ;
 *      - object instanceof OpenLayers.Control.ModifyFeature ;
 *
 * Returns:
 * {Boolean} true
 */
function featureSelectedLayerListener(object) {
    return true;
}

/**
 * Function: featureUnselectedLayerListener
 * Raised by OpenLayers.Control.SelectFeature.unselect().
 *
 * Parameters:
 * object - {Object}
 *      - object instanceof OpenLayers.Layers.Vector ;
 *      - object instanceof OpenLayers.Control.ModifyFeature : catch by
 *      OpenLayers.Control.ModifyFeature.unselectFeature() ;
 *
 * Returns:
 * {Boolean} true
 */
function featureUnselectedLayerListener(object) {
    Geoportal.Control.unselectFeature(object.feature);
    setStyle(
        object.feature,
        //feature.attributes['icon'] ?
        //    feature.attributes['icon']
        //:
            '',
        false
    );
    object.feature.layer.drawFeature(object.feature,'default');
    return true;
}

/**
 * Function: featureAddedDrawFeatureListener
 * Assigns the feature's state to *OpenLayers.State.INSERT* and print out
 * the feature.
 *
 * Parameters:
 * object - {Object}
 *
 * Returns:
 * {Boolean} true
 */
function featureAddedDrawFeatureListener(object) {
    object.feature.state= OpenLayers.State.INSERT;
    return true;
}

/**
 * Function: onStartDragFeatureCallback
 * Callback when a feature gets dragged.
 *      Called by <OpenLayers.Control.DragFeature.downFeature>().
 *      Unselect all other features. Add the feature to the selected list
 *      of features, set rendering to "select", draw the feature and print
 *      the feature out.
 *
 * Parameters:
 * feature - {<OpenLayers.Feature.Vector>} feature being selected.
 * px - {<OpenLayers.Pixel>} pixel location of mouse event.
 */
function onStartDragFeatureCallback(feature, px) {
    if (!feature) {
        return;
    }
    unselectAll(feature);
    feature.layer.selectedFeatures.push(feature);
    setStyle(
        feature,
        //feature.attributes['icon'] ?
        //    feature.attributes['icon']
        //:
            '',
        true
    );
    feature.layer.drawFeature(feature,'select');
}

/**
 * Function: beforeFeatureModifiedModifyFeatureListener
 * Unselect features except the one that is going to be modified.
 *
 * Parameters:
 * object - {Object}
 *
 * Returns:
 * {Boolean} true
 */
function beforeFeatureModifiedModifyFeatureListener(object) {
    if (!object || !object.feature) {
        return;
    }
    unselectAll(object.feature);
    return true;
}

/**
 * Function: featureModifiedModifyFeatureListener
 * Print out the new feature.
 *
 * Parameters:
 * object - {Object}
 *
 * Returns:
 * {Boolean} true
 */
function featureModifiedModifyFeatureListener(object) {
    return true;
}

/**
 * Function: afterFeatureModifiedModifyFeatureListener
 * FIXME : mainly called with object.feature being the unselected feature
 * (See OpenLayers.Control.ModifyFeature.unselectFeature()).
 *
 * Parameters:
 * object - {Object} object instanceof OpenLayers.Feature.Vector ;
 *
 * Returns:
 * {Boolean} true
 */
function afterFeatureModifiedModifyFeatureListener(object) {
    return true;
}

/**
 * Function: featureDeleteDeleteFeatureListener
 * Callback when a feature gets deleted.
 *      Called by <Geoportal.Control.DeleteFeature.deleteFeature>().
 *
 * Parameters:
 * object - {Object} object instanceof OpenLayers.Feature.Vector ;
 *
 * Returns:
 * {Boolean} true
 */
function featureDeleteDeleteFeatureListener(object) {
    return true;
}

/**
 * Function: setStyle
 * Assigns styles on selection/deselection.
 *
 * Parameters:
 * feature - {<OpenLayers.Feature.Vector>} feature being
 *      selected/unselected.
 * ico - {String} icon acronym. If none, null or empty.
 * selectIt - {Boolean} true if the feature is being selected, false
 *      otherwise.
 */
function setStyle(feature,ico,selectIt) {
    if (!feature.layer.format ||
        !feature.layer.format.prototype ||
        !feature.layer.format.prototype.CLASS_NAME.match(/.*\.Format\.(KML|GPX)$/)) {
        // Point :
        if (feature.geometry.CLASS_NAME.search(/Point$/i)!=-1) {
            if (ico && ico.length>0) {
                // FIXME: url ?
                if (!feature.style) {
                    // IE does like .default. notation ...
                    feature.style= new OpenLayers.Style(feature.layer.styleMap.styles['default'].defaultStyle);
                }
                feature.style.externalGraphic= "icon/icn"+ico+".gif";
                feature.style.fillOpacity= 1;
                if (selectIt) {
                    feature.style.pointRadius= 12;
                } else {
                    feature.style.pointRadius=  8;
                }
            } else {
                if (feature.style) {
                    feature.style.destroy();
                    feature.style= null;
                }
            }
        }
        // by default, use feature.layer.styleMap.styles :
        if (selectIt) {
            feature.renderIntent= 'select';
        } else {
            feature.renderIntent= 'default';
        }
    }
    //force redraw later (especially because of label display) :
    feature.layer.drawFeature(feature,{display:'none'});
}

/**
 * Function: unselectAll
 * Unselect all currently selected features.
 *
 * Parameters:
 * feature - {<OpenLayers.Feature.Vector>} the feature being selected.
 */
function unselectAll(feature) {
    var cntrls= viewer.getMap().getControlsByClass('Geoportal.Control.EditingToolbar');
    for (var i= 0, il= cntrls.length; i<il; i++) {
        var p= cntrls[i];
        var sa= p.getControlsByClass('OpenLayers.Control.SelectFeature');
        if (!(sa && sa.length>0 && sa[0])) {
            continue;
        }
        var s= sa[0];
        if (p.controls[0].layer != feature.layer) {
            s.unselectAll();
        } else {
            s.unselectAll({except:feature});
        }
    }
}

/**
 * Function: loadInterface
 * User interface initialization.
 */
function loadInterface() {
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
    if (!VIEWEROPTIONS.infoPanel) {
        viewer.setInformationPanelVisibility(false);
    }

    // add "Print Map" :
    var nv= viewer.getMap().getControlsByClass('Geoportal.Control.NavToolbar')[0];
    nv.addControls([new Geoportal.Control.PrintMap()]);

    var tbx= viewer.getMap().getControlsByClass('Geoportal.Control.ToolBox')[0];
    // add "Measure toolbar" :
    var measurebar= new Geoportal.Control.MeasureToolbar(
        {
            div: OpenLayers.Util.getElement(tbx.id+'_measure'),
            displaySystem:
                (viewer.getMap().getProjection().proj.projName=='longlat'?
                    'geographic'
                :   'metric'),
            targetElement: OpenLayers.Util.getElement(tbx.id+'_meares')
        }
    );
    viewer.getMap().addControl(measurebar);
    // add "Search Toolbar" :
    var searchbar= new Geoportal.Control.SearchToolbar(
        {
            div: OpenLayers.Util.getElement(tbx.id+'_search'),
            geonamesOptions: {
                setZoom: Geoportal.Control.LocationUtilityService.GeoNames.setZoomForBDNyme,
                layerOptions: {
                    name: 'PositionOfInterest:OPENLS;Geocode',
                    formatOptions: {
                    }
                }
            },
            geocodeOptions: {
                layerOptions: {
                    name: 'StreetAddress:OPENLS;Geocode',
                    formatOptions: {
                    }
                },
                matchTypes: [
                    {re:/city/i,    src:Geoportal.Util.getImagesLocation()+'OLScity.gif'},
                    {re:/street$/i, src:Geoportal.Util.getImagesLocation()+'OLSstreet.gif'},
                    {re:/number/i,  src:Geoportal.Util.getImagesLocation()+'OLSstreetnumber.gif'},
                    {re:/enhanced/i,src:Geoportal.Util.getImagesLocation()+'OLSstreetenhanced.gif'},
                    {re:null,       src:Geoportal.Util.getImagesLocation()+'OLSstreet.gif'}
                ]
            }
        }
    );
    viewer.getMap().addControl(searchbar);
    // add "Layer Toolbar" :
    var vevnts= {
        "beforefeatureadded"    : beforeFeatureAddedLayerListener,
        "featureadded"          : featureAddedLayerListener,
        "beforefeatureselected" : beforeFeatureSelectedLayerListener,
        "featureselected"       : featureSelectedLayerListener,
        "featureunselected"     : featureUnselectedLayerListener,
        // sounds like "beforefeatureunselected" event is missing !
        "beforefeaturemodified" : beforeFeatureModifiedModifyFeatureListener,
        "featuremodified"       : featureModifiedModifyFeatureListener,
        "afterfeaturemodified"  : afterFeatureModifiedModifyFeatureListener
    };
    var addLbar= new Geoportal.Control.LayerToolbar(
        {
            div: OpenLayers.Util.getElement(tbx.id+'_addlyr'),
            // Geoportal.Control.AddVectorLayer options :
            addVectorLayerOptions: {
                supportedClasses: [
                    'OpenLayers.Geometry.Point',
                    'OpenLayers.Geometry.LineString',
                    'OpenLayers.Geometry.Polygon',
                    'OpenLayers.Format.KML',
                    'Geoportal.Format.GPX',
                    'OpenLayers.Format.OSM'],
                // OpenLayers.Layer.Vector options :
                styleMapTemplates: VIEWEROPTIONS.layerStyleMap,
                layerVectorOptions: {
                    'OpenLayers.Geometry.Point':{
                        eventListeners: vevnts
                    },
                    'OpenLayers.Geometry.LineString':{
                        eventListeners: vevnts
                    },
                    'OpenLayers.Geometry.Polygon':{
                        eventListeners: vevnts
                    }
                },
                // Geoportal.Control.EditingToolbar options :
                drawFeatureOptions: {
                    'OpenLayers.Geometry.Point':{
                        eventListeners: {
                            "featureadded" : featureAddedDrawFeatureListener
                        }
                    },
                    'OpenLayers.Geometry.LineString':{
                        eventListeners: {
                            "featureadded" : featureAddedDrawFeatureListener
                        }
                    },
                    'OpenLayers.Geometry.Polygon':{
                        eventListeners: {
                            "featureadded" : featureAddedDrawFeatureListener
                        }
                    }
                },
                dragFeatureOptions: {
                    'OpenLayers.Geometry.Point':{
                        onStart: onStartDragFeatureCallback
                        //onDrag:
                        //onComplete:
                    },
                    'OpenLayers.Geometry.LineString':{
                        onStart: onStartDragFeatureCallback
                        //onDrag:
                        //onComplete:
                    },
                    'OpenLayers.Geometry.Polygon':{
                        onStart: onStartDragFeatureCallback
                        //onDrag:
                        //onComplete:
                    }
                },
                modifyFeatureOptions: {
                    //'OpenLayers.Geometry.Point':{
                    //    eventListeners: {
                    //    }
                    //},
                    //'OpenLayers.Geometry.LineString':{
                    //    eventListeners: {
                    //    }
                    //},
                    //'OpenLayers.Geometry.Polygon':{
                    //    eventListeners: {
                    //    }
                    //}
                },
                deleteFeatureOptions: {
                    'OpenLayers.Geometry.Point':{
                        eventListeners: {
                            "featuredeleted" : featureDeleteDeleteFeatureListener
                        }
                    },
                    'OpenLayers.Geometry.LineString':{
                        eventListeners: {
                            "featuredeleted" : featureDeleteDeleteFeatureListener
                        }
                    },
                    'OpenLayers.Geometry.Polygon':{
                        eventListeners: {
                            "featuredeleted" : featureDeleteDeleteFeatureListener
                        }
                    }
                },
                selectFeatureOptions: {
                    'OpenLayers.Geometry.Point':{
                        onSelect: onSelectCallback,
                        onUnselect: onUnselectCallback,
                        hover: false
                    },
                    'OpenLayers.Geometry.LineString':{
                        onSelect: onSelectCallback,
                        onUnselect: onUnselectCallback,
                        hover: false
                    },
                    'OpenLayers.Geometry.Polygon':{
                        onSelect: onSelectCallback,
                        onUnselect: onUnselectCallback,
                        hover: false
                    }
                },
                editingToolbarOptions: {
                    'OpenLayers.Geometry.Point':{
                        eventListeners: {
                            "activate" : addTools
                        }
                    },
                    'OpenLayers.Geometry.LineString':{
                        eventListeners: {
                            "activate" : addTools
                        }
                    },
                    'OpenLayers.Geometry.Polygon':{
                        eventListeners: {
                            "activate" : addTools
                        }
                    }
                }
            }
        }
    );
    viewer.getMap().addControl(addLbar);
    // activate the navigation :
    var nvc= viewer.getMap().getControlsByClass('Geoportal.Control.NavToolbar')[0];
    nvc.activateControl(nvc.getControlsByClass('OpenLayers.Control.Navigation')[0]);

    var e= OpenLayers.Util.getElement('gpVisibility');
    e.onclick= function() {
        var v= viewer.div;
        var h= OpenLayers.Util.getElement('helpDiv');
        if (v.style.visibility=='hidden') {
            v.style.visibility= '';
            h.style.visibility= 'hidden';
            this.value= "Afficher l'aide";
        } else {
            v.style.visibility= 'hidden';
            h.style.visibility= '';
            this.value= "Afficher la carte";
        }
        this.blur();
    };

    e= OpenLayers.Util.getElement('page');
    e.style.height= (
                     OpenLayers.Util.getElement('title').clientHeight +
                     OpenLayers.Util.getElement('__intro__').clientHeight +
                     OpenLayers.Util.getElement('overlayDiv').clientHeight +
                     OpenLayers.Util.getElement('helpToggle').clientHeight +
                     OpenLayers.Util.getElement('footer').clientHeight +
                     100
                    ) +
                    "px";

    //IGN Saint Mande:
    viewer.getMap().setCenterAtLonLat(2.424, 48.844, 13);
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

    OpenLayers.Lang.setCode('fr'); // ensure French

    var lblOpts= {
            label:"${getName}",
            labelAlign: "rt",
            labelXOffset: 20,
            labelYOffset: 20,
            labelHaloColor:'white',
            labelHaloWidth:'2px',
            fontColor:'black',
            fontWeight:'normal',
            fontSize:'12px',
            fontFamily:'Courier New, monospace'
    };
    var ctxOpts= {
        context:{
            getName: function(f) {
                if (f && f.attributes && f.attributes['name']) {
                    return f.attributes['name'];
                }
                return '';
            }
        }
    };
    var defOpts= OpenLayers.Util.applyDefaults({
            fillColor: "#99CCFF",
            strokeColor: "#99CCFF",
            cursor: "pointer"
        },
        OpenLayers.Feature.Vector.style["default"]
    );
    var selOpts= OpenLayers.Util.applyDefaults({
            fillColor: "#99CCFF",
            strokeColor: "#99CCFF",
            cursor: "pointer"
        },
        OpenLayers.Feature.Vector.style["select"]
    );
    var tmpOpts= OpenLayers.Util.applyDefaults({
            fillColor: "#99CCFF",
            strokeColor: "#99CCFF",
            cursor: "pointer",
            display: "none"
        },
        OpenLayers.Feature.Vector.style["temporary"]
    );
    VIEWEROPTIONS= {
        mode: 'normal',
        territory: 'FXX',
        displayProjection: ['IGNF:RGF93G','IGNF:LAMB93','IGNF:LAMBE','IGNF:ETRS89LCC'],
        layerSwitcher: 'on',    // on, off, mini
        toolboxCtrl: 'on',      // on, off, mini
        infoPanel: true,        // true, false
        layerOptions: {
            'GEOGRAPHICALGRIDSYSTEMS.MAPS' : {
                opacity : 0.3
            },
            'ORTHOIMAGERY.ORTHOPHOTOS'     : {
                visibility : true
            }
        },
        layerStyleMap: {
            "OpenLayers.Geometry.Point"     :
                new OpenLayers.StyleMap({
                    "default"   : new OpenLayers.Style(
                        OpenLayers.Util.applyDefaults(
                            OpenLayers.Util.applyDefaults({pointRadius:  8}, defOpts),
                            lblOpts
                        ),
                        ctxOpts
                    ),
                    "select"    : new OpenLayers.Style(
                        OpenLayers.Util.applyDefaults(
                            OpenLayers.Util.applyDefaults({pointRadius: 12}, selOpts),
                            lblOpts
                        ),
                        ctxOpts
                    ),
                    "temporary" : new OpenLayers.Style(
                        OpenLayers.Util.applyDefaults(
                            OpenLayers.Util.applyDefaults({}, tmpOpts),
                            lblOpts
                        ),
                        ctxOpts
                    )
                },{extendDefault:false}),
            "OpenLayers.Geometry.LineString":
                new OpenLayers.StyleMap({
                    "default"   : new OpenLayers.Style(
                        OpenLayers.Util.applyDefaults(
                            OpenLayers.Util.applyDefaults({strokeWidth: 2}, defOpts),
                            lblOpts
                        ),
                        ctxOpts
                    ),
                    "select"    : new OpenLayers.Style(
                        OpenLayers.Util.applyDefaults(
                            OpenLayers.Util.applyDefaults({strokeWidth: 4}, selOpts),
                            lblOpts
                        ),
                        ctxOpts
                    ),
                    "temporary" : new OpenLayers.Style(
                        OpenLayers.Util.applyDefaults(
                            OpenLayers.Util.applyDefaults({}, tmpOpts),
                            lblOpts
                        ),
                        ctxOpts
                    )
                },{extendDefault:false}),
            "OpenLayers.Geometry.Polygon"   :
                new OpenLayers.StyleMap({
                    "default"   : new OpenLayers.Style(
                        OpenLayers.Util.applyDefaults(
                            OpenLayers.Util.applyDefaults({strokeWidth: 2}, defOpts),
                            lblOpts
                        ),
                        ctxOpts
                    ),
                    "select"    : new OpenLayers.Style(
                        OpenLayers.Util.applyDefaults(
                            OpenLayers.Util.applyDefaults({strokeWidth: 4}, selOpts),
                            lblOpts
                        ),
                        ctxOpts
                    ),
                    "temporary" : new OpenLayers.Style(
                        OpenLayers.Util.applyDefaults(
                            OpenLayers.Util.applyDefaults({}, tmpOpts),
                            lblOpts
                        ),
                        ctxOpts
                    )
                },{extendDefault:false}),
            "OpenLayers.Format.KML"         :
                new OpenLayers.StyleMap({
                    "default"   : new OpenLayers.Style(
                        OpenLayers.Util.applyDefaults({strokeWidth: 2, pointRadius: 8}, defOpts)
                    ),
                    "select"    : new OpenLayers.Style(
                        OpenLayers.Util.applyDefaults({strokeWidth: 4, pointRadius:12}, selOpts)
                    ),
                    "temporary" : new OpenLayers.Style(
                        OpenLayers.Util.applyDefaults({}, tmpOpts)
                    )
                },{extendDefault:false}),
            "Geoportal.Format.GPX"          :
                new OpenLayers.StyleMap({
                    "default"   : new OpenLayers.Style(
                        OpenLayers.Util.applyDefaults({strokeWidth: 2, pointRadius: 8}, defOpts)
                    ),
                    "select"    : new OpenLayers.Style(
                        OpenLayers.Util.applyDefaults({strokeWidth: 4, pointRadius:12}, selOpts)
                    ),
                    "temporary" : new OpenLayers.Style(
                        OpenLayers.Util.applyDefaults({}, tmpOpts)
                    )
                },{extendDefault:false}),
            "OpenLayers.Format.OSM"          :
                new OpenLayers.StyleMap({
                    "default"   : new OpenLayers.Style(
                        OpenLayers.Util.applyDefaults({strokeWidth: 2, pointRadius: 8}, defOpts)
                    ),
                    "select"    : new OpenLayers.Style(
                        OpenLayers.Util.applyDefaults({strokeWidth: 4, pointRadius:12}, selOpts)
                    ),
                    "temporary" : new OpenLayers.Style(
                        OpenLayers.Util.applyDefaults({}, tmpOpts)
                    )
                },{extendDefault:false})
        }
    };

    //Add translations
    translate();

    // Initialiser l'application
    //options for creating viewer:
    var options= {
        // default value
        // valeur par défaut
        mode:VIEWEROPTIONS.mode,
        // default value
        // valeur par défaut
        territory:VIEWEROPTIONS.territory,
        // default value
        // valeur par défaut
        projection:VIEWEROPTIONS.projection,
        // default value
        // valeur par défaut
        displayProjection:VIEWEROPTIONS.displayProjection,
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
        'GEOGRAPHICALGRIDSYSTEMS.MAPS'
    ],VIEWEROPTIONS.layerOptions);
    var kbControl= viewer.getMap().getControlsByClass(OpenLayers.Control.KeyboardDefaults.prototype.CLASS_NAME)[0];
    viewer.setVariable('kbControl', kbControl);
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
        onContractsFail: function() {
            Geoportal.GeoRMHandler.parseAutoConf(
                ['nhf8wztv3m9wglcda6n6cbuf'],
                Geoportal.GeoRMHandler.getGeormServerUrl().replace('$key$/','nhf8wztv3m9wglcda6n6cbuf'+'/id/'),
                Geoportal.GeoRMHandler.getContract,
                {
                    data:{
                        http:{
                            status:200,
                            error:null
                        },
                        xml:
'<?xml version="1.0" encoding="UTF-8"?>'+
'<ViewContext xmlns="http://www.opengis.net/context" xmlns:gpp="http://api.ign.fr/geoportail" xmlns:ows="http://www.opengis.net/ows/1.1" xmlns:sld="http://www.opengis.net/sld" xmlns:wmts="http://www.opengis.net/wmts/1.0" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" id="autoConf" version="1.1.0" xsi:schemaLocation="http://www.opengis.net/context http://gpp3-wxs.ign.fr/schemas/extContext.xsd http://api.ign.fr/geoportail http://gpp3-wxs.ign.fr/schemas/autoconf.xsd">'+
 '<General>'+
  '<Window height="300" width="500"/>'+
  '<BoundingBox SRS="EPSG:4326" maxx="180.0" maxy="90.0" minx="-90.0" miny="-180.0"/>'+
  '<Title>Service d\'autoconfiguration des API</Title>'+
  '<Extension>'+
   '<gpp:General>'+
    '<gpp:Theme>default</gpp:Theme>'+
    '<gpp:Territories>'+
     '<gpp:Territory default="1" id="FXX" name="FXX">'+
      '<gpp:defaultCRS>EPSG:3857</gpp:defaultCRS>'+
      '<gpp:AdditionalCRS>CRS:84</gpp:AdditionalCRS>'+
      '<gpp:BoundingBox>-31.17,27.33,69.03,80.83</gpp:BoundingBox>'+
      '<sld:MinScaleDenominator>533</sld:MinScaleDenominator>'+
      '<sld:MaxScaleDenominator>128209039</sld:MaxScaleDenominator>'+
      '<gpp:Resolution>2445.984905</gpp:Resolution>'+
      '<gpp:Center>'+
       '<gpp:x>2.345274398</gpp:x>'+
       '<gpp:y>48.860832558</gpp:y>'+
      '</gpp:Center>'+
      '<gpp:DefaultLayers>'+
       '<gpp:DefaultLayer layerId="ORTHOIMAGERY.ORTHOPHOTOS$GEOPORTAIL:OGC:WMTS"/>'+
       '<gpp:DefaultLayer layerId="GEOGRAPHICALGRIDSYSTEMS.MAPS$GEOPORTAIL:OGC:WMTS"/>'+
       '<gpp:DefaultLayer layerId="CADASTRALPARCELS.PARCELS$GEOPORTAIL:OGC:WMTS"/>'+
      '</gpp:DefaultLayers>'+
     '</gpp:Territory>'+
     '<gpp:Territory id="WLD" name="WLD">'+
      '<gpp:defaultCRS>EPSG:3857</gpp:defaultCRS>'+
      '<gpp:AdditionalCRS>CRS:84</gpp:AdditionalCRS>'+
      '<gpp:BoundingBox>-180,-90,180,90</gpp:BoundingBox>'+
      '<sld:MinScaleDenominator>533</sld:MinScaleDenominator>'+
      '<sld:MaxScaleDenominator>128209039</sld:MaxScaleDenominator>'+
      '<gpp:Resolution>156543.033928</gpp:Resolution>'+
      '<gpp:Center>'+
       '<gpp:x>0.0</gpp:x>'+
       '<gpp:y>0.0</gpp:y>'+
      '</gpp:Center>'+
      '<gpp:DefaultLayers>'+
       '<gpp:DefaultLayer layerId="ORTHOIMAGERY.ORTHOPHOTOS$GEOPORTAIL:OGC:WMTS"/>'+
       '<gpp:DefaultLayer layerId="GEOGRAPHICALGRIDSYSTEMS.MAPS$GEOPORTAIL:OGC:WMTS"/>'+
      '</gpp:DefaultLayers>'+
     '</gpp:Territory>'+
    '</gpp:Territories>'+
    '<gpp:TileMatrixSets>'+
     '<wmts:TileMatrixSet>'+
      '<ows:Identifier>PM</ows:Identifier>'+
      '<ows:SupportedCRS>EPSG:3857</ows:SupportedCRS>'+
      '<wmts:TileMatrix>'+
       '<ows:Identifier>0</ows:Identifier>'+
       '<wmts:ScaleDenominator>559082264.0287178958533332</wmts:ScaleDenominator>'+
       '<wmts:TopLeftCorner>-20037508 20037508</wmts:TopLeftCorner>'+
       '<wmts:TileWidth>256</wmts:TileWidth>'+
       '<wmts:TileHeight>256</wmts:TileHeight>'+
       '<wmts:MatrixWidth>1</wmts:MatrixWidth>'+
       '<wmts:MatrixHeight>1</wmts:MatrixHeight>'+
      '</wmts:TileMatrix>'+
      '<wmts:TileMatrix>'+
       '<ows:Identifier>1</ows:Identifier>'+
       '<wmts:ScaleDenominator>279541132.0143588959472254</wmts:ScaleDenominator>'+
       '<wmts:TopLeftCorner>-20037508 20037508</wmts:TopLeftCorner>'+
       '<wmts:TileWidth>256</wmts:TileWidth>'+
       '<wmts:TileHeight>256</wmts:TileHeight>'+
       '<wmts:MatrixWidth>2</wmts:MatrixWidth>'+
       '<wmts:MatrixHeight>2</wmts:MatrixHeight>'+
      '</wmts:TileMatrix>'+
      '<wmts:TileMatrix>'+
       '<ows:Identifier>10</ows:Identifier>'+
       '<wmts:ScaleDenominator>545978.7734655447186469</wmts:ScaleDenominator>'+
       '<wmts:TopLeftCorner>-20037508 20037508</wmts:TopLeftCorner>'+
       '<wmts:TileWidth>256</wmts:TileWidth>'+
       '<wmts:TileHeight>256</wmts:TileHeight>'+
       '<wmts:MatrixWidth>1024</wmts:MatrixWidth>'+
       '<wmts:MatrixHeight>1024</wmts:MatrixHeight>'+
      '</wmts:TileMatrix>'+
      '<wmts:TileMatrix>'+
       '<ows:Identifier>11</ows:Identifier>'+
       '<wmts:ScaleDenominator>272989.3867327723085907</wmts:ScaleDenominator>'+
       '<wmts:TopLeftCorner>-20037508 20037508</wmts:TopLeftCorner>'+
       '<wmts:TileWidth>256</wmts:TileWidth>'+
       '<wmts:TileHeight>256</wmts:TileHeight>'+
       '<wmts:MatrixWidth>2048</wmts:MatrixWidth>'+
       '<wmts:MatrixHeight>2048</wmts:MatrixHeight>'+
      '</wmts:TileMatrix>'+
      '<wmts:TileMatrix>'+
       '<ows:Identifier>12</ows:Identifier>'+
       '<wmts:ScaleDenominator>136494.6933663861796617</wmts:ScaleDenominator>'+
       '<wmts:TopLeftCorner>-20037508 20037508</wmts:TopLeftCorner>'+
       '<wmts:TileWidth>256</wmts:TileWidth>'+
       '<wmts:TileHeight>256</wmts:TileHeight>'+
       '<wmts:MatrixWidth>4096</wmts:MatrixWidth>'+
       '<wmts:MatrixHeight>4096</wmts:MatrixHeight>'+
      '</wmts:TileMatrix>'+
      '<wmts:TileMatrix>'+
       '<ows:Identifier>13</ows:Identifier>'+
       '<wmts:ScaleDenominator>68247.3466831930771477</wmts:ScaleDenominator>'+
       '<wmts:TopLeftCorner>-20037508 20037508</wmts:TopLeftCorner>'+
       '<wmts:TileWidth>256</wmts:TileWidth>'+
       '<wmts:TileHeight>256</wmts:TileHeight>'+
       '<wmts:MatrixWidth>8192</wmts:MatrixWidth>'+
       '<wmts:MatrixHeight>8192</wmts:MatrixHeight>'+
      '</wmts:TileMatrix>'+
      '<wmts:TileMatrix>'+
       '<ows:Identifier>14</ows:Identifier>'+
       '<wmts:ScaleDenominator>34123.6733415965449154</wmts:ScaleDenominator>'+
       '<wmts:TopLeftCorner>-20037508 20037508</wmts:TopLeftCorner>'+
       '<wmts:TileWidth>256</wmts:TileWidth>'+
       '<wmts:TileHeight>256</wmts:TileHeight>'+
       '<wmts:MatrixWidth>16384</wmts:MatrixWidth>'+
       '<wmts:MatrixHeight>16384</wmts:MatrixHeight>'+
      '</wmts:TileMatrix>'+
      '<wmts:TileMatrix>'+
       '<ows:Identifier>15</ows:Identifier>'+
       '<wmts:ScaleDenominator>17061.8366707982724577</wmts:ScaleDenominator>'+
       '<wmts:TopLeftCorner>-20037508 20037508</wmts:TopLeftCorner>'+
       '<wmts:TileWidth>256</wmts:TileWidth>'+
       '<wmts:TileHeight>256</wmts:TileHeight>'+
       '<wmts:MatrixWidth>32768</wmts:MatrixWidth>'+
       '<wmts:MatrixHeight>32768</wmts:MatrixHeight>'+
      '</wmts:TileMatrix>'+
      '<wmts:TileMatrix>'+
       '<ows:Identifier>16</ows:Identifier>'+
       '<wmts:ScaleDenominator>8530.9183353991362289</wmts:ScaleDenominator>'+
       '<wmts:TopLeftCorner>-20037508 20037508</wmts:TopLeftCorner>'+
       '<wmts:TileWidth>256</wmts:TileWidth>'+
       '<wmts:TileHeight>256</wmts:TileHeight>'+
       '<wmts:MatrixWidth>65536</wmts:MatrixWidth>'+
       '<wmts:MatrixHeight>65536</wmts:MatrixHeight>'+
      '</wmts:TileMatrix>'+
      '<wmts:TileMatrix>'+
       '<ows:Identifier>17</ows:Identifier>'+
       '<wmts:ScaleDenominator>4265.4591676995681144</wmts:ScaleDenominator>'+
       '<wmts:TopLeftCorner>-20037508 20037508</wmts:TopLeftCorner>'+
       '<wmts:TileWidth>256</wmts:TileWidth>'+
       '<wmts:TileHeight>256</wmts:TileHeight>'+
       '<wmts:MatrixWidth>131072</wmts:MatrixWidth>'+
       '<wmts:MatrixHeight>131072</wmts:MatrixHeight>'+
      '</wmts:TileMatrix>'+
      '<wmts:TileMatrix>'+
       '<ows:Identifier>18</ows:Identifier>'+
       '<wmts:ScaleDenominator>2132.7295838497840572</wmts:ScaleDenominator>'+
       '<wmts:TopLeftCorner>-20037508 20037508</wmts:TopLeftCorner>'+
       '<wmts:TileWidth>256</wmts:TileWidth>'+
       '<wmts:TileHeight>256</wmts:TileHeight>'+
       '<wmts:MatrixWidth>262144</wmts:MatrixWidth>'+
       '<wmts:MatrixHeight>262144</wmts:MatrixHeight>'+
      '</wmts:TileMatrix>'+
      '<wmts:TileMatrix>'+
       '<ows:Identifier>19</ows:Identifier>'+
       '<wmts:ScaleDenominator>1066.3647919248918304</wmts:ScaleDenominator>'+
       '<wmts:TopLeftCorner>-20037508 20037508</wmts:TopLeftCorner>'+
       '<wmts:TileWidth>256</wmts:TileWidth>'+
       '<wmts:TileHeight>256</wmts:TileHeight>'+
       '<wmts:MatrixWidth>524288</wmts:MatrixWidth>'+
       '<wmts:MatrixHeight>524288</wmts:MatrixHeight>'+
      '</wmts:TileMatrix>'+
      '<wmts:TileMatrix>'+
       '<ows:Identifier>2</ows:Identifier>'+
       '<wmts:ScaleDenominator>139770566.0071793960087234</wmts:ScaleDenominator>'+
       '<wmts:TopLeftCorner>-20037508 20037508</wmts:TopLeftCorner>'+
       '<wmts:TileWidth>256</wmts:TileWidth>'+
       '<wmts:TileHeight>256</wmts:TileHeight>'+
       '<wmts:MatrixWidth>4</wmts:MatrixWidth>'+
       '<wmts:MatrixHeight>4</wmts:MatrixHeight>'+
      '</wmts:TileMatrix>'+
      '<wmts:TileMatrix>'+
       '<ows:Identifier>20</ows:Identifier>'+
       '<wmts:ScaleDenominator>533.1823959624461134</wmts:ScaleDenominator>'+
       '<wmts:TopLeftCorner>-20037508 20037508</wmts:TopLeftCorner>'+
       '<wmts:TileWidth>256</wmts:TileWidth>'+
       '<wmts:TileHeight>256</wmts:TileHeight>'+
       '<wmts:MatrixWidth>1048576</wmts:MatrixWidth>'+
       '<wmts:MatrixHeight>1048576</wmts:MatrixHeight>'+
      '</wmts:TileMatrix>'+
      '<wmts:TileMatrix>'+
       '<ows:Identifier>21</ows:Identifier>'+
       '<wmts:ScaleDenominator>266.5911979812228585</wmts:ScaleDenominator>'+
       '<wmts:TopLeftCorner>-20037508 20037508</wmts:TopLeftCorner>'+
       '<wmts:TileWidth>256</wmts:TileWidth>'+
       '<wmts:TileHeight>256</wmts:TileHeight>'+
       '<wmts:MatrixWidth>2097152</wmts:MatrixWidth>'+
       '<wmts:MatrixHeight>2097152</wmts:MatrixHeight>'+
      '</wmts:TileMatrix>'+
      '<wmts:TileMatrix>'+
       '<ows:Identifier>3</ows:Identifier>'+
       '<wmts:ScaleDenominator>69885283.0035897239868063</wmts:ScaleDenominator>'+
       '<wmts:TopLeftCorner>-20037508 20037508</wmts:TopLeftCorner>'+
       '<wmts:TileWidth>256</wmts:TileWidth>'+
       '<wmts:TileHeight>256</wmts:TileHeight>'+
       '<wmts:MatrixWidth>8</wmts:MatrixWidth>'+
       '<wmts:MatrixHeight>8</wmts:MatrixHeight>'+
      '</wmts:TileMatrix>'+
      '<wmts:TileMatrix>'+
       '<ows:Identifier>4</ows:Identifier>'+
       '<wmts:ScaleDenominator>34942641.5017948619934032</wmts:ScaleDenominator>'+
       '<wmts:TopLeftCorner>-20037508 20037508</wmts:TopLeftCorner>'+
       '<wmts:TileWidth>256</wmts:TileWidth>'+
       '<wmts:TileHeight>256</wmts:TileHeight>'+
       '<wmts:MatrixWidth>16</wmts:MatrixWidth>'+
       '<wmts:MatrixHeight>16</wmts:MatrixHeight>'+
      '</wmts:TileMatrix>'+
      '<wmts:TileMatrix>'+
       '<ows:Identifier>5</ows:Identifier>'+
       '<wmts:ScaleDenominator>17471320.7508974309967016</wmts:ScaleDenominator>'+
       '<wmts:TopLeftCorner>-20037508 20037508</wmts:TopLeftCorner>'+
       '<wmts:TileWidth>256</wmts:TileWidth>'+
       '<wmts:TileHeight>256</wmts:TileHeight>'+
       '<wmts:MatrixWidth>32</wmts:MatrixWidth>'+
       '<wmts:MatrixHeight>32</wmts:MatrixHeight>'+
      '</wmts:TileMatrix>'+
      '<wmts:TileMatrix>'+
       '<ows:Identifier>6</ows:Identifier>'+
       '<wmts:ScaleDenominator>8735660.3754487154983508</wmts:ScaleDenominator>'+
       '<wmts:TopLeftCorner>-20037508 20037508</wmts:TopLeftCorner>'+
       '<wmts:TileWidth>256</wmts:TileWidth>'+
       '<wmts:TileHeight>256</wmts:TileHeight>'+
       '<wmts:MatrixWidth>64</wmts:MatrixWidth>'+
       '<wmts:MatrixHeight>64</wmts:MatrixHeight>'+
      '</wmts:TileMatrix>'+
      '<wmts:TileMatrix>'+
       '<ows:Identifier>7</ows:Identifier>'+
       '<wmts:ScaleDenominator>4367830.1877243577491754</wmts:ScaleDenominator>'+
       '<wmts:TopLeftCorner>-20037508 20037508</wmts:TopLeftCorner>'+
       '<wmts:TileWidth>256</wmts:TileWidth>'+
       '<wmts:TileHeight>256</wmts:TileHeight>'+
       '<wmts:MatrixWidth>128</wmts:MatrixWidth>'+
       '<wmts:MatrixHeight>128</wmts:MatrixHeight>'+
      '</wmts:TileMatrix>'+
      '<wmts:TileMatrix>'+
       '<ows:Identifier>8</ows:Identifier>'+
       '<wmts:ScaleDenominator>2183915.0938621788745877</wmts:ScaleDenominator>'+
       '<wmts:TopLeftCorner>-20037508 20037508</wmts:TopLeftCorner>'+
       '<wmts:TileWidth>256</wmts:TileWidth>'+
       '<wmts:TileHeight>256</wmts:TileHeight>'+
       '<wmts:MatrixWidth>256</wmts:MatrixWidth>'+
       '<wmts:MatrixHeight>256</wmts:MatrixHeight>'+
      '</wmts:TileMatrix>'+
      '<wmts:TileMatrix>'+
       '<ows:Identifier>9</ows:Identifier>'+
       '<wmts:ScaleDenominator>1091957.5469310886252288</wmts:ScaleDenominator>'+
       '<wmts:TopLeftCorner>-20037508 20037508</wmts:TopLeftCorner>'+
       '<wmts:TileWidth>256</wmts:TileWidth>'+
       '<wmts:TileHeight>256</wmts:TileHeight>'+
       '<wmts:MatrixWidth>512</wmts:MatrixWidth>'+
       '<wmts:MatrixHeight>512</wmts:MatrixHeight>'+
      '</wmts:TileMatrix>'+
     '</wmts:TileMatrixSet>'+
    '</gpp:TileMatrixSets>'+
    '<gpp:Resolutions>1.40625,0.703125,0.3515625,0.17578125,0.087890625,0.0439453125,0.02197265625,0.010986328125,0.0054931640625,0.00274658203125,0.001373291015625,0.0006866455078125,0.00034332275390625,0.000171661376953126,0.0000858306884765628,0.0000429153442382813,0.0000214576721191407,0.0000107288360595703,0.00000536441802978517,0.00000268220901489259,0.0000013411045074463,0.000000670552253723145,0.00000033527612686157</gpp:Resolutions>'+
    '<gpp:Services>'+
     '<Server service="GPP:PrintMap" title="Service d\'impression" version="1.0.0">'+
      '<OnlineResource xlink:href="http://gpp3-wxs.ign.fr/impression/api/document" xlink:type="simple"/>'+
     '</Server>'+
     '<Server service="GPP:SearchLayers" title="Service de recherche de couches" version="1.0.0">'+
      '<OnlineResource xlink:href="http://gpp3-wxs.ign.fr/search/layers" xlink:type="simple"/>'+
     '</Server>'+
    '</gpp:Services>'+
   '</gpp:General>'+
  '</Extension>'+
 '</General>'+
 '<LayerList>'+
  '<Layer hidden="0" queryable="0">'+
   '<Server service="OGC:WMTS" title="Cartes IGN" version="1.0.0">'+
    '<OnlineResource xlink:href="http://gpp3-wxs.ign.fr/wmts" xlink:type="simple"/>'+
   '</Server>'+
   '<Name>GEOGRAPHICALGRIDSYSTEMS.MAPS</Name>'+
   '<Title>Cartes IGN</Title>'+
   '<Abstract><![CDATA[Cartes IGN]]></Abstract>'+
   '<sld:MinScaleDenominator>2133</sld:MinScaleDenominator>'+
   '<sld:MaxScaleDenominator>559082265</sld:MaxScaleDenominator>'+
   '<FormatList>'+
    '<Format current="1">image/jpeg</Format>'+
   '</FormatList>'+
   '<StyleList>'+
    '<Style current="1">'+
     '<Name>normal</Name>'+
     '<Title>Données Brutes</Title>'+
    '</Style>'+
   '</StyleList>'+
   '<DimensionList>'+
    '<Dimension name="Type" unitSymbol="" units="" userValue="">2D</Dimension>'+
    '<Dimension name="VisibilityRange" unitSymbol="" units="" userValue="">0.5971642834779395,117407.27544603075,156543.033928041</Dimension>'+
    '<Dimension name="VisibilityMode" unitSymbol="" units="" userValue="">resolution</Dimension>'+
    '<Dimension name="NoDataValue" unitSymbol="" units="" userValue="">FFFFFF</Dimension>'+
   '</DimensionList>'+
   '<Extension>'+
    '<gpp:Layer id="GEOGRAPHICALGRIDSYSTEMS.MAPS$GEOPORTAIL:OGC:WMTS" order="9980000">'+
     '<gpp:Thematics>'+
      '<gpp:Thematic>Cartes</gpp:Thematic>'+
     '</gpp:Thematics>'+
     '<gpp:InspireThematics>'+
      '<gpp:InspireThematic>Dénominations géographiques</gpp:InspireThematic>'+
     '</gpp:InspireThematics>'+
     '<gpp:BoundingBox maxT="2012-08-01" minT="2012-08-01">-180.0,-90.0,180.0,90.0</gpp:BoundingBox>'+
     '<gpp:Originators>'+
      '<gpp:Originator name="IGN">'+
       '<gpp:Attribution>Institut national de l\'information géographique et forestière</gpp:Attribution>'+
       '<gpp:Logo>http://gpp3-wxs.ign.fr/static/logos/IGN/IGN.gif</gpp:Logo>'+
       '<gpp:URL>http://www.ign.fr</gpp:URL>'+
       '<gpp:Constraints>'+
        '<gpp:Constraint>'+
         '<gpp:CRS>EPSG:4326</gpp:CRS>'+
         '<gpp:BoundingBox maxT="2012-08-01" minT="2012-08-01">-180.0,-90.0,180.0,90.0</gpp:BoundingBox>'+
         '<sld:MinScaleDenominator>2133</sld:MinScaleDenominator>'+
         '<sld:MaxScaleDenominator>559082265</sld:MaxScaleDenominator>'+
        '</gpp:Constraint>'+
       '</gpp:Constraints>'+
      '</gpp:Originator>'+
     '</gpp:Originators>'+
     '<gpp:Legends>'+
      '<gpp:Legend>'+
       '<sld:MinScaleDenominator>2133</sld:MinScaleDenominator>'+
       '<gpp:LegendURL format="format">'+
        '<OnlineResource xlink:href="http://gpp3-wxs.ign.fr/static/legends/NOLEGEND.JPG" xlink:type="simple"/>'+
       '</gpp:LegendURL>'+
      '</gpp:Legend>'+
     '</gpp:Legends>'+
     '<gpp:QuickLook>'+
      '<OnlineResource xlink:href="http://gpp3-wxs.ign.fr/static/pictures/ign_carte2.jpg" xlink:type="simple"/>'+
     '</gpp:QuickLook>'+
     '<wmts:TileMatrixSetLink>'+
      '<wmts:TileMatrixSet>PM</wmts:TileMatrixSet>'+
      '<wmts:TileMatrixSetLimits>'+
       '<wmts:TileMatrixLimits>'+
        '<wmts:TileMatrix>12</wmts:TileMatrix>'+
        '<wmts:MinTileRow>85</wmts:MinTileRow>'+
        '<wmts:MaxTileRow>194</wmts:MaxTileRow>'+
        '<wmts:MinTileCol>1</wmts:MinTileCol>'+
        '<wmts:MaxTileCol>247</wmts:MaxTileCol>'+
       '</wmts:TileMatrixLimits>'+
       '<wmts:TileMatrixLimits>'+
        '<wmts:TileMatrix>13</wmts:TileMatrix>'+
        '<wmts:MinTileRow>170</wmts:MinTileRow>'+
        '<wmts:MaxTileRow>330</wmts:MaxTileRow>'+
        '<wmts:MinTileCol>2</wmts:MinTileCol>'+
        '<wmts:MaxTileCol>495</wmts:MaxTileCol>'+
       '</wmts:TileMatrixLimits>'+
       '<wmts:TileMatrixLimits>'+
        '<wmts:TileMatrix>14</wmts:TileMatrix>'+
        '<wmts:MinTileRow>342</wmts:MinTileRow>'+
        '<wmts:MaxTileRow>631</wmts:MaxTileRow>'+
        '<wmts:MinTileCol>5</wmts:MinTileCol>'+
        '<wmts:MaxTileCol>990</wmts:MaxTileCol>'+
       '</wmts:TileMatrixLimits>'+
       '<wmts:TileMatrixLimits>'+
        '<wmts:TileMatrix>15</wmts:TileMatrix>'+
        '<wmts:MinTileRow>684</wmts:MinTileRow>'+
        '<wmts:MaxTileRow>1263</wmts:MaxTileRow>'+
        '<wmts:MinTileCol>10</wmts:MinTileCol>'+
        '<wmts:MaxTileCol>1981</wmts:MaxTileCol>'+
       '</wmts:TileMatrixLimits>'+
       '<wmts:TileMatrixLimits>'+
        '<wmts:TileMatrix>16</wmts:TileMatrix>'+
        '<wmts:MinTileRow>1368</wmts:MinTileRow>'+
        '<wmts:MaxTileRow>2526</wmts:MaxTileRow>'+
        '<wmts:MinTileCol>20</wmts:MinTileCol>'+
        '<wmts:MaxTileCol>2930</wmts:MaxTileCol>'+
       '</wmts:TileMatrixLimits>'+
       '<wmts:TileMatrixLimits>'+
        '<wmts:TileMatrix>17</wmts:TileMatrix>'+
        '<wmts:MinTileRow>2738</wmts:MinTileRow>'+
        '<wmts:MaxTileRow>4594</wmts:MaxTileRow>'+
        '<wmts:MinTileCol>2658</wmts:MinTileCol>'+
        '<wmts:MaxTileCol>5367</wmts:MaxTileCol>'+
       '</wmts:TileMatrixLimits>'+
       '<wmts:TileMatrixLimits>'+
        '<wmts:TileMatrix>18</wmts:TileMatrix>'+
        '<wmts:MinTileRow>5477</wmts:MinTileRow>'+
        '<wmts:MaxTileRow>9189</wmts:MaxTileRow>'+
        '<wmts:MinTileCol>5317</wmts:MinTileCol>'+
        '<wmts:MaxTileCol>10734</wmts:MaxTileCol>'+
       '</wmts:TileMatrixLimits>'+
      '</wmts:TileMatrixSetLimits>'+
     '</wmts:TileMatrixSetLink>'+
     '<gpp:MetadataURL format="xml">'+
      '<OnlineResource xlink:href="http://gpp3-wxs.ign.fr/geoportail/csw?service=CSW&amp;version=2.0.2&amp;request=GetRecordById&amp;Id=IGNF_SCAN100r_2-0.xml" xlink:type="simple"/>'+
     '</gpp:MetadataURL>'+
     '<gpp:MetadataURL format="xml">'+
      '<OnlineResource xlink:href="http://gpp3-wxs.ign.fr/geoportail/csw?service=CSW&amp;version=2.0.2&amp;request=GetRecordById&amp;Id=IGNF_SCANREGr_2-0.xml" xlink:type="simple"/>'+
     '</gpp:MetadataURL>'+
     '<gpp:MetadataURL format="xml">'+
      '<OnlineResource xlink:href="http://gpp3-wxs.ign.fr/geoportail/csw?service=CSW&amp;version=2.0.2&amp;request=GetRecordById&amp;Id=IGNF_SCAN25r_2-0.xml" xlink:type="simple"/>'+
     '</gpp:MetadataURL>'+
     '<gpp:MetadataURL format="xml">'+
      '<OnlineResource xlink:href="http://gpp3-wxs.ign.fr/geoportail/csw?service=CSW&amp;version=2.0.2&amp;request=GetRecordById&amp;Id=IGNF_SCAN500r_1-0.xml" xlink:type="simple"/>'+
     '</gpp:MetadataURL>'+
     '<gpp:MetadataURL format="xml">'+
      '<OnlineResource xlink:href="http://gpp3-wxs.ign.fr/geoportail/csw?service=CSW&amp;version=2.0.2&amp;request=GetRecordById&amp;Id=IGNF_SCAN200r_1-0.xml" xlink:type="simple"/>'+
     '</gpp:MetadataURL>'+
     '<gpp:MetadataURL format="xml">'+
      '<OnlineResource xlink:href="http://gpp3-wxs.ign.fr/geoportail/csw?service=CSW&amp;version=2.0.2&amp;request=GetRecordById&amp;Id=IGNF_SCAN50r_2-0.xml" xlink:type="simple"/>'+
     '</gpp:MetadataURL>'+
     '<gpp:MetadataURL format="xml">'+
      '<OnlineResource xlink:href="http://gpp3-wxs.ign.fr/geoportail/csw?service=CSW&amp;version=2.0.2&amp;request=GetRecordById&amp;Id=IGNF_SCAN1000r_2-0.xml" xlink:type="simple"/>'+
     '</gpp:MetadataURL>'+
     '<gpp:MetadataURL format="xml">'+
      '<OnlineResource xlink:href="http://gpp3-wxs.ign.fr/geoportail/csw?service=CSW&amp;version=2.0.2&amp;request=GetRecordById&amp;Id=IGNF_BDTOPOr_2-0.xml" xlink:type="simple"/>'+
     '</gpp:MetadataURL>'+
     '<gpp:Keys>'+
      '<gpp:Key id="nhf8wztv3m9wglcda6n6cbuf">http://gpp3-wxs.ign.fr/nhf8wztv3m9wglcda6n6cbuf/wmts</gpp:Key>'+
     '</gpp:Keys>'+
    '</gpp:Layer>'+
   '</Extension>'+
  '</Layer>'+
  '<Layer hidden="0" queryable="0">'+
   '<Server service="OGC:WMTS" title="Photographies aériennes" version="1.0.0">'+
    '<OnlineResource xlink:href="http://gpp3-wxs.ign.fr/wmts" xlink:type="simple"/>'+
   '</Server>'+
   '<Name>ORTHOIMAGERY.ORTHOPHOTOS</Name>'+
   '<Title>Photographies aériennes</Title>'+
   '<Abstract><![CDATA[Photographies aériennes]]></Abstract>'+
   '<sld:MinScaleDenominator>1067</sld:MinScaleDenominator>'+
   '<sld:MaxScaleDenominator>559082265</sld:MaxScaleDenominator>'+
   '<FormatList>'+
    '<Format current="1">image/jpeg</Format>'+
   '</FormatList>'+
   '<StyleList>'+
    '<Style current="1">'+
     '<Name>normal</Name>'+
     '<Title>Données Brutes</Title>'+
    '</Style>'+
   '</StyleList>'+
   '<DimensionList>'+
    '<Dimension name="Type" unitSymbol="" units="" userValue="">2D</Dimension>'+
    '<Dimension name="VisibilityRange" unitSymbol="" units="" userValue="">0.2985821417389697,117407.27544603075,156543.033928041</Dimension>'+
    '<Dimension name="VisibilityMode" unitSymbol="" units="" userValue="">resolution</Dimension>'+
    '<Dimension name="NoDataValue" unitSymbol="" units="" userValue="">FFFFFF</Dimension>'+
   '</DimensionList>'+
   '<Extension>'+
    '<gpp:Layer id="ORTHOIMAGERY.ORTHOPHOTOS$GEOPORTAIL:OGC:WMTS" order="9990000">'+
     '<gpp:Thematics>'+
      '<gpp:Thematic>Photographies</gpp:Thematic>'+
     '</gpp:Thematics>'+
     '<gpp:InspireThematics>'+
      '<gpp:InspireThematic>Ortho-imagerie</gpp:InspireThematic>'+
     '</gpp:InspireThematics>'+
     '<gpp:BoundingBox maxT="2012-03-06" minT="1970-01-01">-178.0,-80.0,178.0,84.0</gpp:BoundingBox>'+
     '<gpp:AdditionalCRS>EPSG:3857</gpp:AdditionalCRS>'+
     '<gpp:Originators>'+
      '<gpp:Originator name="IGN">'+
       '<gpp:Attribution>Institut national de l\'information géographique et forestière</gpp:Attribution>'+
       '<gpp:Logo>http://gpp3-wxs.ign.fr/static/logos/IGN/IGN.gif</gpp:Logo>'+
       '<gpp:URL>http://www.ign.fr</gpp:URL>'+
       '<gpp:Constraints>'+
        '<gpp:Constraint>'+
         '<gpp:CRS>EPSG:4326</gpp:CRS>'+
         '<gpp:BoundingBox maxT="2012-03-06" minT="1970-01-01">-63.160706,14.371838,7.7436337,49.580162</gpp:BoundingBox>'+
         '<sld:MinScaleDenominator>1067</sld:MinScaleDenominator>'+
         '<sld:MaxScaleDenominator>1067</sld:MaxScaleDenominator>'+
        '</gpp:Constraint>'+
        '<gpp:Constraint>'+
         '<gpp:CRS>EPSG:4326</gpp:CRS>'+
         '<gpp:BoundingBox maxT="2012-03-06" minT="1970-01-01">-63.160706,-21.401262,55.84643,60.641647</gpp:BoundingBox>'+
         '<sld:MinScaleDenominator>2133</sld:MinScaleDenominator>'+
         '<sld:MaxScaleDenominator>68248</sld:MaxScaleDenominator>'+
        '</gpp:Constraint>'+
       '</gpp:Constraints>'+
      '</gpp:Originator>'+
      '<gpp:Originator name="PLANETOBSERVER">'+
       '<gpp:Attribution>PlanetObserver (images satellites)</gpp:Attribution>'+
       '<gpp:Logo>http://gpp3-wxs.ign.fr/static/logos/PLANETOBSERVER/PLANETOBSERVER.gif</gpp:Logo>'+
       '<gpp:URL>http://www.planetobserver.com/</gpp:URL>'+
       '<gpp:Constraints>'+
        '<gpp:Constraint>'+
         '<gpp:CRS>EPSG:4326</gpp:CRS>'+
         '<gpp:BoundingBox maxT="2012-03-06" minT="1970-01-01">-178.0,-80.0,0.0,80.0</gpp:BoundingBox>'+
         '<sld:MinScaleDenominator>136495</sld:MinScaleDenominator>'+
         '<sld:MaxScaleDenominator>559082265</sld:MaxScaleDenominator>'+
        '</gpp:Constraint>'+
       '</gpp:Constraints>'+
      '</gpp:Originator>'+
     '</gpp:Originators>'+
     '<gpp:Legends>'+
      '<gpp:Legend>'+
       '<sld:MinScaleDenominator>1067</sld:MinScaleDenominator>'+
       '<gpp:LegendURL format="format">'+
        '<OnlineResource xlink:href="http://gpp3-wxs.ign.fr/static/legends/ign_bdortho_legende.jpg" xlink:type="simple"/>'+
       '</gpp:LegendURL>'+
      '</gpp:Legend>'+
      '<gpp:Legend>'+
       '<sld:MinScaleDenominator>2133</sld:MinScaleDenominator>'+
       '<gpp:LegendURL format="format">'+
        '<OnlineResource xlink:href="http://gpp3-wxs.ign.fr/static/legends/ign_bdortho_legende.jpg" xlink:type="simple"/>'+
       '</gpp:LegendURL>'+
      '</gpp:Legend>'+
      '<gpp:Legend>'+
       '<sld:MinScaleDenominator>136495</sld:MinScaleDenominator>'+
       '<gpp:LegendURL format="format">'+
        '<OnlineResource xlink:href="http://gpp3-wxs.ign.fr/static/legends/NOLEGEND.JPG" xlink:type="simple"/>'+
       '</gpp:LegendURL>'+
      '</gpp:Legend>'+
     '</gpp:Legends>'+
     '<gpp:QuickLook>'+
      '<OnlineResource xlink:href="http://gpp3-wxs.ign.fr/static/pictures/ign_ortho.jpg" xlink:type="simple"/>'+
     '</gpp:QuickLook>'+
     '<wmts:TileMatrixSetLink>'+
      '<wmts:TileMatrixSet>PM</wmts:TileMatrixSet>'+
      '<wmts:TileMatrixSetLimits>'+
       '<wmts:TileMatrixLimits>'+
        '<wmts:TileMatrix>10</wmts:TileMatrix>'+
        '<wmts:MinTileRow>31</wmts:MinTileRow>'+
        '<wmts:MaxTileRow>909</wmts:MaxTileRow>'+
        '<wmts:MinTileCol>5</wmts:MinTileCol>'+
        '<wmts:MaxTileCol>1018</wmts:MaxTileCol>'+
       '</wmts:TileMatrixLimits>'+
       '<wmts:TileMatrixLimits>'+
        '<wmts:TileMatrix>11</wmts:TileMatrix>'+
        '<wmts:MinTileRow>62</wmts:MinTileRow>'+
        '<wmts:MaxTileRow>1818</wmts:MaxTileRow>'+
        '<wmts:MinTileCol>11</wmts:MinTileCol>'+
        '<wmts:MaxTileCol>2036</wmts:MaxTileCol>'+
       '</wmts:TileMatrixLimits>'+
       '<wmts:TileMatrixLimits>'+
        '<wmts:TileMatrix>12</wmts:TileMatrix>'+
        '<wmts:MinTileRow>125</wmts:MinTileRow>'+
        '<wmts:MaxTileRow>3636</wmts:MaxTileRow>'+
        '<wmts:MinTileCol>22</wmts:MinTileCol>'+
        '<wmts:MaxTileCol>4073</wmts:MaxTileCol>'+
       '</wmts:TileMatrixLimits>'+
       '<wmts:TileMatrixLimits>'+
        '<wmts:TileMatrix>13</wmts:TileMatrix>'+
        '<wmts:MinTileRow>2739</wmts:MinTileRow>'+
        '<wmts:MaxTileRow>4594</wmts:MaxTileRow>'+
        '<wmts:MinTileCol>41</wmts:MinTileCol>'+
        '<wmts:MaxTileCol>5366</wmts:MaxTileCol>'+
       '</wmts:TileMatrixLimits>'+
       '<wmts:TileMatrixLimits>'+
        '<wmts:TileMatrix>14</wmts:TileMatrix>'+
        '<wmts:MinTileRow>5478</wmts:MinTileRow>'+
        '<wmts:MaxTileRow>9189</wmts:MaxTileRow>'+
        '<wmts:MinTileCol>82</wmts:MinTileCol>'+
        '<wmts:MaxTileCol>10733</wmts:MaxTileCol>'+
       '</wmts:TileMatrixLimits>'+
       '<wmts:TileMatrixLimits>'+
        '<wmts:TileMatrix>15</wmts:TileMatrix>'+
        '<wmts:MinTileRow>10956</wmts:MinTileRow>'+
        '<wmts:MaxTileRow>18378</wmts:MaxTileRow>'+
        '<wmts:MinTileCol>165</wmts:MinTileCol>'+
        '<wmts:MaxTileCol>21467</wmts:MaxTileCol>'+
       '</wmts:TileMatrixLimits>'+
       '<wmts:TileMatrixLimits>'+
        '<wmts:TileMatrix>16</wmts:TileMatrix>'+
        '<wmts:MinTileRow>21912</wmts:MinTileRow>'+
        '<wmts:MaxTileRow>36757</wmts:MaxTileRow>'+
        '<wmts:MinTileCol>330</wmts:MinTileCol>'+
        '<wmts:MaxTileCol>42934</wmts:MaxTileCol>'+
       '</wmts:TileMatrixLimits>'+
       '<wmts:TileMatrixLimits>'+
        '<wmts:TileMatrix>17</wmts:TileMatrix>'+
        '<wmts:MinTileRow>43825</wmts:MinTileRow>'+
        '<wmts:MaxTileRow>73515</wmts:MaxTileRow>'+
        '<wmts:MinTileCol>660</wmts:MinTileCol>'+
        '<wmts:MaxTileCol>85868</wmts:MaxTileCol>'+
       '</wmts:TileMatrixLimits>'+
       '<wmts:TileMatrixLimits>'+
        '<wmts:TileMatrix>18</wmts:TileMatrix>'+
        '<wmts:MinTileRow>87651</wmts:MinTileRow>'+
        '<wmts:MaxTileRow>147030</wmts:MaxTileRow>'+
        '<wmts:MinTileCol>1320</wmts:MinTileCol>'+
        '<wmts:MaxTileCol>171736</wmts:MaxTileCol>'+
       '</wmts:TileMatrixLimits>'+
       '<wmts:TileMatrixLimits>'+
        '<wmts:TileMatrix>19</wmts:TileMatrix>'+
        '<wmts:MinTileRow>178772</wmts:MinTileRow>'+
        '<wmts:MaxTileRow>240989</wmts:MaxTileRow>'+
        '<wmts:MinTileCol>170159</wmts:MinTileCol>'+
        '<wmts:MaxTileCol>273392</wmts:MaxTileCol>'+
       '</wmts:TileMatrixLimits>'+
       '<wmts:TileMatrixLimits>'+
        '<wmts:TileMatrix>8</wmts:TileMatrix>'+
        '<wmts:MinTileRow>7</wmts:MinTileRow>'+
        '<wmts:MaxTileRow>227</wmts:MaxTileRow>'+
        '<wmts:MinTileCol>1</wmts:MinTileCol>'+
        '<wmts:MaxTileCol>254</wmts:MaxTileCol>'+
       '</wmts:TileMatrixLimits>'+
       '<wmts:TileMatrixLimits>'+
        '<wmts:TileMatrix>9</wmts:TileMatrix>'+
        '<wmts:MinTileRow>15</wmts:MinTileRow>'+
        '<wmts:MaxTileRow>454</wmts:MaxTileRow>'+
        '<wmts:MinTileCol>2</wmts:MinTileCol>'+
        '<wmts:MaxTileCol>509</wmts:MaxTileCol>'+
       '</wmts:TileMatrixLimits>'+
      '</wmts:TileMatrixSetLimits>'+
     '</wmts:TileMatrixSetLink>'+
     '<gpp:MetadataURL format="xml">'+
      '<OnlineResource xlink:href="http://gpp3-wxs.ign.fr/geoportail/csw?service=CSW&amp;version=2.0.2&amp;request=GetRecordById&amp;Id=IGNF_BDORTHOr_2-0.xml" xlink:type="simple"/>'+
     '</gpp:MetadataURL>'+
     '<gpp:MetadataURL format="xml">'+
      '<OnlineResource xlink:href="http://gpp3-wxs.ign.fr/geoportail/csw?service=CSW&amp;version=2.0.2&amp;request=GetRecordById&amp;Id=IGNF_BDORTHOr_2-0.xml" xlink:type="simple"/>'+
     '</gpp:MetadataURL>'+
     '<gpp:Keys>'+
      '<gpp:Key id="nhf8wztv3m9wglcda6n6cbuf">http://gpp3-wxs.ign.fr/nhf8wztv3m9wglcda6n6cbuf/wmts</gpp:Key>'+
     '</gpp:Keys>'+
    '</gpp:Layer>'+
   '</Extension>'+
  '</Layer>'+
  '<Layer hidden="0" queryable="0">'+
   '<Server service="OGC:WMTS" title="Parcelles cadastrales" version="1.0.0">'+
    '<OnlineResource xlink:href="http://gpp3-wxs.ign.fr/wmts" xlink:type="simple"/>'+
   '</Server>'+
   '<Name>CADASTRALPARCELS.PARCELS</Name>'+
   '<Title>Parcelles cadastrales</Title>'+
   '<Abstract><![CDATA[Limites des parcelles cadastrales issues de plans scannés et de plans numériques.]]></Abstract>'+
   '<sld:MinScaleDenominator>534</sld:MinScaleDenominator>'+
   '<sld:MaxScaleDenominator>8735661</sld:MaxScaleDenominator>'+
   '<FormatList>'+
    '<Format current="1">image/png</Format>'+
   '</FormatList>'+
   '<StyleList>'+
    '<Style current="1">'+
     '<Name>bdparcellaire</Name>'+
     '<Title>BD Parcellaire Noire et transparente</Title>'+
    '</Style>'+
    '<Style current="0">'+
     '<Name>normal</Name>'+
     '<Title>Données Brutes</Title>'+
    '</Style>'+
    '<Style current="0">'+
     '<Name>bdparcellaire_o</Name>'+
     '<Title>BD Parcellaire orange transparente</Title>'+
    '</Style>'+
   '</StyleList>'+
   '<DimensionList>'+
    '<Dimension name="Type" unitSymbol="" units="" userValue="">2D</Dimension><Dimension name="VisibilityRange" unitSymbol="" units="" userValue="">0.0,800000.0,0.0</Dimension>'+
    '<Dimension name="VisibilityMode" unitSymbol="" units="" userValue="">distance</Dimension>'+
    '<Dimension name="NoDataValue" unitSymbol="" units="" userValue="">FF</Dimension>'+
   '</DimensionList>'+
   '<Extension>'+
    '<gpp:Layer id="CADASTRALPARCELS.PARCELS$GEOPORTAIL:OGC:WMTS" order="9790000">'+
     '<gpp:Thematics>'+
      '<gpp:Thematic>Parcelles cadastrales</gpp:Thematic>'+
     '</gpp:Thematics>'+
     '<gpp:InspireThematics>'+
      '<gpp:InspireThematic>Parcelles cadastrales</gpp:InspireThematic>'+
     '</gpp:InspireThematics>'+
     '<gpp:BoundingBox maxT="2012-05-30" minT="2007-04-06">-63.160706,-21.39223,55.84643,51.090965</gpp:BoundingBox>'+
     '<gpp:Originators>'+
      '<gpp:Originator name="IGN">'+
       '<gpp:Attribution>Institut national de l\'information géographique et forestière</gpp:Attribution>'+
       '<gpp:Logo>http://gpp3-wxs.ign.fr/static/logos/IGN/IGN.gif</gpp:Logo>'+
       '<gpp:URL>http://www.ign.fr</gpp:URL>'+
       '<gpp:Constraints>'+
        '<gpp:Constraint>'+
         '<gpp:CRS>EPSG:4326</gpp:CRS>'+
         '<gpp:BoundingBox maxT="2012-05-30" minT="2007-04-06">-63.160706,14.3810625,9.663144,51.090965</gpp:BoundingBox>'+
         '<sld:MinScaleDenominator>534</sld:MinScaleDenominator>'+
         '<sld:MaxScaleDenominator>8735661</sld:MaxScaleDenominator>'+
        '</gpp:Constraint>'+
       '</gpp:Constraints>'+
      '</gpp:Originator>'+
     '</gpp:Originators>'+
     '<gpp:Legends>'+
      '<gpp:Legend>'+
       '<sld:MinScaleDenominator>534</sld:MinScaleDenominator>'+
       '<gpp:LegendURL format="format">'+
        '<OnlineResource xlink:href="http://gpp3-wxs.ign.fr/static/legends/NOLEGEND.JPG" xlink:type="simple"/>'+
       '</gpp:LegendURL>'+
      '</gpp:Legend>'+
     '</gpp:Legends>'+
     '<gpp:QuickLook>'+
      '<OnlineResource xlink:href="http://gpp3-wxs.ign.fr/static/pictures/BDPARCELLAIRE.png" xlink:type="simple"/>'+
     '</gpp:QuickLook>'+
     '<wmts:TileMatrixSetLink>'+
      '<wmts:TileMatrixSet>PM</wmts:TileMatrixSet>'+
      '<wmts:TileMatrixSetLimits>'+
       '<wmts:TileMatrixLimits>'+
        '<wmts:TileMatrix>10</wmts:TileMatrix>'+
        '<wmts:MinTileRow>342</wmts:MinTileRow>'+
        '<wmts:MaxTileRow>574</wmts:MaxTileRow>'+
        '<wmts:MinTileCol>332</wmts:MinTileCol>'+
        '<wmts:MaxTileCol>670</wmts:MaxTileCol>'+
       '</wmts:TileMatrixLimits>'+
       '<wmts:TileMatrixLimits>'+
        '<wmts:TileMatrix>11</wmts:TileMatrix>'+
        '<wmts:MinTileRow>684</wmts:MinTileRow>'+
        '<wmts:MaxTileRow>1148</wmts:MaxTileRow>'+
        '<wmts:MinTileCol>664</wmts:MinTileCol>'+
        '<wmts:MaxTileCol>1341</wmts:MaxTileCol>'+
       '</wmts:TileMatrixLimits>'+
       '<wmts:TileMatrixLimits>'+
        '<wmts:TileMatrix>12</wmts:TileMatrix>'+
        '<wmts:MinTileRow>1369</wmts:MinTileRow>'+
        '<wmts:MaxTileRow>2297</wmts:MaxTileRow>'+
        '<wmts:MinTileCol>1329</wmts:MinTileCol>'+
        '<wmts:MaxTileCol>2683</wmts:MaxTileCol>'+
       '</wmts:TileMatrixLimits>'+
       '<wmts:TileMatrixLimits>'+
        '<wmts:TileMatrix>13</wmts:TileMatrix>'+
        '<wmts:MinTileRow>2739</wmts:MinTileRow>'+
        '<wmts:MaxTileRow>4594</wmts:MaxTileRow>'+
        '<wmts:MinTileCol>2658</wmts:MinTileCol>'+
        '<wmts:MaxTileCol>5366</wmts:MaxTileCol>'+
       '</wmts:TileMatrixLimits>'+
       '<wmts:TileMatrixLimits>'+
        '<wmts:TileMatrix>14</wmts:TileMatrix>'+
        '<wmts:MinTileRow>5478</wmts:MinTileRow>'+
        '<wmts:MaxTileRow>9188</wmts:MaxTileRow>'+
        '<wmts:MinTileCol>5317</wmts:MinTileCol>'+
        '<wmts:MaxTileCol>10733</wmts:MaxTileCol>'+
       '</wmts:TileMatrixLimits>'+
       '<wmts:TileMatrixLimits>'+
        '<wmts:TileMatrix>15</wmts:TileMatrix>'+
        '<wmts:MinTileRow>10956</wmts:MinTileRow>'+
        '<wmts:MaxTileRow>18377</wmts:MaxTileRow>'+
        '<wmts:MinTileCol>10634</wmts:MinTileCol>'+
        '<wmts:MaxTileCol>21467</wmts:MaxTileCol>'+
       '</wmts:TileMatrixLimits>'+
       '<wmts:TileMatrixLimits>'+
        '<wmts:TileMatrix>16</wmts:TileMatrix>'+
        '<wmts:MinTileRow>21912</wmts:MinTileRow>'+
        '<wmts:MaxTileRow>36755</wmts:MaxTileRow>'+
        '<wmts:MinTileCol>21269</wmts:MinTileCol>'+
        '<wmts:MaxTileCol>42934</wmts:MaxTileCol>'+
       '</wmts:TileMatrixLimits>'+
       '<wmts:TileMatrixLimits>'+
        '<wmts:TileMatrix>17</wmts:TileMatrix>'+
        '<wmts:MinTileRow>43825</wmts:MinTileRow>'+
        '<wmts:MaxTileRow>73511</wmts:MaxTileRow>'+
        '<wmts:MinTileCol>42539</wmts:MinTileCol>'+
        '<wmts:MaxTileCol>85868</wmts:MaxTileCol>'+
       '</wmts:TileMatrixLimits>'+
       '<wmts:TileMatrixLimits>'+
        '<wmts:TileMatrix>18</wmts:TileMatrix>'+
        '<wmts:MinTileRow>87651</wmts:MinTileRow>'+
        '<wmts:MaxTileRow>147023</wmts:MaxTileRow>'+
        '<wmts:MinTileCol>85079</wmts:MinTileCol>'+
        '<wmts:MaxTileCol>171736</wmts:MaxTileCol>'+
       '</wmts:TileMatrixLimits>'+
       '<wmts:TileMatrixLimits>'+
        '<wmts:TileMatrix>19</wmts:TileMatrix>'+
        '<wmts:MinTileRow>175302</wmts:MinTileRow>'+
        '<wmts:MaxTileRow>294046</wmts:MaxTileRow>'+
        '<wmts:MinTileCol>170159</wmts:MinTileCol>'+
        '<wmts:MaxTileCol>343473</wmts:MaxTileCol>'+
       '</wmts:TileMatrixLimits>'+
       '<wmts:TileMatrixLimits>'+
        '<wmts:TileMatrix>20</wmts:TileMatrix>'+
        '<wmts:MinTileRow>350605</wmts:MinTileRow>'+
        '<wmts:MaxTileRow>588093</wmts:MaxTileRow>'+
        '<wmts:MinTileCol>340318</wmts:MinTileCol>'+
        '<wmts:MaxTileCol>686946</wmts:MaxTileCol>'+
       '</wmts:TileMatrixLimits>'+
       '<wmts:TileMatrixLimits>'+
        '<wmts:TileMatrix>6</wmts:TileMatrix>'+
        '<wmts:MinTileRow>21</wmts:MinTileRow>'+
        '<wmts:MaxTileRow>35</wmts:MaxTileRow>'+
        '<wmts:MinTileCol>20</wmts:MinTileCol>'+
        '<wmts:MaxTileCol>41</wmts:MaxTileCol>'+
       '</wmts:TileMatrixLimits>'+
       '<wmts:TileMatrixLimits>'+
        '<wmts:TileMatrix>7</wmts:TileMatrix>'+
        '<wmts:MinTileRow>42</wmts:MinTileRow>'+
        '<wmts:MaxTileRow>71</wmts:MaxTileRow>'+
        '<wmts:MinTileCol>41</wmts:MinTileCol>'+
        '<wmts:MaxTileCol>83</wmts:MaxTileCol>'+
       '</wmts:TileMatrixLimits>'+
       '<wmts:TileMatrixLimits>'+
        '<wmts:TileMatrix>8</wmts:TileMatrix>'+
        '<wmts:MinTileRow>85</wmts:MinTileRow>'+
        '<wmts:MaxTileRow>143</wmts:MaxTileRow>'+
        '<wmts:MinTileCol>83</wmts:MinTileCol>'+
        '<wmts:MaxTileCol>167</wmts:MaxTileCol>'+
       '</wmts:TileMatrixLimits>'+
       '<wmts:TileMatrixLimits>'+
        '<wmts:TileMatrix>9</wmts:TileMatrix>'+
        '<wmts:MinTileRow>171</wmts:MinTileRow>'+
        '<wmts:MaxTileRow>287</wmts:MaxTileRow>'+
        '<wmts:MinTileCol>166</wmts:MinTileCol>'+
        '<wmts:MaxTileCol>335</wmts:MaxTileCol>'+
       '</wmts:TileMatrixLimits>'+
      '</wmts:TileMatrixSetLimits>'+
     '</wmts:TileMatrixSetLink>'+
     '<gpp:MetadataURL format="xml">'+
      '<OnlineResource xlink:href="http://gpp3-wxs.ign.fr/geoportail/csw?service=CSW&amp;version=2.0.2&amp;request=GetRecordById&amp;Id=IGNF_BDPARCELLAIREr_1-2_image.xml" xlink:type="simple"/>'+
     '</gpp:MetadataURL>'+
     '<gpp:Keys>'+
      '<gpp:Key id="nhf8wztv3m9wglcda6n6cbuf">http://gpp3-wxs.ign.fr/nhf8wztv3m9wglcda6n6cbuf/wmts</gpp:Key>'+
     '</gpp:Keys>'+
    '</gpp:Layer>'+
   '</Extension>'+
  '</Layer>'+
  '<Layer hidden="0" queryable="0">'+
   '<Server service="OGC:OPENLS;Geocode" title="Géocodage par lieux" version="1.2">'+
    '<OnlineResource xlink:href="http://gpp3-wxs.ign.fr/geoportail/ols" xlink:type="simple"/>'+
   '</Server>'+
   '<Name>PositionOfInterest</Name>'+
   '<Title>Dénominations géographiques</Title>'+
   '<Abstract>Noms de zones, de régions, de localités, de grandes villes, de banlieues, de villes moyennes ou d\'implantations, ou tout autre élément géographique ou topographique d\'intérêt public ou historique.</Abstract>'+
   '<Extension>'+
    '<gpp:Layer id="PositionOfInterest$GEOPORTAIL:OGC:OPENLS" visibleInCatalog="0">'+
     '<gpp:Thematics>'+
      '<gpp:Thematic>Toponymes</gpp:Thematic>'+
     '</gpp:Thematics>'+
     '<gpp:InspireThematics>'+
      '<gpp:InspireThematic>Dénominations géographiques</gpp:InspireThematic>'+
     '</gpp:InspireThematics>'+
     '<gpp:Keys>'+
      '<gpp:Key id="nhf8wztv3m9wglcda6n6cbuf">http://gpp3-wxs.ign.fr/nhf8wztv3m9wglcda6n6cbuf/geoportail/ols</gpp:Key>'+
     '</gpp:Keys>'+
    '</gpp:Layer>'+
   '</Extension>'+
  '</Layer>'+
  '<Layer hidden="0" queryable="0">'+
   '<Server service="OGC:OPENLS;AutoCompletion" title="Autocomplétion par lieux" version="1.2">'+
    '<OnlineResource xlink:href="http://gpp3-wxs.ign.fr/ols/apis/completion" xlink:type="simple"/>'+
   '</Server>'+
   '<Name>PositionOfInterest</Name>'+
   '<Title>Dénominations géographiques</Title>'+
   '<Abstract>Noms de zones, de régions, de localités, de grandes villes, de banlieues, de villes moyennes ou d\'implantations, ou tout autre élément géographique ou topographique d\'intérêt public ou historique.</Abstract>'+
   '<Extension>'+
    '<gpp:Layer id="PositionOfInterest$GEOPORTAIL:OGC:OPENLS" visibleInCatalog="0">'+
     '<gpp:Thematics>'+
      '<gpp:Thematic>Toponymes</gpp:Thematic>'+
     '</gpp:Thematics>'+
     '<gpp:InspireThematics>'+
      '<gpp:InspireThematic>Dénominations géographiques</gpp:InspireThematic>'+
     '</gpp:InspireThematics>'+
     '<gpp:BoundingBox>-180,-90,180,90</gpp:BoundingBox>'+
     '<gpp:Keys>'+
      '<gpp:Key id="nhf8wztv3m9wglcda6n6cbuf">http://gpp3-wxs.ign.fr/nhf8wztv3m9wglcda6n6cbuf/ols/apis/completion</gpp:Key>'+
     '</gpp:Keys>'+
    '</gpp:Layer>'+
   '</Extension>'+
  '</Layer>'+
  '<Layer hidden="0" queryable="0">'+
   '<Server service="OGC:OPENLS;Geocode" title="Géocodage par adresses" version="1.2">'+
    '<OnlineResource xlink:href="http://gpp3-wxs.ign.fr/geoportail/ols" xlink:type="simple"/>'+
   '</Server>'+
   '<Name>StreetAddress</Name>'+
   '<Title>Adresses</Title>'+
   '<Abstract>Localisation des propriétés fondée sur les identifiants des adresses, habituellement le nom de la rue, le numéro de la maison et le code postal.</Abstract>'+
   '<Extension>'+
    '<gpp:Layer id="StreetAddress$GEOPORTAIL:OGC:OPENLS" visibleInCatalog="0">'+
     '<gpp:Thematics>'+
      '<gpp:Thematic>Adresses</gpp:Thematic>'+
     '</gpp:Thematics>'+
     '<gpp:InspireThematics>'+
      '<gpp:InspireThematic>Adresses</gpp:InspireThematic>'+
     '</gpp:InspireThematics>'+
     '<gpp:BoundingBox>-180,-90,180,90</gpp:BoundingBox>'+
     '<gpp:Keys>'+
      '<gpp:Key id="nhf8wztv3m9wglcda6n6cbuf">http://gpp3-wxs.ign.fr/nhf8wztv3m9wglcda6n6cbuf/geoportail/ols</gpp:Key>'+
     '</gpp:Keys>'+
    '</gpp:Layer>'+
   '</Extension>'+
  '</Layer>'+
  '<Layer hidden="0" queryable="0">'+
   '<Server service="OGC:OPENLS;AutoCompletion" title="Autocomplétion par adresses" version="1.2">'+
    '<OnlineResource xlink:href="http://gpp3-wxs.ign.fr/ols/apis/completion" xlink:type="simple"/>'+
   '</Server>'+
   '<Name>StreetAddress</Name>'+
   '<Title>Adresses</Title>'+
   '<Abstract>Localisation des propriétés fondée sur les identifiants des adresses, habituellement le nom de la rue, le numéro de la maison et le code postal.</Abstract>'+
   '<Extension>'+
    '<gpp:Layer id="StreetAddress$GEOPORTAIL:OGC:OPENLS" visibleInCatalog="0">'+
     '<gpp:Thematics>'+
      '<gpp:Thematic>Adresses</gpp:Thematic>'+
     '</gpp:Thematics>'+
     '<gpp:InspireThematics>'+
      '<gpp:InspireThematic>Adresses</gpp:InspireThematic>'+
     '</gpp:InspireThematics>'+
     '<gpp:BoundingBox>-180,-90,180,90</gpp:BoundingBox>'+
     '<gpp:Keys>'+
      '<gpp:Key id="nhf8wztv3m9wglcda6n6cbuf">http://gpp3-wxs.ign.fr/nhf8wztv3m9wglcda6n6cbuf/ols/apis/completion</gpp:Key>'+
     '</gpp:Keys>'+
    '</gpp:Layer>'+
   '</Extension>'+
  '</Layer>'+
 '</LayerList>'+
'</ViewContext>'
                    }
                })
        },
        onContractsComplete: initMap
    });
}

// assign callback when "onload" event is fired
// assignation de la fonction à appeler lors de la levée de l'évènement
// "onload"
window.onload= loadAPI;
