/**
 * Property: viewer
 * {<Geoportal.Viewer>} The Geoportal API viewer
 */
viewer= null;

/**
 * Property: debug
 * {Boolean} is trace activated
 */
debug= true;

/**
 * Property: gProxyUrl
 * {String} Proxy to invoke for loading external resources (KML, etc ...).
 */
gProxyUrl= '/geoportail/api/xmlproxy'+'?url=';//'../proxy/php/proxy.php?url=';

/**
 * Function: when page is ready
 */
var loadPage= function() {

    var userLyrs= [],
        userOvls= [],
        userLyrsOpts= {},
        userOvlsOpts= {},
        userComponents= {},
        kGen= 'nhf8wztv3m9wglcda6n6cbuf',// API key for generator
        kGenR= null,
        kGenR0= null,
        gTabs= null,
        Tabs= null;

    /**
     * Function: OpenLayers.Array.range
     * Build an array from given bound and increment.
     *
     * Parameters:
     * start - {Integer} the lower limit of the array, may be smaller or
     * larger or equal to end parameter. Defaults to 0.
     * end - {Integer} the upper limit of the array, may be larger or smaller
     * or equal to start parameter. Defaults to 9.
     * inc - {Number} the increment from start up to end. Defaults to 1.
     *
     * (code)
     * var A= OpenLayers.Array.range(1, -100, 8.5);
     * (end)
     *
     * Returns:
     * {Array({Number})}
     */
    OpenLayers.Array.range= function(start, end, inc) {
        var A= []; // Create empty array

        // Get arguments or set default values:
        start= Number(start);
        start= !isNaN(start)? start : 0;
        end= Number(end);
        end= !isNaN(end)? end : 9;
        inc= Number(inc);
        inc= !isNaN(inc)? Math.abs(inc) : 1;

        // If inc == 0 return an empty array
        if (inc==0) { return A; }
        // If start == end return array of size 1
        if (start==end) { A.push(start); return A; }

        // Figure out which direction to increment.
        inc *= (start>end? -1 : 1);
        // Loop ending condition depends on relative sizes of start and end
        for (var i= start; (start<end? i<=end : i>=end) ; i+= inc) {
            A.push(i);
        }

        return A;
    };

    /**
     * Override default function in Geoportal.Control.LayerSwitcher for
     * listening to checkboxes changes.
     */
    Geoportal.Control.LayerSwitcher= OpenLayers.overload(Geoportal.Control.LayerSwitcher, {
        /**
         * APIMethod: onInputClick
         * A checkbox has been clicked, check or uncheck its corresponding input.
         *
         * Parameters:
         * e - {Event}
         *
         * Context:
         * inputElem - {DOMElement}
         * layerSwitcher - {<Geoportal.Control.LayerSwitcher>}
         * layer - {<OpenLayers.Layer>}
         */
        onInputClick: function(e) {
            if (e != null) {
                OpenLayers.Event.stop(e);
            }
            this.inputElem.checked= !this.inputElem.checked;
            if (this.layer.inRange) {
                this.layerSwitcher.updateMap();
            }
            var _s= Geoportal.Catalogue.DEFAULT_SERVICE_TYPE;
            var _m= this.layer.CLASS_NAME.match(/\w+\.\w+\.(\w+)/);
            if (_m) {
                _s= _m[1].toUpperCase();
            }
            var _k= this.layer.name+":"+_s;
            if (userLyrsOpts[_k]) {
                userLyrsOpts[_k].visibility= this.inputElem.checked;
                var _e= $('div[id$="tab02_'+this.layer.name+'"] div:first-child');
                $(_e).removeClass(this.inputElem.checked? "gpLayerNotVisible":"gpLayerVisible")
                $(_e).addClass(this.inputElem.checked? "gpLayerVisible":"gpLayerNotVisible")
                debug && console.log("["+_k+"].visibility="+userLyrsOpts[_k].visibility);
            } else {
                if (userOvlsOpts[this.layer.id]) {
                    userOvlsOpts[this.layer.id].params.visibility= this.inputElem.checked;
                    var _e= $('div[id$="tab03_'+this.layer.id+'"] div:first-child');
                    $(_e).removeClass(this.inputElem.checked? "gpLayerNotVisible":"gpLayerVisible")
                    $(_e).addClass(this.inputElem.checked? "gpLayerVisible":"gpLayerNotVisible")
                    debug && console.log("["+this.layer.name+"].visibility="+userOvlsOpts[this.layer.id].params.visibility);
                }
            }
        }
    });

    /**
     * Override default function in Geoportal.Control.LayerOpacitySlider
     * for listening to opacity changes.
     */
    Geoportal.Control.LayerOpacitySlider= OpenLayers.overload(Geoportal.Control.LayerOpacitySlider, {
        /**
         * APIMethod: setOpacity
         * Refreshes the opacity value for the specified layer.
         *
         * Parameters:
         * level - {Integer} percentage of opacity.
         */
        setOpacity: function(level) {
            var o= level;
            if (o==0) {
                o= 0.001;
            } else {
                o= o/100.0;
            }
            this.layer.setOpacity(o);
            var _s= Geoportal.Catalogue.DEFAULT_SERVICE_TYPE;
            var _m= this.layer.CLASS_NAME.match(/\w+\.\w+\.(\w+)/);
            if (_m) {
                _s= _m[1].toUpperCase();
            }
            var _k= this.layer.name+":"+_s;
            if (userLyrsOpts[_k]) {
                userLyrsOpts[_k].opacity= o;
                var _e= $('div[id$="tab02_'+this.layer.name+'"] span:nth-child(2)');
                $(_e).text('  '+OpenLayers.String.sprintf("%3d%%", level));
                debug && console.log("["+_k+"].opacity="+userLyrsOpts[_k].opacity);
            } else {
                if (userOvlsOpts[this.layer.id]) {
                    userOvlsOpts[this.layer.id].params.opacity= o;
                    var _e= $('div[id$="tab03_'+this.layer.id+'"] span:nth-child(2)');
                    $(_e).text('  '+OpenLayers.String.sprintf("%3d%%", level));
                    debug && console.log("["+this.layer.name+"].opacity="+userLyrsOpts[_k].params.opacity);
                }
            }
        }
    });

    /**
     * Override default function in Geoportal.Control.RemoveLayer
     * for listening to removal changes.
     */
    Geoportal.Control.RemoveLayer= OpenLayers.overload(Geoportal.Control.RemoveLayer, {
        /**
         * Method: trigger
         * Listen to removal or not of the layer.
         */
        trigger: function() {
            if (this.removable && this.layer && this.layer.map) {
                var _s= Geoportal.Catalogue.DEFAULT_SERVICE_TYPE;
                var _m= this.layer.CLASS_NAME.match(/\w+\.\w+\.(\w+)/);
                if (_m) {
                    _s= _m[1].toUpperCase();
                }
                var _k= this.layer.name+":"+_s;
                if (userLyrsOpts[_k]) {
                    var unwanted= userLyrsOpts[_k].unwanted===true;
                    if (unwanted===true) {
                        unwanted= false;
                        delete userLyrsOpts[_k].unwanted;
                    } else {
                        unwanted= true;
                        userLyrsOpts[_k].unwanted= true;
                    }
                    var _e= $('div[id$="tab02_'+this.layer.name+'"] span:nth-child(3)');
                    $(_e).css("text-decoration", unwanted? "line-through":"none");
                    _e= $('div[id$="'+this.map.getApplication().lyrSwCntrl.id+'_'+this.layer.id+'"]');
                    $(_e).css("background-image", unwanted? $(_e).hasClass("gpLayerDivClass")? "url(stripes-even.png)":"url(stripes-odd.png)":"none");
                    $(_e).css("background-repeat", unwanted? "repeat":"none");
                    this.setDisplayClass(unwanted? 'gpControlRemoveLayerFull': 'gpControlRemoveLayer');
                    if (unwanted) {
                        this.layer.setVisibility(false);
                    }
                    debug && console.log("["+_k+"].unwanted="+(userLyrsOpts[_k].unwanted || false));
                } else {
                    if (userOvlsOpts[this.layer.id]) {
                        delete userOvlsOpts[this.layer.id];
                        var _i= OpenLayers.Array.indexOf(userOvls, this.layer.id);
                        if (i>=0) {
                            userOvls.splice(i,1);
                        }
                    }
                    if (this.layer.features) {
                        this.layer.destroyFeatures(this.layer.features.slice());
                    }
                    this.layer.map.removeLayer(this.layer);
                }
            }
        }
    });

    /**
     * Function: avlAfterAdd
     * Insert newly added layer to the user's overlays.
     */
    function avlAfterAdd() {
        if (this.opacity===undefined) {
            this.opacity= 1.0;
        }
        OpenLayers.Layer.Vector.prototype.afterAdd.apply(this,arguments);
        var _s= "kml";
        var _m= this.protocol.format.CLASS_NAME.match(/\w+\.\w+\.(\w+)/);
        if (_m) {
            _s= _m[1].toUpperCase();
        }
        if (_s==='wfst') { _s= 'wfs'; };
        userOvls.push(this.id);
        userOvlsOpts[this.id]= {
            'type'   :_s,
            'name'   :this.name,
            'url'    :this.protocol.options.url,
            'params' :{
                'opacity'   :this.opacity,
                'visibility':this.visibility
            },
            'options':{}
        };
    }

    /**
     * Function: onCntrlClickCallBack
     * Handle Cntrl-Click on controls
     *
     * Parameters:
     * evt - {Event}
     */
    function onCntrlClickCallBack(evt) {
        evt= evt || window.event;
        if (!evt) { return; }
        if (evt.ctrlKey) {
            OpenLayers.Event.stop(evt);
            debug && console.log("#"+this.id+" cntrl-click issued!");
            var _k= this.CLASS_NAME, _k2;
            var _o= userComponents[_k];
            if (_o) {
                _k2= this.getUI().displayClass;
                if (!_o[_k2]) {
                    _o[_k2]= {};
                }
                _o= _o[_k2];
            }
            if (_o) {
                var _e= $("div[id$='"+this.id+"']");
                var unwanted= _o.unwanted===true;
                if (unwanted===true) {
                    unwanted= false;
                    delete _o.unwanted;
                } else {
                    unwanted= true;
                    // save background-color if any:
                    _o.bgc= $(_e).css("background-color");
                    _o.unwanted= true;
                }
                if (unwanted) {
                    $(_e).css("background-color", "red");
                    $(_e).corner("12px");
                } else {
                    $(_e).css("background-color", (_o.bgc? _o.bgc:"transparent"));
                    $(_e).uncorner();
                }
                var _e= $('div[id$="tab04_'+_k2+'"] div:first-child');
                $(_e).removeClass(unwanted? "gpLayerVisible":"gpLayerNotVisible")
                $(_e).addClass(unwanted? "gpLayerNotVisible":"gpLayerVisible")
            }
            this.map.events.triggerEvent("controlvisibilitychanged", {
                wanted:!unwanted
            });
            return false;
        }
    }

    /**
     * Function: addCntrlClickToControls
     * Add a new handler on existing controls that listen to Cntrl-Click
     * to manage controls usage in the viewer.
     */
    function addCntrlClickToControls() {
        var cntrls= viewer.getMap().controls;
        var addDivEventOnControl= function(cntrl) {
            cntrl.divEvents= cntrl.divEvents || new OpenLayers.Events(cntrl, cntrl.getUI().getDom(), null, true);
            cntrl.divEvents.registerPriority("click",cntrl,onCntrlClickCallBack);
            var pfDestroy= cntrl.destroy;
            cntrl.destroy= function() {
                if (this.divEvents) {
                    this.divEvents.destroy();
                    this.divEvents= null;
                }
                pfDestroy.apply(this,arguments);
            };
            cntrl.hasCntrlEvents= true;
            debug && console.log("#"+cntrl.id+" listen to Cntrl-Click now");
        };
        for (var i= 0, n= cntrls.length; i<n; i++) {
            var cntrl= cntrls[i];
            if (cntrl.hasCntrlEvents) {
                continue;
            }
            if (cntrl.noUI===true) {
                continue;
            }
            if (cntrl instanceof OpenLayers.Control.Panel) {
                var panel= cntrl;
                var pfOnClick= panel.onClick;
                panel.onClick= function(c,e) {
                    if (e.ctrlKey) {
                        OpenLayers.Event.stop(e? e:window.event);
                        debug && console.log("#"+this.id+" (panel) clicked");
                    } else {
                        pfOnClick.apply(this,arguments);
                    }
                };
                var pfOnDblClick= panel.onDoubleClick;
                panel.onDoubleClick= function(c,e) {
                    if (e.ctrlKey) {
                        OpenLayers.Event.stop(e? e:window.event);
                        debug && console.log("#"+this.id+" (panel) double clicked");
                    } else {
                        pfOnDblClick.apply(this,arguments);
                    }
                };
                for (var j= 0, l= panel.controls.length; j<l; j++) {
                    cntrl= panel.controls[j];
                    if (cntrl.hasCntrlEvents) { continue; }
                    var elt= cntrl.getUI().getDom();
                    OpenLayers.Event.stopObservingElement(elt);
                    addDivEventOnControl(cntrl);
                    OpenLayers.Event.observe( elt, "click",
                        OpenLayers.Function.bind(panel.onClick, panel, cntrl));
                    OpenLayers.Event.observe( elt, "dblclick",
                        OpenLayers.Function.bind(panel.onDoubleClick, panel, cntrl));
                    OpenLayers.Event.observe( elt, "mousedown",
                        OpenLayers.Function.bindAsEventListener(OpenLayers.Event.stop));
                }
                panel.hasCntrlEvents= true;
                continue;
            }
            addDivEventOnControl(cntrl);
        }
    }

    /**
     * Function: initPage
     * Starts Interface
     */
    function initPage() {
        var kid= "generator-key",
            userK= null,
            userT= null,
            userR= null,
            userO= {},
            rid= "generator-key-result",
            tid= "generator-tabs-0",
            zid= "generator-territories-select",
            cid= "generator-center",
            cids= "generator-center-search",
            cidg= "generator-center-geolocate",
            cidc= "generator-center-coords",
            cidz= "generator-center-zoom",
            vid= "generator-map-holder",
            mid= "generator-map",
            lid= "generator-layers-carousel",
            uid= "generator-userlayers-carousel",
            wid= "generator-components-carousel",
            pid= "generator-sample-code",
            json= new OpenLayers.Format.JSON(),
            vwClass= Geoportal.Viewer.Default,

            genMap= function() {
                var uR= eval("uR="+json.write(userR)),// fast clone !
                    uK= userK,
                    uL= userLyrs.slice(),
                    uLO= eval("uLO="+json.write(userLyrsOpts)),
                    uO= eval("uO="+json.write(userO));
                uLO.global= {
                    view:{
                        drop:true
                    }
                };
                // replace userK by kGen to allow displaying!
                uR.apiKey[0]= kGen;
                var R= kGenR[kGen];// uR[uK];
                delete uR[uK];
                uR[kGen]= OpenLayers.Util.extend({}, R);
                uK= kGen;
                uO.proxy= gProxyUrl;
                uO.controlsOptions= OpenLayers.Util.extend(uO.controlsOptions, {
                    'Geoportal.Control.LayerSwitcher':{
                        drawLayer:function(layer,i,l,lup,ldown) {
                            var r= Geoportal.Control.LayerSwitcher.prototype.drawLayer.apply(this,arguments);
                            if (r.drawn) {
                                var _s= Geoportal.Catalogue.DEFAULT_SERVICE_TYPE;
                                var _m= layer.CLASS_NAME.match(/\w+\.\w+\.(\w+)/);
                                if (_m) {
                                    _s= _m[1].toUpperCase();
                                }
                                var _k= layer.name+":"+_s;
                                var _u= userLyrsOpts[_k] && userLyrsOpts[_k].unwanted===true;
                                var _e= OpenLayers.Util.getElement(this.id+'_'+layer.id);
                                _e.style.backgroundImage= _u?
                                    OpenLayers.Element.hasClass(_e,"gpLayerDivClass")?
                                        "url(stripes-even.png)"
                                    :   "url(stripes-odd.png)"
                                :   "none";
                                _e.style.backgroundRepeat= _u?
                                    "repeat"
                                :   "none";
                            }
                            return r;
                        }
                    }
                });
                if (viewer) {
                    viewer.destroy();
                    viewer= null;
                }
                try {
                    viewer= new vwClass(mid, OpenLayers.Util.extend(uO,uR));
                    if (!viewer) {
                        help.empty().append($("<div>", {
                            'text':"Erreur à la création du visualiseur.\n"+x
                        }).addClass('ui-state-error ui-corner-all')).dialog("option","title","Erreur").dialog("open");
                        cleanMap(true);
                        return;
                    }
                    viewer.addGeoportalLayers(uL,uLO);
                    var nv= viewer.getMap().getControlsByClass('Geoportal.Control.NavToolbar')[0];
                    nv.addControls([new Geoportal.Control.PrintMap()]);
                    var tbx= viewer.getMap().getControlsByClass('Geoportal.Control.ToolBox')[0];
                    var measurebar= new Geoportal.Control.MeasureToolbar({
                        div: OpenLayers.Util.getElement(tbx.id+'_measure'),
                        displaySystem:(viewer.getMap().getProjection().getProjName()=='longlat'?'geographic':'metric'),
                        targetElement: OpenLayers.Util.getElement(tbx.id+'_meares')
                    });
                    viewer.getMap().addControl(measurebar);
                    var agls= uR;
                    agls= agls[uK].resources;
                    var hasGeoNames= agls['PositionOfInterest:OPENLS;Geocode']!=null;
                    var hasGeocode= agls['StreetAddress:OPENLS;Geocode']!=null;
                    // FIXME: ReverseGeocodage, CadastralParcel, GeodeticFixedPoint
                    if (hasGeoNames || hasGeocode) {
                        var sOpts= {div:OpenLayers.Util.getElement(tbx.id+'_search')};
                        if (hasGeoNames) {
                            sOpts= OpenLayers.Util.extend(sOpts,{
                                geonamesOptions:{
                                    setZoom:Geoportal.Control.LocationUtilityService.GeoNames.setZoomForBDNyme,
                                    autoCompleteOptions: {},
                                    layerOptions:{
                                        name:'PositionOfInterest:OPENLS;Geocode',
                                        maximumResponses:100,
                                        formatOptions:{},
                                        requestOptions:{method:'GET'}
                                    }
                                }
                            });
                        }
                        if (hasGeocode) {
                            sOpts= OpenLayers.Util.extend(sOpts,{
                                geocodeOptions:{
                                    layerOptions:{
                                        name:'StreetAddress:OPENLS;Geocode',
                                        maximumResponses:100,
                                        formatOptions:{},
                                        requestOptions:{method:'GET'}
                                    },
                                    matchTypes:[
                                        {re:/city/i, src:Geoportal.Util.getImagesLocation()+'OLScity.gif'},
                                        {re:/street$/i, src:Geoportal.Util.getImagesLocation()+'OLSstreet.gif'},
                                        {re:/number/i, src:Geoportal.Util.getImagesLocation()+'OLSstreetnumber.gif'},
                                        {re:/enhanced/i,src:Geoportal.Util.getImagesLocation()+'OLSstreetenhanced.gif'},
                                        {re:null, src:Geoportal.Util.getImagesLocation()+'OLSstreet.gif'}
                                    ]
                                }
                            });
                        }
                        sOpts= OpenLayers.Util.extend(sOpts,{
                            cswOptions:{
                            }
                        });
                        var searchbar= new Geoportal.Control.SearchToolbar(sOpts);
                        viewer.getMap().addControl(searchbar);
                    }
                    var defStyl= new OpenLayers.Style(OpenLayers.Util.applyDefaults({
                        fillColor:'#99CCFF',
                        strokeColor:'#99CCFF',
                        strokeWidth:2,
                        pointRadius:8},
                        OpenLayers.Feature.Vector.style['default']));
                    var selStyl= new OpenLayers.Style(OpenLayers.Util.applyDefaults({
                        fillColor:'#99CCFF',
                        strokeColor:'#99CCFF',
                        strokeWidth:4,
                        pointRadius:12},
                        OpenLayers.Feature.Vector.style['select']));
                    var tmpStyl= new OpenLayers.Style(OpenLayers.Util.applyDefaults({
                        fillColor:'#99CCFF',
                        strokeColor:'#99CCFF'},
                        OpenLayers.Feature.Vector.style['temporary']));
                    var stylMap= new OpenLayers.StyleMap({
                        'default':defStyl.clone(),
                        'select':selStyl.clone(),
                        'temporary':tmpStyl.clone()
                    },{extendDefault:false});
                    var tOpts= {div: OpenLayers.Util.getElement(tbx.id+'_addlyr')};
                    tOpts= OpenLayers.Util.extend(tOpts,{
                        addVectorLayerOptions:{
                            supportedClasses:[
                                'OpenLayers.Format.KML',
                                'Geoportal.Format.GPX',
                                'OpenLayers.Format.OSM',
                                'OpenLayers.Layer.GeoRSS',
                                'OpenLayers.Layer.WFS'
                            ],
                            styleMapTemplates:{
                                'OpenLayers.Format.KML':stylMap.clone(),
                                'Geoportal.Format.GPX':stylMap.clone(),
                                'OpenLayers.Format.OSM':stylMap.clone(),
                                'OpenLayers.Layer.GeoRSS':new OpenLayers.StyleMap(
                                    new OpenLayers.Style(
                                        OpenLayers.Util.applyDefaults({
                                            'graphic':true,
                                            'externalGraphic':Geoportal.Util.getImagesLocation()+'xy-target.gif',
                                            'graphicOpacity':1.0,
                                            'graphicWidth':25,
                                            'graphicHeight':25,
                                            'graphicXOffset':-12.5,
                                            'graphicYOffset':-12.5
                                        },OpenLayers.Feature.Vector.style['default'])
                                    )
                                )
                            },
                            layerVectorOptions:{
                                global:{
                                    afterAdd:avlAfterAdd
                                }
                            }
                        },
                        addImageLayerOptions:{
                            layerImageOptions:{
                                singleTile:false
                            }
                        }
                    });
                    var addlytbar= new Geoportal.Control.LayerToolbar(tOpts);
                    viewer.getMap().addControl(addlytbar);
                    var infoCtrl= viewer.getMap().getControlsByClass('Geoportal.Control.Information')[0];
                    infoCtrl && infoCtrl.minimizeControl();
                } catch (x) {
                    help.empty().append($("<div>", {
                        'text':"Erreur à l'exécution : \n"+x
                    }).addClass('ui-state-error ui-corner-all')).dialog("option","title","Erreur").dialog("open");
                    cleanMap(true);
                }
            },
            cleanMap= function(hide) {
                if (hide===true) { $("#"+vid).hide(); }
                if (viewer) {
                    viewer.destroy();
                    viewer= null;
                }
                $("#"+mid).empty();
            },
            step= 0,
            gTabs= [
            //=========================================================================================TAB1
            {
                title:"Accès",
                body : '',
                fBody:function() {
                    var f, c, k, b, e;

                    f= $("<fmrm>", {
                    });
                    c= $("<div>", {
                        'id':rid
                    }).css('float',"right");
                    k= $("<input type='text'/>").attr({
                        'id':kid,
                        'value':"beg3y6j4n80r41hdupragplx"//TODO: referer toto
                    }).change(function(evt) {
                        if (userK!=null && $("#"+kid).val()!=userK) {
                            for (var _i= gTabs[0].prevStep.length-1; _i>=0; _i--) {
                                gTabs[gTabs[0].prevStep[_i]].raz();
                            }
                            Tabs.tabs("option", "disabled", gTabs[0].prevStep);
                            step= 0;
                            userK= null;
                            c.empty();
                            cleanMap(true);
                        }
                    }).keypress(function(evt) {
                        if (evt.which==13 || evt.which==10) {
                            evt.preventDefault();
                            $("#"+kid).trigger("change");
                            $("#btn"+kid).trigger("click");
                        }
                    });
                    b= $("<input type='button'/>").attr({
                        'id'   :"btn"+kid,
                        'value':"Récupérer mes informations"
                    }).click(function(evt) {
                        if (userK!=null && userK!=$("#"+kid).val()) { return; }
                        userK= $("#"+kid).val();
                        gGEOPORTALRIGHTSMANAGEMENT= undefined;
                        Geoportal.GeoRMHandler.getConfig([userK],null,null,{
                            onContractsComplete:function() {
                                c.empty();
                                if (gGEOPORTALRIGHTSMANAGEMENT.apiKey.length==0) {
                                    c.append($("<div>", {
                                    }).append($("<span>", {
                                    }).css('float',"left").addClass('ui-icon ui-icon-alert')).append(
                                        (userK || "''")+" n'est pas une clef connue."
                                    ).addClass('ui-state-error ui-corner-all'));
                                    for (var _i= gTabs[0].prevStep.length-1; _i>=0; _i--) {
                                        gTabs[gTabs[0].prevStep[_i]].raz();
                                    }
                                    Tabs.tabs("option", "disabled", gTabs[0].prevStep);
                                    userK= null;
                                    step= 0;
                                    cleanMap();
                                    return;
                                }
                                // Récupération des droits de la clé utilisateur userR
                                userR= OpenLayers.Util.extend({}, gGEOPORTALRIGHTSMANAGEMENT);
                                userLyrs= [];
                                userLyrsOpts= {};
                                var s= $("<select>", {
                                });
                                for (var _i= 0, _n= userR[userK].allowedGeoportalLayers.length, _c= new Geoportal.Catalogue(null,userR); _i<_n; _i++) {
                                    var _l= userR[userK].allowedGeoportalLayers[_i],
                                        _xs= _l.split(":"),
                                        _s= _xs.pop(),
                                        _x= _xs.join(":"),
                                        _m= _x.match(/^(\w{3})\.(.*)/);
                                    debug && console.log("["+userK+"] allow:("+_l+")");
                                    if (_m) {
                                        _x= _m[2];
                                        _m= _m[1];
                                    } else {
                                        _m= "WLD";
                                    }
                                    var _t= OpenLayers.i18n(_x);
                                    _t= _t + " ["+OpenLayers.i18n(_m)+"] ("+_s+")";
                                    var o= $("<option>", {
                                        'value':_l,
                                        'text' :_t
                                    });
                                    s.append(o);
                                    if (_s!='OPENLS') {
                                        var _p= _c.getLayerParameters(userT,_x);
                                        if (_p &&
                                            _p.options.minZoomLevel<=Geoportal.Catalogue.TERRITORIES['WLD'].baseLayers[
                                                                         Geoportal.Catalogue.TERRITORIES['WLD'].defaultCRS
                                                                     ].maxZoomLevel) {
                                            userLyrs.push(_l);
                                            userLyrsOpts[_l]= {
                                                'opacity'   : _p.options.opacity,
                                                'visibility': _p.options.visibility
                                            };
                                        }
                                    }
                                }
                                c.append(s);
                                // La clé du gérérateur a tous les droits kGenR
                                // On va lui enlever les couches auxquelles l'utilisateur n'a pas droit
                                // loop over kGenR to only support userR layers :
                                kGenR= OpenLayers.Util.extend({}, kGenR0);
                                for (var _i= kGenR[kGen].allowedGeoportalLayers.length-1; _i>=0; _i--) {
                                    var _l= kGenR[kGen].allowedGeoportalLayers[_i];
                                    debug && console.log("looking for "+_l);
                                    if (userR[userK].allowedGeoportalLayers.indexOf(_l)==-1) {
                                        debug && console.log("not in userR["+userK+"]!");
                                        kGenR[kGen].allowedGeoportalLayers.splice(_i,1);
                                        delete kGenR[kGen].resources[_l];
                                    }
                                }
                                Tabs.tabs("option", "disabled", gTabs[0].nextStep);
                                step= 1;
                                $("#"+vid).show();
                                userO.territory= 'WLD';
                                genMap();
                                if (viewer) {
                                    Tabs.tabs('select',1);
                                }
                            }
                        })
                    });
                    e= $("<fieldset>", {
                    }).addClass('ui-helper-reset').append($("<label>",{
                        'for' :kid,
                        'text':"Votre clef API : "
                    })).css("font-weight","bold").append(k).append(b).append(c).appendTo(f);
                    k.focus();
                    var p= $("<input type='button'/>").attr({
                        'id'   :"bpy"+kid,
                        'value':"Définir un proxy"
                    }).click(function(evt) {
                        if($("#pxygenerator-key").val()==""){
                  		alert("Veuillez définir un proxy");
                        }else{
                           userO.proxy=$("#pxygenerator-key").val(); 
                       }
                    });
                    f.append($("<p>", {
                    }).append($("<fieldset>", {
                    }).addClass('ui-helper-reset').append($("<label>",{
                        'for' :'pxy'+kid,
                        'text':"URL            : "
                    })).append($("<input type='text'/>").attr({
                        'id':'pxy'+kid,
                        'value':userO.proxy || ""
                    })).append(p)));
                    return f;
                },
                help :function() {
                    this.empty().dialog("option","title","Aide").append(
"<p>Cet éditeur vous permet de créer automatiquement le code de l'API Géoportail à ajouter sur votre site Web.</p>"+
"<p>Si vous ne connaissez pas ce que représente une clef API, alors suivez ce "+
"<a href='https://api.ign.fr/geoportail/document.do?doc=6133118#premiers_pas' target='_blank'>pas-à-pas</a>"+
".</p>"+
"<hr/>"+
"<p>Une fois la clef fournie, appuyer sur la touche &quot;Entrer&quot; ou cliquer sur &quot;Récupérer mes informations&quot;.</p>"+
"<hr/>"+
"<ol>"+
"<li class='ui-state-error ui-corner-all'>Si la clef est erronée ou en cas de problème, un message est affiché;</li>"+
"<li>Sinon, la liste des couches disponibles avec votre clef apparaît, ainsi qu'une visualisation fabriquée avec votre clef.</li>"+
"</ol>"+
"<hr/>"+
"<p>Vous pouvez définir l'URL du proxy si vous comptez charger des données KML, GPX, OSM, GeoRSS, WFS, etc ... stockées sur un autre site.</p>"+
"<p>Ce proxy doit obligatoirement être sur votre site.</p>"
                    ).dialog("open");
                },
                raz  :function() {
                    $("#"+rid).empty();
                    $("#"+kid).val("");
                    userK= null;
                    cleanMap(true);
                },
                onTabsSelected:function(evt,ui) {
                    $("#"+kid).focus();
                }
            },
            //=========================================================================================TAB2
            {
                title:"Localisation",
                body :'',
                fBody:function() {
                    var noo= "---",
                        f, s, e, c ;

                    f= $("<form>", {
                    });
                    c= $("<div>", {
                        'id':cid
                    });
                    s= $("<select>", {
                        'id':zid
                    }).append($("<option>", {
                        'value'   :noo,
                        'selected':true,
                        'disabled':false,
                        'text'    :noo
                    })).change(function(evt) {
                        $("option:selected", this).each(function(){ userT= $(this).val();});
                        c.empty();
                        if (userT==noo) {
                            c.append($("<div>", {
                            }).append($("<span>", {
                            }).css('float',"left").addClass('ui-icon ui-icon-alert')).append(
                                " Choisissez un territoire connu."
                            ).addClass('ui-state-error ui-corner-all'));
                            userT= null;
                            Tabs.tabs("option", "disabled", gTabs[1].prevStep);
                            return;
                        }
                        cleanMap();
                        var proxy= userO.proxy;
                        userO= {};
                        userO.territory= $(this).val();
                        if (proxy) {
                            userO.proxy= proxy;
                        }
                        userLyrs= [];
                        userLyrsOpts= {};
                        for (var _i= 0, _n= userR[userK].allowedGeoportalLayers.length, _c= new Geoportal.Catalogue(null,userR); _i<_n; _i++) {
                            var _l= userR[userK].allowedGeoportalLayers[_i],
                                _xs= _l.split(":"),
                                _s= _xs.pop(),
                                _x= _xs.join(":"),
                                _p= _c.getLayerParameters(userT,_x);
                            if (_s!='OPENLS' && _p) {
                                userLyrs.push(_l);
                                userLyrsOpts[_l]= {
                                    'opacity'   : 0.3,//_p.options.opacity,
                                    'visibility': false,//_p.options.visibility
                                };
                                userLyrsOpts['ORTHOIMAGERY.ORTHOPHOTOS:WMTS']= {
                                    'opacity'   : 1,//_p.options.opacity,
                                    'visibility': true,//_p.options.visibility
                                };
                                userLyrsOpts['GEOGRAPHICALGRIDSYSTEMS.MAPS:WMTS']= {
                                    'opacity'   : 0.3,//_p.options.opacity,
                                    'visibility': true,//_p.options.visibility
                                };

                            }
                        }
                        genMap();
                        if (!viewer) {
                            return;
                        }
                        var center= viewer.getMap().getCenter().transform(viewer.getMap().getProjection(), OpenLayers.Projection.CRS84);
                        userO.center= center;
                        var zoom= viewer.getMap().getZoom();
                        userO.zoom= zoom;
                        c.append($("<fieldset>", {
                        }).append($("<legend>", {
                            'text': "Centrage"
                        })).append($("<label>", {
                            'for' :cidc+"x",
                            'text':"Longitude : "
                        }).append($("<input type='text'/>").attr({
                            'id'   :cidc+"x",
                            'value':center.lon,
                            'disabled':true
                        }).css('text-align',"right")).append($("<label>", {
                            'for' :cidc+"y",
                            'text':"Latitude : "
                        }).append($("<input type='text'/>").attr({
                            'id'   :cidc+"y",
                            'value':center.lat,
                            'disabled':true
                        }).css('text-align',"right")).append($("<label>", {
                            'for' :cidz,
                            'text':"Niveau de zoom : "
                        }).css('float',"right").append($("<input type='text'/>").attr({
                            'id'   :cidz,
                            'value':zoom,
                            'disabled':true
                        }).css('text-align',"right"))))));
                        viewer.getMap().events.register("move",    viewer.getMap(), function(evt) {
                            var center= viewer.getMap().getCenter().transform(viewer.getMap().getProjection(), OpenLayers.Projection.CRS84);
                            $("#"+cidc+"x").val(center.lon);
                            $("#"+cidc+"y").val(center.lat);
                            userO.center= center;
                        });
                        viewer.getMap().events.register("zoomend", viewer.getMap(), function(evt) {
                            var zoom= viewer.getMap().getZoom();
                            $("#"+cidz).val(zoom);
                            userO.zoom= zoom;
                        });
                        Tabs.tabs("option", "disabled", gTabs[1].nextStep);
                    });
                    for (var _t in Geoportal.Catalogue.TERRITORIES) {
                        switch(_t) {
                        case 'EUE':// alias for FXX
                        case 'ANF':// alias for GLP, MTQ, SBA, SMA
                        case 'WLD':// useless
                            continue;
                        default   :
                            if (Geoportal.Catalogue.TERRITORIES[_t].baseLayers===undefined) { continue }
                            var o= $("<option>", {
                                'value'   :_t,
                                'selected':false,
                                'disabled':false,
                                'text'    :OpenLayers.i18n(_t)
                            }).appendTo(s);
                            break;
                        }
                    }
                    f.append($("<fieldset>", {
                    }).addClass('ui-helper-reset').append($("<label>",{
                        'for':zid,
                        'text':"Territoire de visualisation : "
                    })).append(s)).append(c);
                    return f;
                },
                help :function() {
                    this.empty().dialog("option","title","Aide").append(
"<p>Utilisez la visualisation pour modifier le centre de la carte et son niveau de zoom.</p>"+
"<h4>Centre de la carte&nbsp;:</h4>"+
"<p>Vous pouvez déplacer la carte&nbsp;:"+
"<ul>"+
"<li>avec la souris (bouton gauche appuyé pendant le déplacement);</li>"+
"<li>avec les touches (flèches du clavier ou page haut/basse);</li>"+
"<li>avec la zone inférieure de la carte, une fois dépliée, en entrant les coordonnées;</li>"+
"<li>avec les moteurs de recherche par lieux ou adresses.</li>"+
"</ul>"+
"<p>Vous pouvez déplacer la carte à tout moment à partir de maintenant, les paramètres seront enregistrés pour la génération du code finale.</p>"+
"</p>"
                    ).dialog("open");
                },
                raz  :function() {
                    $("#"+cid).empty();
                    $("#"+zid+" option:selected").each(function() {
                        $(this).attr({
                            "selected":false
                        })
                    });
                    $("#"+zid+" option:first-child").attr({
                        "selected":true
                    });
                    userT= null;
                    var proxy= userO.proxy;
                    userO= {};
                    if (proxy) {
                        userO.proxy= proxy;
                    }
                    userLyrs= [];
                    userLyrsOpts= {};
                },
                onTabsSelected:function(evt,ui) {
                    if (userR==null || userK==null) { return; }
                    $("option", $("#"+zid)).each(function() {
                        var t= $(this).val();
                        if (Geoportal.Catalogue.TERRITORIES[t]) {
                            var kgbbox= OpenLayers.Bounds.fromArray(userR[userK].bounds || [-180, -90, 180, 90]);
                            var tgbbox= OpenLayers.Bounds.fromArray(Geoportal.Catalogue.TERRITORIES[t].geobbox);
                            $(this).attr({
                                'disabled':!kgbbox.intersectsBounds(tgbbox)
                            });
                        }
                    });
                    if (userT==null) { return ; }
                    Tabs.tabs("option", "disabled", gTabs[1].nextStep);
                }
            },
            //=========================================================================================TAB3
            {
                title:"Vos couches Géoportail",
                body :'',
                fBody:function() {
                    return $("<div>", {
                        'id':lid+"-container"
                    });
                },
                help :function() {
                    this.empty().dialog("option","title","Aide").append(
"<h4>En agissant sur le gestionnaire de couches, vous pouvez configurer l'apparence des couches.</h4>"+
"<p><ul>"+
"<li>en activant/désactivant une couche ;</li>"+
"<li>en ouvrant la configuration de la couche :"+
"<ul>"+
"<li>en changeant l'opacité de la couche;</li>"+
"<li>en mettant la couche à la poubelle : elle disparaîtra de la carte finale;</li>"+
"</ul>"+
"</li>"+
"</ul></p>"
                    ).dialog("open");
                },
                raz  :function() {
                },
                onTabsSelected:function(evt,ui) {
                    var cc= $("#"+lid+"-container");
                    cc.empty();
                    var c= $("<div>", {
                        id:lid
                    }).addClass('rs-carousel').appendTo(cc);
                    var u= $("<ul>", {
                    }).addClass('rs-carousel-runner').appendTo(c);
                    for (var _i= viewer.getMap().layers.length-1; _i>=0; _i--) {
                        var _l= viewer.getMap().layers[_i];
                        var _s= Geoportal.Catalogue.DEFAULT_SERVICE_TYPE;
                        var _m= _l.CLASS_NAME.match(/\w+\.\w+\.(\w+)/);
                        if (_m) {
                            _s= _m[1].toUpperCase();
                        }
                        var _k= _l.name+":"+_s;
                        if (userLyrsOpts[_k]) {
                            if (_l.displayInLayerSwitcher && !_l.isBaseLayer) {
                                var d= $("<div>", {
                                    id:"tab02_"+_l.name
                                }).append($("<div>", {
                                }).addClass(_l.getVisibility()? "gpLayerVisible":"gpLayerNotVisible")).append($("<span>", {
                                    text:'  '+(typeof _l.opacity==='number'? OpenLayers.String.sprintf("%3d%%", _l.opacity*100):'   ')
                                })).append($("<span>", {
                                    text:'  '+OpenLayers.i18n(_l.name)
                                }).css("text-decoration",userLyrsOpts[_k].unwanted===true? "line-through":"none"));
                                u.append($("<li>", {
                                }).addClass('rs-carousel-item').append(d));
                            }
                        }
                    }
                    Tabs.tabs("option", "disabled", gTabs[2].nextStep);
                    var lcar= c.carousel({
                        itemsPerPage:1,
                        itemsPerTransition:1,
                        orientation:'vertical',
                        pagination:false
                    });
                    var _t= window.setTimeout(function() {
                            lcar.carousel('next');
                            lcar.carousel('prev');
                            window.clearTimeout(_t);
                        },1000);
                }
            },
            //=========================================================================================TAB4
            {
                title:"Vos données",
                body :'',
                fBody:function() {
                    return $("<div>", {
                        'id':uid+"-container"
                    });
                },
                help :function() {
                    this.empty().dialog("option","title","Aide").append(
"<h4>En utilisant les composants d'ajouts de couches vectorielles ou images, vous pouvez configurer leur intégration dans la carte.</h4>"+
"<p><ul>"+
"<li>Ajout d'une couche vectorielle :"+
"<ul>"+
"<li>les formats KML, GPX, OSM et WFS sont disponibles;</li>"+
"</ul>"+
"</li>"+
"<li>Ajout d'une couche images :"+
"<ul>"+
"<li>les services WMS, WMS-C, WMTS sont disponibles;</li>"+
"</ul>"+
"</li>"+
"</ul>"+
"</p>"+
"<p>Vous pouvez aussi utiliser le gestionnaire de couches pour modifier l'opacité et la visibilité d'une couche.</p>"+
"<p>Vous pouvez aussi, via ce gestionnaire de couches, supprimer la couche de la carte.</p>"
                    ).dialog("open");
                },
                raz  :function() {
                },
                onTabsSelected:function(evt,ui) {
                    var cc= $("#"+uid+"-container");
                    cc.empty();
                    var c= $("<div>", {
                        id:uid
                    }).addClass('rs-carousel').appendTo(cc);
                    var u= $("<ul>", {
                    }).addClass('rs-carousel-runner').appendTo(c);
                    for (var _i= viewer.getMap().layers.length-1; _i>=0; _i--) {
                        var _l= viewer.getMap().layers[_i];
                        if (userOvlsOpts[_l.id]) {
                            if (_l.displayInLayerSwitcher && !_l.isBaseLayer) {
                                var d= $("<div>", {
                                    id:"tab03_"+_l.id
                                }).append($("<div>", {
                                }).addClass(_l.getVisibility()? "gpLayerVisible":"gpLayerNotVisible")).append($("<span>", {
                                    text:'  '+(typeof _l.opacity==='number'? OpenLayers.String.sprintf("%3d%%", _l.opacity*100):'   ')
                                })).append($("<span>", {
                                    text:'  '+OpenLayers.i18n(_l.name)
                                }));
                                u.append($("<li>", {
                                }).addClass('rs-carousel-item').append(d));
                            }
                        }
                    }
                    Tabs.tabs("option", "disabled", gTabs[3].nextStep);
                    var ucar= c.carousel({
                        itemsPerPage:1,
                        itemsPerTransition:1,
                        orientation:'vertical',
                        pagination:false
                    });
                    var _t= window.setTimeout(function() {
                            ucar.carousel('next');
                            ucar.carousel('prev');
                            window.clearTimeout(_t);
                        },1000);
                    
                    userComponents= {
                        'Geoportal.Control.PrintMap'                        :{
                            'gpControlPrintMap'                         :{}
                        },
                        'OpenLayers.Control.Measure'                        :{
                            'olControlMeasurePath'                      :{},
                            'olControlMeasurePolygon'                   :{}
                        },
                        'Geoportal.Control.Measure.Azimuth'                 :{
                            'gpControlMeasureAzimuth'                   :{}
                        },
                        'Geoportal.Control.LocationUtilityService.GeoNames' :{
                            'gpControlLocationUtilityServiceGeoNames'   :{}
                        },
                        'Geoportal.Control.LocationUtilityService.Geocode'  :{
                            'gpControlLocationUtilityServiceGeocode'    :{}
                        },
                        'Geoportal.Control.CSW'                             :{
                            'gpControlCSW'                              :{}
                        },
                        'Geoportal.Control.AddVectorLayer'                  :{
                            'gpControlAddVectorLayer'                   :{}
                        },
                        'Geoportal.Control.AddImageLayer'                   :{
                            'gpControlAddImageLayer'                    :{}
                        }
                    };

                }
            },
            //=========================================================================================TAB5
            {
                title:"Outils à utiliser",
                body :'',
                fBody:function() {
                    return $("<div>", {
                        'id':wid+"-container"
                    });
                },
                help :function() {
                    this.empty().dialog("option","title","Aide").append(
"<h4>En utilisant les composants présents sur la visualisation, vous pouvez configurer leur intégration dans la carte.</h4>"+
"<p><ul>"+
"<li>Suppression d'un composant :"+
"<ul>"+
"<li>il suffit de cliquer &quot;gauche&quot; sur le composant en maintenant la touche Ctrl;</li>"+
"</ul>"+
"</li>"+
"<li>Ajout d'un composant :"+
"<ul>"+
"<li>il suffit de re-cliquer &quot;gauche&quot; sur le composant en maintenant la touche Ctrl;</li>"+
"</ul>"+
"</li>"+
"</ul>"+
"</p>"
                    ).dialog("open");
                },
                raz  :function() {
                },
                onTabsSelected:function(evt,ui) {
                    addCntrlClickToControls();
                    var cc= $("#"+wid+"-container");
                    cc.empty();
                    var c= $("<div>", {
                        id:wid
                    }).addClass('rs-carousel').appendTo(cc);
                    var u= $("<ul>", {
                    }).addClass('rs-carousel-runner').appendTo(c);
                    for (var _k in userComponents) {
                        var _c= userComponents[_k];
                        for (var __k in _c) {
                            var __c= _c[__k];
                            var d= $("<div>", {
                                id:"tab04_"+__k
                            }).append($("<div>", {
                            }).addClass(__c.unwanted!==true? "gpLayerVisible":"gpLayerNotVisible")).append($("<span>", {
                                text:'  '+'   '
                            })).append($("<span>", {
                                text:'  '+OpenLayers.i18n(__k+'.title')
                            }));
                                u.append($("<li>", {
                            }).addClass('rs-carousel-item').append(d));
                        }
                    }
                    Tabs.tabs("option", "disabled", gTabs[4].nextStep);
                    var wcar= c.carousel({
                        itemsPerPage:1,
                        orientation:'vertical',
                        pagination:false
                    });
                    var _t= window.setTimeout(function() {
                            wcar.carousel('next');
                            wcar.carousel('prev');
                            window.clearTimeout(_t);
                        },1000);
                }
            },
            //=========================================================================================TAB6
            {
                title:"Génération du modèle",
                body :'',
                fBody:function() {
                    return $("<div>", {
                        'id':pid+"-container"
                    });
                },
                help :function() {
                    this.empty().dialog("option","title","Aide").append(
"<p>Pour copier-coller le code généré, double cliquer. Une fois le code sélectionné, cliquer avec le bouton droit et &quot;Copier&quot;.</p>"
                    ).dialog("open");
                },
                raz  :function() {
                },
                onTabsSelected:function(evt,ui) {

                    var generateCode= function() {
                        //FIXME: GeoportalExtended.js si WFS/GeoRSS ?
                        var viewerDivId= "viewerContainer",
                            viewerId= "iViewer",
                            uR= eval("uR="+json.write(userR)),// fast clone !
                            uK= $("#"+kid).val(),//userK,
                            uL= userLyrs.slice(),
                            uLO= eval("uLO="+json.write(userLyrsOpts)),
                            uO= eval("uO="+json.write(userO)),
                            uV= userOvls.slice(),
                            uVO= eval("uVO="+json.write(userOvlsOpts)),
                            uOV= {},
                            uC= {},
                            controlsAdded="";
			Measure='                                   var measurebar= new Geoportal.Control.MeasureToolbar({ \n'+
'                                   		div: OpenLayers.Util.getElement(tbx.id+"_measure"), \n'+
'                                   		displaySystem:(viewer.getMap().getProjection().getProjName()=="longlat"?"geographic":"metric"), \n'+
'                                   		targetElement: OpenLayers.Util.getElement(tbx.id+"_meares") \n'+
'                                   }); \n'+
'                                   viewer.getMap().addControl(measurebar); \n',
                            PrintMap='                                   nv.addControls([new Geoportal.Control.PrintMap()]);\n';
                            GeoNames='                                   var GeoNames= new Geoportal.Control.LocationUtilityService.GeoNames(\n'+ 
'                                               new Geoportal.Layer.OpenLS.Core.LocationUtilityService( \n'+
'                                                "PositionOfInterest:OPENLS;Geocode",//layer name\n'+ 
'                                                { \n'+
'                                                    maximumResponses:100,\n'+
'                                                    formatOptions: {\n'+
'                                                    }\n'+
'                                               }\n'+
'                                               ),{\n'+
'                                                    drawLocation:true,\n'+
'                                                    setZoom: Geoportal.Control.LocationUtilityService.GeoNames.setZoomForBDNyme,\n'+
'                                                    autoCompleteOptions: {}\n'+
'                                               }\n'+
'                                   );\n'+
'                                   panel.addControls([GeoNames]);\n';
                            Geocode='                                   var Geocode= new Geoportal.Control.LocationUtilityService.Geocode(\n'+ 
'                                               new Geoportal.Layer.OpenLS.Core.LocationUtilityService( \n'+
'                                                       "StreetAddress:OPENLS;Geocode",//layer name \n'+
'                                                       { \n'+
'                                                           maximumResponses:100,\n'+
'                                                           formatOptions: {\n'+
'                                                           }\n'+
'                                                       }\n'+
'                                               ),{\n'+
'				                                       drawLocation:true,\n'+
'				                                       setZoom: Geoportal.Control.LocationUtilityService.GeoNames.setZoomForBDNyme,\n'+
'				                                       autoCompleteOptions: {}\n'+
'                                               }\n'+
'                                   );\n'+
'                                   panel.addControls([Geocode]);\n';
                            CSW='                                   var CSW= new Geoportal.Control.CSW(\n'+
'                                               OpenLayers.Util.extend( \n'+
'                                                       { \n'+
'                                                           title:"gpControlCSW.title"\n'+
'                                                       },\n'+
'                                                       {\n'+
'                                                           cswUrl:"http://www.geocatalogue.fr/api-public/servicesRest?"\n'+
'                                                       }\n'+
'                                               ))\n'+
'                                   panel.addControls([CSW]);\n';
                            addVectorLayerOptions='         	                                                addVectorLayerOptions:{\n'+
'                                                        	           supportedClasses:[\n'+
'                                                        	               "OpenLayers.Format.KML",\n'+
'                                                        	               "Geoportal.Format.GPX",\n'+
'                                                        	               "OpenLayers.Format.OSM",\n'+
'                                                         	              "OpenLayers.Layer.GeoRSS",\n'+
'                                                         	              "OpenLayers.Layer.WFS"\n'+
'                                                        	           ],\n'+
'                                                        	           styleMapTemplates:{\n'+
'                                                         	              "OpenLayers.Layer.GeoRSS":new OpenLayers.StyleMap(\n'+
'                                                         	                  new OpenLayers.Style(\n'+
'                                                         	                      OpenLayers.Util.applyDefaults({\n'+
'                                                         	                          "graphic":true,\n'+
'                                                           	                        "externalGraphic":Geoportal.Util.getImagesLocation()+"xy-target.gif",\n'+
'                                                            	                       "graphicOpacity":1.0,\n'+
'                                                            	                       "graphicWidth":25,\n'+
'                                                            	                       "graphicHeight":25,\n'+
'                                                             	                      "graphicXOffset":-12.5,\n'+
'                                                             	                      "graphicYOffset":-12.5\n'+
'                                                             	                  },OpenLayers.Feature.Vector.style["default"])\n'+
'                                                           	                )\n'+
'                                                            	           )\n'+
'                                                           	        },\n'+
'                                                            	       layerVectorOptions:{\n'+
'                                                            	           global:{\n'+
'                                                             	          }\n'+
'                                                             	      }\n'+
'                                                            	   }\n';

                            addImageLayerOptions='                        	                                  addImageLayerOptions:{\n'+
'                                                                  	 layerImageOptions:{\n'+
'                                                                  	     singleTile:false\n'+
'                                                                 	  }\n'+
'                                                               	}\n';
                        var a=userComponents['Geoportal.Control.AddVectorLayer']['gpControlAddVectorLayer'].unwanted;
                        var b=userComponents['Geoportal.Control.AddImageLayer']['gpControlAddImageLayer'].unwanted;
                        var addOptions;
                        
                        function addImVectLayerCtrl(addImageOptions){
                            Addctrl='                                   var tOpts= {div: OpenLayers.Util.getElement(tbx.id+"_addlyr")};\n'+
'                                               tOpts= OpenLayers.Util.extend(tOpts,{\n'+
                                                    addOptions+'\n'+
'                                               });\n'+
'                                  var LayerToolbar= new Geoportal.Control.LayerToolbar(tOpts);\n'+
'                                  viewer.getMap().addControl(LayerToolbar);\n';

                              return Addctrl;
                        } 


                        if(!a && !b){
			       addOptions=addVectorLayerOptions+',\n'+addImageLayerOptions;
                                   AddVectorLayer=addImVectLayerCtrl(addOptions);
                                   addImageLayer="";
                        }else if(!a && b){
			       addOptions=addVectorLayerOptions;
                                   AddVectorLayer=addImVectLayerCtrl(addOptions);

                        }else if(a && !b){
                                   addOptions=addImageLayerOptions;
                                   AddImageLayer=addImVectLayerCtrl(addOptions);
                        }

                         function deactivateCtrl(ctrl,i,name){
                               		                                   			 name=name+'\n'+
'                            	   var control_deactivated=viewer.getMap().getControlsByClass("Geoportal.Control.'+ctrl+'")[0].controls['+i+'];\n'+
'                                   control_deactivated.deactivate;\n'+
'                                   control_deactivated.div.style.display="none";\n';
                               
                         	return name;
                         }
                         
                         var MeasureToolbar =viewer.getMap().getControlsByClass("Geoportal.Control.MeasureToolbar")[0];

                         if(userComponents[MeasureToolbar.controls[0].CLASS_NAME]['olControlMeasurePath'].unwanted){
                         	Measure=deactivateCtrl("MeasureToolbar",0,Measure);
                         }
                         if(userComponents[MeasureToolbar.controls[1].CLASS_NAME]['olControlMeasurePolygon'].unwanted){
                            Measure=deactivateCtrl("MeasureToolbar",1,Measure);
                         }
                         if(userComponents[MeasureToolbar.controls[2].CLASS_NAME]['gpControlMeasureAzimuth'].unwanted){
                            Measure=deactivateCtrl("MeasureToolbar",2,Measure);
                         }

                        for (var _i= uL.length-1; _i>=0; _i--) {
                            var _l= uL[_i];
                            // uLO[_l] is null when _l is *:OPENLS
                            if (uLO[_l] && uLO[_l].unwanted===true) {
                                uL.splice(_i,1);
                                delete uLO[_l];
                            }
                        }
                        for (var _i= 0, _n= uV.length; _i<_n; _i++) {
                            var _l= uV[_i], _o= uVO[_l];
                            if (!uOV[_o.type]) { uOV[_o.type]= []; }
                            uOV[_o.type].push({
                                'name'   :_o.name,
                                'url'    :_o.url,
                                'params' :OpenLayers.Util.extend({}, _o.params),
                                'options':OpenLayers.Util.extend({}, _o.options)
                            });
                        }

                        for (var _c in userComponents) {
                            for (var _k in userComponents[_c]) {
                                if (!userComponents[_c][_k].unwanted) {
                                    var tab=_c.split(".");
                                    if(tab[tab.length-1]=="Azimuth" || toto =="1" && tab[tab.length-1]=="Measure"){continue;}                                        
                                    controlsAdded=controlsAdded+'\n'+window[tab[tab.length-1]];
                                    if(tab[tab.length-1]=="Measure"){var toto="1";}                                      } 
                            }
                        }
                        var GeoNames_unwanted=userComponents['Geoportal.Control.LocationUtilityService.GeoNames']['gpControlLocationUtilityServiceGeoNames'].unwanted;
                        var Geocode_unwanted=userComponents['Geoportal.Control.LocationUtilityService.Geocode']['gpControlLocationUtilityServiceGeocode'].unwanted;
                       if(GeoNames_unwanted && !Geocode_unwanted ||Geocode_unwanted && !GeoNames_unwanted|| !GeoNames_unwanted && !GeoNames_unwanted){
                        	controlsAdded=controlsAdded+'\n                                   viewer.getMap().addControls([panel]);\n';
                         }


                        var jsCode=
'<!DOCTYPE html>\n'+
'<html>\n'+
'<head>\n'+
'<title>'+$("#"+kid).val()+'</title>\n'+
'<meta http-equiv="Content-Type" content="text/html; charset=UTF-8">\n'+
'<link id="__OpenLayersCss__" rel="stylesheet" type="text/css" href="http://api.ign.fr/geoportail/api/js/latest/theme/default/style.css"/>\n'+
'<link id="__GeoportalCss__" rel="stylesheet" type="text/css" href="http://api.ign.fr/geoportail/api/js/latest/theme/geoportal/style.css"/>\n'+
'<style type="text/css"><!--/*--><![CDATA[/*><!--*/\n'+
'    div#'+viewerDivId+' {\n'+
'        width:800px;\n'+
'        height:600px;\n'+
'    }\n'+
'/*]]>*/--></style>\n'+
'</head>\n'+
'<body>\n'+
'<div id="'+viewerDivId+'"></div>\n'+
'<script type="text/javascript"><!--//--><![CDATA[//><!--\n'+
'    /**\n'+
'     * Property: '+viewerId+'\n'+
'     * {<Geoportal.InterfaceViewer>} The Geoportal API viewer interface.\n'+
'     */\n'+
'    '+viewerId+'= null;\n'+
'\n'+
'    /**\n'+
'     * Function: init\n'+
'     * Load the map. Called when "onload" event is fired.\n'+
'     */\n'+
'    function init() {\n'+
'        '+viewerId+'= Geoportal.load(\n'+
'            // map\'s div id - identifiant de la div de la carte :\n'+
'            "'+viewerDivId+'",\n'+
'            // API\'s keys - clefs API :\n'+
'            ["'+$("#"+kid).val()+'"],\n'+
'            {\n'+
'                // center in WGS84G - centre en WGS84G\n'+
'                lon: '+userO.center.lon+',\n'+
'                lat: '+userO.center.lat+'\n'+
'            },\n'+
'            // zoom level (0-20) - niveau de zooms (0 à 20) :\n'+
'            '+userO.zoom+',\n'+
'            {   // various options :\n'+
'                // type of API :\n'+
'                type:"js", //TODO : add API type choice in the application\n'+
'                proxyUrl:"'+userO.proxy+'?url=",\n'+
'                // viewer default controls options overloads :\n'+
'                componentsOptions:'+json.write(uC)+',\n'+
'                // projection for mouse coordinates (default value: CRS:84) :\n'+
'                //displayProjection:"CRS:84",\n'+
'                // Application language (defaults to browser\'s language) :\n'+
'                //language:"fr",\n'+
'                // Geoportal\'s layers to load (when none, all contracts\' layers are loaded) :\n'+
'                layers:'+json.write(uL)+',\n'+
'                // Geoportal\'s layers options :\n'+
'                layersOptions:'+json.write(uLO)+',\n'+
'                // callback to use before creating the viewer :\n'+
'                onBeforeView:function() {/* this==window */\n'+
'                },\n'+
'                // callback to use before returning (after centering) :\n'+
'                onView:function() {viewer='+viewerId+'.getViewer(); \n'+
'                                   var nv= viewer.getMap().getControlsByClass("Geoportal.Control.NavToolbar")[0]; \n'+
'                                   var tbx= viewer.getMap().getControlsByClass("Geoportal.Control.ToolBox")[0]; \n'+
'                                   var panel= new Geoportal.Control.Panel({\n'+
'                                                          div:OpenLayers.Util.getElement(tbx.id+"_search")//hook/anchor \n'+
'                                              });\n'+
'                                   '+controlsAdded+' \n'+
'                },\n'+
'                // callback to use when the viewer is ready (defaults to Geoportal.loadJs.defaultOnViewerLoaded) :\n'+
'                //onViewerLoaded:function() {/* this=='+viewerId+' */\n'+
'                //},\n'+
            (uV.length>0?
'                // External or user\'s layers :\n'+
'                overlays:'+json.write(uOV)+',\n'
            :'')+
'                // class of viewer to use :\n'+
'                viewerClass:"Geoportal.Viewer.Default" //TODO: add class choice in the application\n'+
'            }\n'+
'        );\n'+
'    }\n'+
'\n'+
'\n'+
'    window.onload= init;\n'+
'//--><!]]><'+'/script>\n'+
'<script type="text/javascript" charset="utf-8" src="http://api.ign.fr/geoportail/api/js/latest/GeoportalExtended.js"><!--//--><![CDATA[//><!--\n'+
'//--><!]]><'+'/script>\n'+
'</body>\n'+
'</html>\n';
                        jsCode= jsCode.replace(/</g,"&lt;").replace(/>/g,"&gt;");
                        var cc= $('#'+pid+"-container");
                        cc.empty();
                        var code= $('<pre>', {
                            id:'generated-code-sample',
                            html:jsCode
                        }).addClass('brush:js;ruler:true;first-line:1;html-script:true;toolbar:true;quick-code:true;').appendTo(cc);
                        var classItems= code.get(0).className.replace(/.+?(brush:|language-)/,'$1').replace('language-','').split(";")
                        var brush= (classItems[0].split(":"))[1];
                        var elementParams= {};
                        for (var _i= 0, _l= classItems.length-1; _i<_l; _i++) {
                            var elements= classItems[_i].split(":");
                            var _k= elements[0];
                            var _v= elements[1];
                            elementParams[_k]= (_v=='true'?
                                true
                            :   (_v=='false'?
                                false
                            :   (_v.match(/[0-9]+/)?
                                parseInt(_v)
                            :   _v)));
                        }
                        var params= $.extend({}, SyntaxHighlighter.defaults, elementParams);
                        SyntaxHighlighter.highlight(params, code.get(0));
                        return code;
                    };
                    viewer.getMap().events.unregister("moveend",null,generateCode);
                    viewer.getMap().events.register("moveend",null,generateCode);
                    viewer.getMap().events.unregister("zoomend",null,generateCode);
                    viewer.getMap().events.register("zoomend",null,generateCode);
                    viewer.getMap().events.unregister("changelayer",null,generateCode);
                    viewer.getMap().events.register("changelayer",null,generateCode);
                    viewer.getMap().events.unregister("removelayer",null,generateCode);
                    viewer.getMap().events.register("removelayer",null,generateCode);
                    viewer.getMap().events.unregister("controlvisibilitychanged",null,generateCode);
                    viewer.getMap().events.register("controlvisibilitychanged",null,generateCode);
                    return generateCode();
                }
            }
            ],
            nTabs= gTabs.length-1,
            Tabs= $("#generator-tabs").append("<ul/>").tabs({
                tabTemplate:"<li><a href='#{href}'>#{label}</a> <span class='ui-icon ui-icon-help'>Aide</span></li>",
                panelTemplate:"<div></div>",
                add: function(evt, ui) {
                    gTabs[ui.index].body= gTabs[ui.index].fBody();
                    $(ui.panel).append(gTabs[ui.index].body);
                    gTabs[ui.index].nextStep= OpenLayers.Array.range(ui.index+2,nTabs,ui.index<nTabs-1? 1:0);
                    gTabs[ui.index].prevStep= OpenLayers.Array.range(ui.index+1,nTabs,ui.index<nTabs?   1:0);
                }
            }),
            help= $("#generator-help").dialog({
                autoOpen:false,
                modal:true,
                position:"center",
                width:"50%",
                height:600,
                buttons:{
                    Fermer: function() {
                        $(this).dialog("close");
                    }
                },
                open:function() {
                },
                close:function() {
                }
            });

        //SyntaxHightlighter.config.clipboardSwf= './clipboard.swf';
        SyntaxHighlighter.config.strings.aboutDialog= 'Geoportal Api Web JS Generator<br/>&copy;IGN 2012';

        SyntaxHighlighter.config.strings.expandSource= 'show source';
        SyntaxHighlighter.config.strings.viewSource= 'view source';
        SyntaxHighlighter.config.strings.copyToClipboard= 'copy to clipboard';
        SyntaxHighlighter.config.strings.copyToClipboardConfirmation= 'The code is in your clipboard now';
        SyntaxHighlighter.config.strings.print= 'print';
        SyntaxHighlighter.config.strings.help= '?';

        kGenR0= OpenLayers.Util.extend({}, window.gGEOPORTALRIGHTSMANAGEMENT);

        OpenLayers.Lang.setCode("fr");
        // en attendant que ce soit dans Geoportal.Lang.fr:
        Geoportal.Lang['fr']['gpControlInformation.title']= "Panneau d'informations";
        $("#generator-page").css('width',($("#generator-page").width() - 20)+"px");
        $.each(gTabs, function(i,v) {
            Tabs.tabs("add", "#"+tid+i, (i+1)+" - "+v.title, i);
        });
        Tabs.tabs("option", "disabled", OpenLayers.Array.range(1,gTabs.length-1));
        Tabs.bind('tabsselect', function(evt, ui) {
            gTabs[ui.index].onTabsSelected.apply(this,arguments);
        });
        $("span.ui-icon-help", Tabs).live("click", function() {
            var index= $("li", Tabs).index($(this).parent());
            debug && console.log("help pressed for #"+index+" tab");
            // if tab is disabled :
            // if ($.inArray(index, $("#tabs").tabs("option", "disabled")) > -1) { return; }
            if (Tabs.tabs("option", "selected")==index) {
                gTabs[index].help.apply(help,arguments);
            }
        });
        $("#"+kid).focus();
    }

    window.gGEOPORTALRIGHTSMANAGEMENT= undefined;
    kGenR= kGenR0= null;

    Geoportal.GeoRMHandler.getConfig([kGen], null, null, {
        onContractsComplete:initPage
    });
}

$(document).ready(loadPage);