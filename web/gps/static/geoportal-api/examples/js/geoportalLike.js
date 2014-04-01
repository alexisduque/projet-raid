/*
 * Copyright (c) 2008-2013 Institut National de l'information Geographique et forestiere France, released under the
 * BSD license.
 */
var gPARAMS= {
    t:undefined,
    l:{
/*
        'layerName':{
            title:'',
            url:'',
            serviceType:'WMS',
            srs:'EPSG:4326',
            bounds:[-180,-90,180,90],
            zmin:0,
            zmax:21,
            opacity:0.5,
            visibility:true,
            format:'image/jpg',
            transparency:false,
            description:null,
            metadataURL:null,
            dataURL:null,
            nomlogo:'unknownAuthority',
            pictureurl:'/geoportail/api/js/2.0.3/theme/black/img/logo_unknownAuthority.gif',
            urlogo:'javascript:void(0)',
            legends:[
                {
                    style:'',
                    title:'',
                    href:'',
                    width:100,
                    height:100
                }
            ],
            e:{                                             // error happened
                m:[
                    {                                       // log level
                        l:'INFO',
                        t:{
                            'fr':'message d\'information',  // in french
                            'en':'informal message'         // in english
                        }
                    },
                    {
                        l:'WARN',
                        t:{
                            'fr':'message d\'alerte',
                            'en':'warning message'
                        }
                    },
                    {
                        l:'ERROR',
                        t:{
                            'fr':'message d\'erreur',
                            'en':'error message'
                        }
                    }
                ],
                i:true                                      // don't display when true
            }
        },
        '__$N':{                                            // Nth
            url:'',
            serviceType:'WMS'
            }
 */
    },
    c:undefined,
    z:undefined,
    _:{
        t:'FXX',
        l:{
            //                                          mandatory :
            'ORTHOIMAGERY.ORTHOPHOTOS'             :true,
            'GEOGRAPHICALGRIDSYSTEMS.MAPS'         :true,
            'CADASTRALPARCELS.PARCELS'             :true,
            //                                          optional  :
            'ELEVATION.SLOPES'                     :false,
            'HYDROGRAPHY.HYDROGRAPHY'              :false,
            'ADMINISTRATIVEUNITS.BOUNDARIES'       :false,
            'ELEVATION.LEVEL0'                     :false,
            'BUILDINGS.BUILDINGS'                  :false,
            'UTILITYANDGOVERNMENTALSERVICES.ALL'   :false,
            'TRANSPORTNETWORKS.RAILWAYS'           :false,
            'TRANSPORTNETWORKS.ROADS'              :false,
            'TRANSPORTNETWORKS.RUNWAYS'            :false
        },
        c:{lon:2.650547835, lat:46.2964269774},
        z:7
    }
};
var gGPLINKS= {
    t:{
        'adelie'    :'ATF',
        'amsterdam' :'ASP',
        'crozet'    :'CRZ',
        'futuna'    :'WLF',
        'guadeloupe':'GLP',
        'guyane'    :'GUF',
        'kerguelen' :'KER',
        'martinique':'MTQ',
        'mayotte'   :'MYT',
        'metropole' :'FXX',
        'monde'     :'WLD',
        'newcaled'  :'NCL',
        'polynesie' :'PYF',
        'reunion'   :'REU',
        'stbarth'   :'SBA',
        'stmartin'  :'SMA',
        'stpaul'    :'ASP',
        'stpierre'  :'SPM',
        'wallis'    :'WLF'
    },
    l:{
        'Admin'    :'ADMINISTRATIVEUNITS.BOUNDARIES',
        'Aerien'   :'TRANSPORTNETWORKS.RUNWAYS',
        'Alti'     :'ELEVATION.SLOPES',
        'Bati'     :'BUILDINGS.BUILDINGS',
        'Elec'     :'UTILITYANDGOVERNMENTALSERVICES.ALL',
        'Hydro'    :'HYDROGRAPHY.HYDROGRAPHY',
        'Lito'     :'ELEVATION.LEVEL0',
        'Parcelles':'CADASTRALPARCELS.PARCELS',
        'Photo'    :'ORTHOIMAGERY.ORTHOPHOTOS',
        'Resfer'   :'TRANSPORTNETWORKS.RAILWAYS',
        'Routes'   :'TRANSPORTNETWORKS.ROADS',
        'Scan'     :'GEOGRAPHICALGRIDSYSTEMS.MAPS'
    }
};

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

    // process territory first from url :
    var Args= OpenLayers.Util.getParameters();
    var nbArgs= 0;
    for (kArg in Args) if (Args.hasOwnProperty(kArg)) { nbArgs++; }
    if (nbArgs>0) {
        // territory:
        if (!Args.t) { Args.t= 'metropole'; }
        gPARAMS.t= gGPLINKS.t[Args.t];
        // language:
        if (!Args.lang) { Args.lang= OpenLayers.Lang.getCode(); }
    } else {
        Args.t= 'metropole';
        Args.lang= OpenLayers.Lang.getCode();
    }
    gPARAMS.t= gGPLINKS.t[Args.t] || Args.t;
    if (!gPARAMS.t) { gPARAMS.t= 'FXX'; }
    if (!OpenLayers.Lang[Args.lang]) { Args.lang= 'fr'; }

    // get default language
    var language= Args.lang;
    OpenLayers.Lang.setCode(language);
    // add translations
    translate();

    viewer= new Geoportal.Viewer.Standard(
        "viewerDiv",
        OpenLayers.Util.extend({
            territory:gPARAMS.t || gPARAMS._.t,
            proxy:'/geoportail/api/xmlproxy'+'?url=',
            // substitution of current default geoportal theme :
            loadTheme: function() {
                Geoportal.Util.setTheme('black');
                Geoportal.Util.loadCSS(Geoportal._getScriptLocation()+'theme/black/style.css','__GeoportalBlackCss__','');
                if (OpenLayers.Util.alphaHack()) {
                    Geoportal.Util.loadCSS(OpenLayers._getScriptLocation()+'theme/black/ie6-style.css','__IE6GeoportalBlackCss__','');
                }
                Geoportal.Util.loadCSS(Geoportal._getScriptLocation()+'theme/black/standard.css','__StandardBlackCss__','');
            }},
            window.gGEOPORTALRIGHTSMANAGEMENT===undefined? {apiKey:['6081235680374936929']}:gGEOPORTALRIGHTSMANAGEMENT
        )
    );
    if (!viewer) {
        OpenLayers.Console.error(OpenLayers.i18n('new.instance.failed'));
        return;
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
                (viewer.getMap().getProjection().getProjName()=='longlat'?
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
                    maximumResponses:100,
                    formatOptions: {
                    }
                }
            },
            geocodeOptions: {
                layerOptions: {
                    name: 'StreetAddress:OPENLS;Geocode',
                    maximumResponses:100,
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
            },
            reverseGeocodeOptions: {
                layerOptions: {
                    name: 'StreetAddress:OPENLS;ReverseGeocode',
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
            },
            /* (1) */
            cswOptions: {
            }
        }
    );
    viewer.getMap().addControl(searchbar);
    // add "Layer Toolbar" :
    var addLbar= new Geoportal.Control.LayerToolbar(
        {
            div: OpenLayers.Util.getElement(tbx.id+'_addlyr'),
            // Geoportal.Control.AddVectorLayer options :
            addVectorLayerOptions: {
                supportedClasses: [
                    'OpenLayers.Format.KML',
                    'Geoportal.Format.GPX',
                    'OpenLayers.Format.OSM',
                    'OpenLayers.Layer.GeoRSS',
                    'OpenLayers.Layer.WFS'
                ],
                // OpenLayers.Layer.Vector options :
                styleMapTemplates: {
                    "OpenLayers.Format.KML"         :
                        new OpenLayers.StyleMap({
                            "default"   : new OpenLayers.Style(OpenLayers.Util.applyDefaults({
                                            fillColor: "#99CCFF",
                                            strokeColor: "#99CCFF",
                                            strokeWidth: 2,
                                            pointRadius:  8},
                                            OpenLayers.Feature.Vector.style["default"])),
                            "select"    : new OpenLayers.Style(OpenLayers.Util.applyDefaults({
                                            fillColor: "#99CCFF",
                                            strokeColor: "#99CCFF",
                                            strokeWidth: 4,
                                            pointRadius: 12},
                                            OpenLayers.Feature.Vector.style["select"])),
                            "temporary" : new OpenLayers.Style(OpenLayers.Util.applyDefaults({
                                            fillColor: "#99CCFF",
                                            strokeColor: "#99CCFF"},
                                            OpenLayers.Feature.Vector.style["temporary"]))},
                            {extendDefault:false}),
                    "Geoportal.Format.GPX"          :
                        new OpenLayers.StyleMap({
                            "default"   : new OpenLayers.Style(OpenLayers.Util.applyDefaults({
                                            fillColor: "#99CCFF",
                                            strokeColor: "#99CCFF",
                                            strokeWidth: 2,
                                            pointRadius:  8},
                                            OpenLayers.Feature.Vector.style["default"])),
                            "select"    : new OpenLayers.Style(OpenLayers.Util.applyDefaults({
                                            fillColor: "#99CCFF",
                                            strokeColor: "#99CCFF",
                                            strokeWidth: 4,
                                            pointRadius: 12},
                                            OpenLayers.Feature.Vector.style["select"])),
                            "temporary" : new OpenLayers.Style(OpenLayers.Util.applyDefaults({
                                            fillColor: "#99CCFF",
                                            strokeColor: "#99CCFF"},
                                            OpenLayers.Feature.Vector.style["temporary"]))},
                            {extendDefault:false}),
                    "OpenLayers.Format.OSM"          :
                        new OpenLayers.StyleMap({
                            "default"   : new OpenLayers.Style(OpenLayers.Util.applyDefaults({
                                            fillColor: "#99CCFF",
                                            strokeColor: "#99CCFF",
                                            strokeWidth: 2,
                                            pointRadius:  8},
                                            OpenLayers.Feature.Vector.style["default"])),
                            "select"    : new OpenLayers.Style(OpenLayers.Util.applyDefaults({
                                            fillColor: "#99CCFF",
                                            strokeColor: "#99CCFF",
                                            strokeWidth: 4,
                                            pointRadius: 12},
                                            OpenLayers.Feature.Vector.style["select"])),
                            "temporary" : new OpenLayers.Style(OpenLayers.Util.applyDefaults({
                                            fillColor: "#99CCFF",
                                            strokeColor: "#99CCFF"},
                                            OpenLayers.Feature.Vector.style["temporary"]))},
                            {extendDefault:false}),
                    "OpenLayers.Layer.GeoRSS"        :
                        new OpenLayers.StyleMap(
                            new OpenLayers.Style(
                                OpenLayers.Util.applyDefaults({
                                    'graphic': true,
                                    'externalGraphic': Geoportal.Util.getImagesLocation()+"xy-target.gif",
                                    'graphicOpacity': 1.0,
                                    'graphicWidth': 25,
                                    'graphicHeight': 25,
                                    'graphicXOffset': -12.5,
                                    'graphicYOffset': -12.5
                                },OpenLayers.Feature.Vector.style["default"])))
                },
                layerVectorOptions: {
                }
            },
            addImageLayerOptions: { // Force Image Layer button when empty!
                layerImageOptions: {
                    singleTile:false
                }
            }
        }
    );
    viewer.getMap().addControl(addLbar);
    // add history :
    var nxtprvLbar= new OpenLayers.Control.NavigationHistory();
    viewer.getMap().addControl(nxtprvLbar);
    var pnp= new OpenLayers.Control.Panel({
        div: tbx.createControlAnchor(tbx.id+'_nxtprv','nhBar')
    });
    pnp.addControls([nxtprvLbar.previous, nxtprvLbar.next]);
    viewer.getMap().addControl(pnp);
    // activate the navigation :
    var nvc= viewer.getMap().getControlsByClass('Geoportal.Control.NavToolbar')[0];
    nvc.activateControl(nvc.getControlsByClass('OpenLayers.Control.Navigation')[0]);

    // add "Select Territory" :
    var ster= new Geoportal.Control.TerritorySelector({
        div:tbx.createControlAnchor(tbx.id+'_ster','gpControlTerritorySelector'),
        territory:gPARAMS.t,
        territoryToUrlParameter:function(t) {
            for (var tt in gGPLINKS.t) {
                if (t===gGPLINKS.t[tt]) {
                    return tt;
                }
            }
            return 'metropole';
        },
        autoactivate:true
    });
    viewer.getMap().addControl(ster);

    // fullScreen switch :
    OpenLayers.Event.observe(
        viewer.fullScDiv,
        'click',
        OpenLayers.Function.bindAsEventListener(
            function(e) {
                var openIt= this.target.style.display=='none'? true:false;
                var w= this.viewer.div.offsetWidth, h= 0;
                if (openIt) {
                    h= this.viewer.div.savedHeight;
                    this.target.style.display= '';
                    this.handle.className= 'gpHorizontalUpperToggle';
                } else {
                    this.viewer.div.savedHeight= this.viewer.div.offsetHeight;
                    h= this.viewer.div.savedHeight +
                       Geoportal.Util.getComputedStyle(this.target,'height',true);
                    this.target.style.display= 'none';
                    this.handle.className+= ' gpHorizontalUpperLowerToggle';
                }
                this.viewer.setSize(w,h);
                if (e!=null) {
                    OpenLayers.Event.stop(e);
                }
            },
            {
                handle:viewer.fullScDiv,
                target:OpenLayers.Util.getElement('gpHeader'),
                viewer:viewer
            }));
    // error messages control :
    var deCntrl= null;

    // update territory's default zoom:
    gPARAMS._.z= viewer.getMap().catalogue.getDefaultZoom(gPARAMS.t);
    // process other arguments from url :
    if (nbArgs>0) {
        // zoom :
        if (!Args.z) { Args.z= ''+gPARAMS._.z; }
        var z= parseInt(Args.z);
        if (z>=0 && z<=21) { gPARAMS.z= z; } else { gPARAMS.z= gPARAMS._.z; }
        if (gPARAMS.t=='WLD') {
            if (z>=5) { gPARAMS.z= 4; } else {}
        } else {
            if (z<=4) { gPARAMS.z= 5; }
        }
        var c= Args.c? Args.c : [];
        if (c.length==2) {
            gPARAMS.c= {
                lon: parseFloat(c[0]),
                lat: parseFloat(c[1])
            };
            var bb= OpenLayers.Bounds.fromArray(Geoportal.Catalogue.TERRITORIES[gPARAMS.t].geobbox);
            if (!bb.containsLonLat(gPARAMS.c)) {
                gPARAMS.c= undefined;
            }
        }
        if (gPARAMS.c==undefined) {
           if (gPARAMS.t) {
                gPARAMS.c= {
                    lon: Geoportal.Catalogue.TERRITORIES[gPARAMS.t].geocenter[0],
                    lat: Geoportal.Catalogue.TERRITORIES[gPARAMS.t].geocenter[1]
                }
            } else if (gPARAMS._.c) {
                gPARAMS.c= OpenLayers.Util.extend({}, gPARAMS._.c);
            }
        }
        if (Args.l) {
            var l= Args.l;
            if (!OpenLayers.Util.isArray(l)) {
                l= [l];
            }
            for (var i= 0, n= l.length; i<n; i++) {
                var lp= l[i].split('(');
                if (lp.length>0) {
                    var ln= gGPLINKS.l[lp[0]];
                    if (ln) {
                        var lprms= viewer.getMap().catalogue.getLayerParameters(gPARAMS.t,ln);
                        if (lprms) {
                            gPARAMS.l[ln]= { visibility: true };
                            if (lp.length>=2) {
                                var o= parseInt(lp[1]);
                                if (!isNaN(o)) {
                                    var mo= Math.abs(o) % 100;
                                    o= (mo==0? 100 : mo)/100.0;
                                    gPARAMS.l[ln].opacity= o;
                                } else {
                                    gPARAMS.l[ln].opacity= lprms.options.opacity;
                                }
                            } else {
                                gPARAMS.l[ln].opacity= lprms.options.opacity;
                            }
                        }
                    }
                }
            }
        }
    }

    // add layers : find geoportal layers, then add default if none :
    var gpLayers= [], gpLayersOpts= {};
    for (var lyrName in gPARAMS.l) {
        if (gPARAMS.l[lyrName].url===undefined &&
            (gPARAMS.l[lyrName].e===undefined ||
             gPARAMS.l[lyrName].e.i==false)) {
            var o= {};
            o[lyrName]= gPARAMS.l[lyrName];
            OpenLayers.Util.extend(gpLayersOpts,o);
            gpLayers.push(lyrName);
        }
    }
    if (gpLayers.length==0) {
        // no geoportal layers, add default ones :
        for (var lyrName in gPARAMS._.l) {
            if (gPARAMS._.l[lyrName]) {//mandatory
                var lprms= viewer.getMap().catalogue.getLayerParameters(gPARAMS.t,lyrName);
                if (lprms) {
                    var o= {};
                    o[lyrName]= {};
                    o[lyrName].opacity= lprms.options.opacity;
                    o[lyrName].visibility= lprms.options.visibility;
                    OpenLayers.Util.extend(gpLayersOpts,o);
                    gpLayers.push(lyrName);
                }
            }
        }
    }
    // process geoportal layers first :
    viewer.addGeoportalLayers(gpLayers,gpLayersOpts);
    // process external layers :
    for (var lyrName in gPARAMS.l) {
        if (gPARAMS.l[lyrName].e!==undefined) {
            // error messages control :
            if (deCntrl==null) {
                deCntrl= new Geoportal.Control.Floating(
                    window,{
                        id:'errorDiv',
                        headTitle:'errorPanel.title',
                        size:new OpenLayers.Size(400,200),
                        onClose:function(e){deCntrl.deactivate(); deCntrl.destroy(); deCntrl= null;}
                    });
                viewer.getMap().addControl(deCntrl);
            }
            // display error message :
            var e= gPARAMS.l[lyrName].e;
            var d= document.createElement('div');
            var t= document.createElement('span');
            t.innerHTML= '<b>'+lyrName+' :</b><br/>';
            d.appendChild(t);
            var ms= e.m;
            for (var i= 0, l= ms.length; i<l; i++) {
                var di= document.createElement('div');
                di.className= 'reportingError';
                if (ms[i].l) {
                    if (ms[i].l.match(/^warn/i)) {
                        di.className+= ' WarnLevel';
                    } else if (ms[i].l.match(/^error/i)) {
                        di.className+= ' ErrorLevel';
                    }
                }
                var m= '';
                if (ms[i].t) {
                    if (ms[i].t[language]) {
                        m= ms[i].t[language];
                    } else {
                        m= ms[i].t['fr'] || '';
                    }
                }
                var s= document.createElement('span');
                s.innerHTML= m.replace(/\n/g,"<br/>")+(i==l-1? '':'<br/>');
                di.appendChild(s);
                d.appendChild(di);
            }
            deCntrl.addContent(d);
            if (gPARAMS.l[lyrName].e.i===true) {
                continue;
            }
        }
        if (gPARAMS.l[lyrName].url===undefined) { continue; }
        if (lyrName.match(/^__\$\d+$/)) { continue; }
        var serviceType= gPARAMS.l[lyrName].serviceType || 'WMS';
        var srs= new OpenLayers.Projection(gPARAMS.l[lyrName].srs);
        var params= {};
        var options= {
            projection:srs,
            // maxExtent expressed in srs :
            maxExtent: (gPARAMS.l[lyrName].bounds || new OpenLayers.Bounds(-180.0,-90.0,180.0,90.0))
                            .transform(OpenLayers.Projection.CRS84,srs),
            minZoomLevel: gPARAMS.l[lyrName].zmin,
            maxZoomLevel: gPARAMS.l[lyrName].zmax,
            opacity: gPARAMS.l[lyrName].opacity || 0.5,
            units: srs.getUnits(),
            isBaseLayer: false,
            visibility: (gPARAMS.l[lyrName].visibility===undefined? true : gPARAMS.l[lyrName].visibility),
            description: gPARAMS.l[lyrName].description || null,
            metadataURL: gPARAMS.l[lyrName].metadataurl || null,
            dataURL: gPARAMS.l[lyrName].dataurl || null,
            originators:[{
                logo: gPARAMS.l[lyrName].pictureurl || gPARAMS.l[lyrName].nomlogo || 'unknownAuthority',
                pictureUrl: gPARAMS.l[lyrName].pictureurl || '/geoportail/api/js/2.0.3/theme/black/img/logo_unknownAuthority.gif',
                url: gPARAMS.l[lyrName].urllogo || 'javascript:void(0)'
            }]
        };
        switch (serviceType) {
        case "WFS":
            params.typename= lyrName;
            options.extractAttributes= true;
            break;
        case "KML":
            OpenLayers.Util.extend(params,options);
            options.formatOptions= {
                extractAttributes: true,
                extractStyles: true,
                maxSize: new OpenLayers.Size(340,300)
            };
            break;
        default   :
        case "WMS":
            params.layers= lyrName;
            params.format= gPARAMS.l[lyrName].format || 'image/jpg';
            params.transparent= gPARAMS.l[lyrName].transparency || false;
            options.singleTile= false;//FIXME: true when (see BRGM max width|height)?
            options.legends= gPARAMS.l[lyrName].legends || null;// [{style:,title:,href:,width:,height:}]
            break;
        }
        // add
        viewer.getMap().addLayer(
            serviceType, gPARAMS.l[lyrName].title || lyrName, gPARAMS.l[lyrName].url, params, options);
    }
    gPARAMS.c= gPARAMS.c || gPARAMS._.c || viewer.getMap().catalogue.getCenter(gPARAMS._.t);
    gPARAMS.z= gPARAMS.z || gPARAMS._.z;

    // TESTS :
    // close layers panel :
    //viewer.openLayersPanel(false);
    // close tools panel :
    //viewer.openToolsPanel(false);
    // hide informations panel :
    //viewer.setInformationPanelVisibility(false);

    viewer.getMap().setCenterAtLonLat(gPARAMS.c.lon,gPARAMS.c.lat,gPARAMS.z);
    // cache la patience - hide loading image
    viewer.div.style[OpenLayers.String.camelize('background-image')]= 'none';

    // add services :
    var services= [];
    for (var lyrName in gPARAMS.l) {
        if (lyrName.match(/^__\$\d+$/)) {
            var o= {
                'name':lyrName
            };
            o[lyrName]= gPARAMS.l[lyrName];
            services.push(o);
        }
    }
    if (services.length>0) {
        var avlCntrl= viewer.getMap().getControlsByClass('Geoportal.Control.AddVectorLayer')[0];
        avlCntrl.asyncSave= avlCntrl.asynchronousCapabilities;
        avlCntrl.asynchronousCapabilities= false;//wait for GetCapabilities
        var ailCntrl= viewer.getMap().getControlsByClass('Geoportal.Control.AddImageLayer')[0];
        ailCntrl.asyncSave= ailCntrl.asynchronousCapabilities;
        ailCntrl.asynchronousCapabilities= false;//wait for GetCapabilities
        var loadServices= function() {
            var cntrl= null;
            var panel= this.masterControl;
            var lyr= this.services[this.current];
            if (lyr) {
                var lyrName= lyr.name;
                switch(lyr[lyrName].serviceType) {
                case 'WMS':
                    cntrl= this.imgControl;
                    break;
                case 'WFS':
                    cntrl= this.vecControl;
                    break;
                default:
                    break;
                }
            }
            this.current++;
            if (this.current<=this.services.length) {
                var scope= OpenLayers.Util.extend({}, this);
                var callback= arguments.callee;//loadServices!
                var againCallback= function() {
                    setTimeout(
                        OpenLayers.Function.bindAsEventListener(
                            callback,
                            scope),
                        300);
                    this.events.un({"deactivate":arguments.callee});
                };
                if (cntrl==null) {
                    setTimeout(
                        OpenLayers.Function.bindAsEventListener(
                            callback,
                            scope),
                        300);
                } else {
                    panel.activateControl(cntrl);
                    cntrl.events.on({"deactivate":againCallback});
                    cntrl.htmlElements['clicklayerUrl'+cntrl.id].value= lyr[lyrName].url;
                    cntrl.htmlElements['clicklayerType'+cntrl.id].options[0].selected= true;
                    cntrl.htmlElements['clickadd'+cntrl.id].click();
                }
            } else {
                this.vecControl.asynchronousCapabilities= this.vecControl.asyncSave;
                this.imgControl.asynchronousCapabilities= this.imgControl.asyncSave;
            }
        };
        setTimeout(
            OpenLayers.Function.bindAsEventListener(
                loadServices,
                {
                    'services':services,
                    'current':0,
                    'masterControl': addLbar,
                    'vecControl':avlCntrl,
                    'imgControl':ailCntrl
                }),
            300);
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
    if (checkApiLoading('loadAPI();',['OpenLayers','Geoportal','Geoportal.Viewer','Geoportal.Viewer.Standard'])===false) {
        return;
    }

    // load API keys configuration, then load the interface
    // on charge la configuration de la clef API, puis on charge l'application
    Geoportal.GeoRMHandler.getConfig(['6081235680374936929'], null,null, {
        onContractsComplete: initMap
    });
}

// assign callback when "onload" event is fired
// assignation de la fonction à appeler lors de la levée de l'évènement
// "onload"
window.onload= loadAPI;
