/*
 * Copyright (c) 2008-2013 Institut National de l'information Geographique et forestiere France, released under the
 * BSD license.
 */
var iMob= 0, nMob= 0;
var gMobs= [];
var timer= null;
var ssm= null;

/**
 * Property: viewer
 * {<Geoportal.Viewer>} the viewer global instance.
 */
viewer= null;

/**
 * Function: feedInputs
 * Build a store of {<OpenLayers.Feature.Vector>} into global variable gMobs.
 */
function feedInputs() {
    gMobs= [
        /*V*/[
        new OpenLayers.Feature.Vector(
            new OpenLayers.Geometry.Point(2.423373591239743,48.844188646209666),
            {id:'1', name:'V', speed:0, type:1}),
        new OpenLayers.Feature.Vector(
            new OpenLayers.Geometry.Point(2.4237650967149036,48.845796630568245),
            {id:'1', name:'V', speed:30, type:1}),
        new OpenLayers.Feature.Vector(
            new OpenLayers.Geometry.Point(2.4224470282818635,48.84605714200064),
            {id:'1', name:'V', speed:31, type:1}),
        new OpenLayers.Feature.Vector(
            new OpenLayers.Geometry.Point(2.4202676478034704,48.84626375451598),
            {id:'1', name:'V', speed:32, type:1}),
        new OpenLayers.Feature.Vector(
            new OpenLayers.Geometry.Point(2.4195368375831703,48.84633561973872),
            {id:'1', name:'V', speed:33, type:1}),
        new OpenLayers.Feature.Vector(
            new OpenLayers.Geometry.Point(2.4179447153175184,48.84647036703133),
            {id:'1', name:'V', speed:34, type:1}),
        new OpenLayers.Feature.Vector(
            new OpenLayers.Geometry.Point(2.417566260024863,48.84629070397451),
            {id:'1', name:'V', speed:35, type:1}),
        new OpenLayers.Feature.Vector(
            new OpenLayers.Geometry.Point(2.4175532098423576,48.845428321301746),
            {id:'1', name:'V', speed:35, type:1}),
        new OpenLayers.Feature.Vector(
            new OpenLayers.Geometry.Point(2.41763151093739,48.84365864019203),
            {id:'1', name:'V', speed:34, type:1}),
        new OpenLayers.Feature.Vector(
            new OpenLayers.Geometry.Point(2.418492822982743,48.843568808663626),
            {id:'1', name:'V', speed:33, type:1}),
        new OpenLayers.Feature.Vector(
            new OpenLayers.Geometry.Point(2.4209984580237696,48.84475458483866),
            {id:'1', name:'V', speed:32, type:1}),
        new OpenLayers.Feature.Vector(
            new OpenLayers.Geometry.Point(2.4217423184265745,48.84438627557218),
            {id:'1', name:'V', speed:31, type:1}),
        new OpenLayers.Feature.Vector(
            new OpenLayers.Geometry.Point(2.4229820857645827,48.84332626353691),
            {id:'1', name:'V', speed:30, type:1}),
        new OpenLayers.Feature.Vector(
            new OpenLayers.Geometry.Point(2.423373591239743,48.844188646209666),
            {id:'1', name:'V', speed:0, type:1})
        ],
        /*W*/[
        new OpenLayers.Feature.Vector(
            new OpenLayers.Geometry.Point(2.423373591239743,48.844188646209666),
            {id:'2', name:'W', speed:30, type:2}),
        new OpenLayers.Feature.Vector(
            new OpenLayers.Geometry.Point(2.4232952901447113,48.843640673886355),
            {id:'2', name:'W', speed:31, type:2}),
        new OpenLayers.Feature.Vector(
            new OpenLayers.Geometry.Point(2.4229037846695505,48.8435867749693),
            {id:'2', name:'W', speed:32, type:2}),
        new OpenLayers.Feature.Vector(
            new OpenLayers.Geometry.Point(2.4219380711641545,48.844359326113654),
            {id:'2', name:'W', speed:33, type:2}),
        new OpenLayers.Feature.Vector(
            new OpenLayers.Geometry.Point(2.4210245583887806,48.84482645006139),
            {id:'2', name:'W', speed:34, type:2}),
        new OpenLayers.Feature.Vector(
            new OpenLayers.Geometry.Point(2.4202415474384593,48.84518577617504),
            {id:'2', name:'W', speed:35, type:2}),
        new OpenLayers.Feature.Vector(
            new OpenLayers.Geometry.Point(2.418310120427668,48.84608409145916),
            {id:'2', name:'W', speed:36, type:2}),
        new OpenLayers.Feature.Vector(
            new OpenLayers.Geometry.Point(2.418127417872593,48.84633561973872),
            {id:'2', name:'W', speed:37, type:2}),
        new OpenLayers.Feature.Vector(
            new OpenLayers.Geometry.Point(2.4176576113024004,48.84642545126712),
            {id:'2', name:'W', speed:38, type:2}),
        new OpenLayers.Feature.Vector(
            new OpenLayers.Geometry.Point(2.4159610875767052,48.84660511432395),
            {id:'2', name:'W', speed:39, type:2}),
        new OpenLayers.Feature.Vector(
            new OpenLayers.Geometry.Point(2.415204176991395,48.846856642603505),
            {id:'2', name:'W', speed:40, type:2}),
        new OpenLayers.Feature.Vector(
            new OpenLayers.Geometry.Point(2.414134062025956,48.84709020457737),
            {id:'2', name:'W', speed:41, type:2}),
        new OpenLayers.Feature.Vector(
            new OpenLayers.Geometry.Point(2.413977459835892,48.84644341757281),
            {id:'2', name:'W', speed:42, type:2}),
        new OpenLayers.Feature.Vector(
            new OpenLayers.Geometry.Point(2.413925259105871,48.84425152827955),
            {id:'2', name:'W', speed:43, type:2})
        ]
    ];
    nMob= gMobs[0].length;
    for (var m= 1; m<gMobs.length; m++) {
        nMob= Math.min(nMob, gMobs[m].length);
    }
}

/**
 * Function: onBeforeFeatureAddedListener
 * Build moving feature's style on feature insert callback before drawing the feature.
 *
 * Parameters:
 * o - {<OpenLayers.Feature.Vector>} the context embedding the newly inserted feature.
 *
 * Returns:
 * {Boolean} true if Ok, false otherwise (context or feature is null).
 */
function onBeforeFeatureAddedListener(o) {
    if (!o || !o.feature) {return false;}
    if (o.feature.geometry.CLASS_NAME.match('\.Point$')) {
        o.feature.style= OpenLayers.Util.applyDefaults(
            {
                cursor:'pointer',
                externalGraphic:'img/ign_vehicule.gif',
                graphicWidth:22,
                graphicHeight:22,
                graphicOpacity:1.0,
                graphicXOffset:-22,
                graphicYOffset:-22
            },
            OpenLayers.Feature.Vector.style["default"]);
    } else if (o.feature.geometry.CLASS_NAME.match('\.LineString$')) {
        o.feature.style= OpenLayers.Util.applyDefaults(
            {
                strokeColor:o.feature.attributes.type==1? 'yellow':'red',
                strokeOpacity:1.0,
                strokeWidth:3,
                strokeLinecap:'square',
                strokeDashstyle:'dot'
            },
            OpenLayers.Feature.Vector.style["default"]);
    }
    return true;
}

/**
 * Function: onFeatureAddedListener
 * Creates the popup linked with the moving feature.
 *      If the feature is out of bounds then the popup is hidden to prevent errors.
 *
 * Parameters:
 * o - {<OpenLayers.Feature.Vector>} the context embedding the newly added feature.
 *
 * Returns:
 * {Boolean} true if Ok, false otherwise (context or feature is null).
 */
function onFeatureAddedListener(o) {
    if (!o || !o.feature) {return false;}
    if (!o.feature.popup && o.feature.geometry.CLASS_NAME.match('\.Point$')) {
        o.feature.popup= new OpenLayers.Popup.FramedCloud(
            "chicken",
            o.feature.geometry.getBounds().getCenterLonLat(),
            null,
            "<div style='"+
                        "background-color:#FFFF00;"+
                        "font-size:.75em;"+
                        "font-family:\"Courier New, monospace\";"+
                        "font-weight:bold;"+
                        "color:#000000;"+
                        "'>" +
                o.feature.attributes['name']+
            "</div>" +
            "<div>"+OpenLayers.i18n("speed.label")+" : " +o.feature.attributes['speed']+ " km/h</div>",
            null,
            false);
        o.feature.popup.panMapIfOutOfView= false;//true by default in OpenLayers.Popup.FramedCloud
        o.feature.popup.autoSize= true;
        o.feature.popup.maxSize= new OpenLayers.Size(200,200);
        o.feature.popup.minSize= new OpenLayers.Size(100,100);
        o.feature.popup.contentDiv.style.overflow= 'auto';
    }
    if (o.feature.popup) {
        if (OpenLayers.Util.indexOf(o.feature.layer.map.popups,o.feature.popup)==-1 &&
            viewer.getMap().getExtent().containsLonLat(o.feature.popup.lonlat,false)) {
            o.feature.layer.map.addPopup(o.feature.popup);
        }
        if (!o.feature.layer.visibility) {
            o.feature.popup.hide();
        } else {
            o.feature.popup.show();
        }
    }
    return true;
}

/**
 * Function: onBeforeFeatureRemovedListener
 * Hide feature's popup when deleting feature.
 *
 * Parameters:
 * o - {<OpenLayers.Feature.Vector>} the context embedding the feature to delete.
 *
 * Returns:
 * {Boolean} true if Ok, false otherwise (context or feature is null).
 */
function onBeforeFeatureRemovedListener(o) {
    if (!o || !o.feature) {return false;}
    if (o.feature.popup) {
        o.feature.popup.hide();
    }
    return true;
}

/**
 * Function: onFeatureRemovedListener
 * Callback invoked when the feature is revoved. Do nothing for the moment.
 * Parameters:
 * o - {<OpenLayers.Feature.Vector>} the context embedding the feature to delete.
 *
 * Returns:
 * {Boolean} true if Ok, false otherwise (context or feature is null).
 */
function onFeatureRemovedListener(o) {
    if (!o || !o.feature) {return false;}
    return true;
}

/**
 * Function: loadMobiles
 * Simulate inputs from a real monitoring systems.
 *      The moving feature track is displayed along with the feature itself.
 */
function loadMobiles() {
    if (timer) { clearTimeout(timer); timer= null; }
    if (!(ssm && ssm.checked)) { return; }
    if (iMob==nMob) {
        this.destroyFeatures();
        ssm.checked= false;
        iMob= 0;
        return;
    }
    var f= null, of= null;
    var t= null;
    for (var m= 0; m<2; m++) {
        f= gMobs[m][iMob].clone();//simulate input stream ...
        f.geometry.transform(this.getNativeProjection(),this.map.getProjection());
        of= this.getFeatureById(f.attributes.id,function(f){return f.attributes.id});
        if (of!=null) {
            this.destroyFeatures([of]);
            t= this.getFeatureById('trajectory'+f.attributes.id,function(f){return f.attributes.id});
        } else {
            // trajectoire
            t= new OpenLayers.Feature.Vector(
                    new OpenLayers.Geometry.LineString(),
                    {id:'trajectory'+f.attributes.id,type:f.attributes.type});
            this.addFeatures([t]);
        }
        t.geometry.addComponent(f.geometry);
        this.addFeatures([f]);
        this.drawFeature(f);
        this.drawFeature(t);
    }
    iMob++;
    timer= setTimeout(OpenLayers.Function.bind(loadMobiles,this),2000);//2s
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
    translate(['ssmLabel']);

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

    feedInputs();
    viewer.addGeoportalLayers(
        ['ORTHOIMAGERY.ORTHOPHOTOS', 'GEOGRAPHICALGRIDSYSTEMS.MAPS'],
        {
            'GEOGRAPHICALGRIDSYSTEMS.MAPS':{
                visibility:false,
                displayInLayerSwitcher:false
            },
            global:{
                visibility:true
            }
        });

    var mobile= new OpenLayers.Layer.Vector(
        'mobile.name',
        {
            projection:OpenLayers.Projection.CRS84,
            getFeatureById:function(featureId) {
                var fid= arguments.length==2?
                    arguments[1]
                :   function(f){return f.id};
                var feature= null;
                for (var i= 0, len= this.features.length; i<len; ++i) {
                    if (fid(this.features[i]) == featureId) {
                        feature= this.features[i];
                        break;
                    }
                }
                return feature;
            },
            eventListeners:{
                "beforefeatureadded"  :onBeforeFeatureAddedListener,
                "featureadded"        :onFeatureAddedListener,
                "beforefeatureremoved":onBeforeFeatureRemovedListener,
                "featureremoved"      :onFeatureRemovedListener
            }
        });
    viewer.getMap().addLayer(mobile);
    viewer.getMap().setCenterAtLonLat("2°25'16.8\"E", "48°50'42.3\"", 16);
    // cache la patience - hide loading image
    viewer.div.style[OpenLayers.String.camelize('background-image')]= 'none';
    ssm= OpenLayers.Util.getElement('ssm');
    ssm.onclick= function() {
        if (this.checked) {
            setTimeout(OpenLayers.Function.bind(loadMobiles,mobile,10));
        }
    };
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
