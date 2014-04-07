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
 * Property: geo
 * {<OpenLayers.Control.Geolocate>} the geolocation control.
 */
var geo= null;

/**
 * Function loadInterface
 * Load the map and center it at the given coordinates.
 * If both altitude et IP address at know then add a control for handling hover for displaying these information.
 *
 * Parameters:
 * ll - {<OpenLayers.LonLat>} the geographical coordinates
 * altitude - {Number} the height
 * address - {String} the Street Address or Internet Protocol Address of the client
 */
function loadInterface(ll,altitude,address) {
    // find territory :
    for (var t in Geoportal.Catalogue.TERRITORIES) if (Geoportal.Catalogue.TERRITORIES.hasOwnProperty(t)) {
        var ter= Geoportal.Catalogue.TERRITORIES[t];
        if (!ter.geobbox) { continue; }
        var b= OpenLayers.Bounds.fromArray(ter.geobbox);
        if (!b.containsLonLat(ll)) { continue; }
        var d= OpenLayers.Util.getElement("viewerDiv");
        d.style.backgroundImage= 'none';
        d.style.backgroundPosition= '';
        d.style.backgroundRepeat= '';
        //options for creating viewer:
        var options= {
            mode:'mini',
            territory:t
        };

        // viewer creation of type <Geoportal.Viewer>
        // création du visualiseur du type <Geoportal.Viewer>
        //                                   HTML div id, options
        viewer= new Geoportal.Viewer.Default('viewerDiv', OpenLayers.Util.extend(
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

        viewer.addGeoportalLayers([
            'ORTHOIMAGERY.ORTHOPHOTOS',
            'GEOGRAPHICALGRIDSYSTEMS.MAPS'
        ],{});
        ll= ll.transform(OpenLayers.Projection.CRS84, viewer.getMap().getProjection());
        var z= 9;
        viewer.getMap().setCenter(ll,z);
        var adrl= new OpenLayers.Layer.Vector(
            '_IP_', {
                displayInLayerSwitcher:false,
                projection: viewer.getMap().getProjection().clone(),
                visibility:true,
                styleMap:new OpenLayers.StyleMap(
                    new OpenLayers.Style({
                        externalGraphic:'/geoportail/api/js/2.0.3/theme/geoportal/img/xy-target.png',
                        graphicWidth:30,
                        graphicHeight:30})),
                        preFeatureInsert:Geoportal.Popup.setPointerCursorForFeature});
        viewer.getMap().addLayer(adrl);
        var pt= new OpenLayers.Geometry.Point(ll.lon,ll.lat);
        address= address || '-';
        altitude= altitude!=undefined? altitude : -0.0;
        var adrf= new OpenLayers.Feature.Vector(pt, {
            'location':address,
            'altitude':altitude
        });
        adrf.state= OpenLayers.State.INSERT;
        adrl.addFeatures([adrf]);
        var adrs= new OpenLayers.Control.SelectFeature(adrl, viewer.getMap().getPopupDefaults('WFS'));
        viewer.getMap().addControl(adrs);
        adrs.activate();
        if (geo) {
            geo.deactivate();
            geo.destroy();
            geo= null;
        }
        break;
    }
    // cache la patience - hide loading image
    viewer.div.style[OpenLayers.String.camelize('background-image')]= 'none';
}

/**
 * Function: findHeight
 * Retreive altitude, if not already found through Geolocation API.
 * Once done, display the map centered on the found location.
 * Use http://ws.geonames.org/astergdemJSON?lat=latitude&lng=longitude.
 * (code)
 * {
 *   "astergdem":192,
 *   "lng":10.2,
 *   "lat":50.01
 * }
 * (end)
 *
 * Parameters:
 * ctx - {Object} holds ip, lon, lat properties
 */
function findHeight(ctx) {
    var ops= new OpenLayers.Protocol.Script({
        url:'http://api.geonames.org/astergdemJSON',
        params:{
            'lng':ctx.lon,
            'lat':ctx.lat,
            'username':'demo'
        },
        format:new OpenLayers.Format(),//dummy format
        callback:function(r) {
            var z= -0.0;
            if (r.code===OpenLayers.Protocol.Response.SUCCESS) {
                z= r.features.astergdem;
            }
            loadInterface(new OpenLayers.LonLat(ctx.lon,ctx.lat),z,ctx.address);
        },
        parseFeatures:function(data) {
            return data;
        }
    });
    ops.read();
}

/**
 * Function: findIPInfoDBLocation
 * Retreive longitude, latitude with the service provided by ipinfodb.
 * Once done, retreive altitude and display the map centered on the found location.
 * In the later case, http://ipinfodb.com/ip_location_api_json.php returns
 * a JSON result on the searched IP :
 *
 * (code)
 * {
 *  "Ip" : "a.b.c.d",
 *  "Status" : "OK",
 *  "CountryCode" : "...",
 *  "CountryName" : "...
 *  "RegionCode" : "nn",
 *  "RegionName" : "...",
 *  "City" : "...",
 *  "ZipPostalCode" : "nnnnn",
 *  "Latitude" : "nn.nn",
 *  "Longitude" : "nn.nn"
 * }
 * (end)
 */
function findIPInfoDBLocation() {
    var ops= new OpenLayers.Protocol.Script({
        url:'http://api.ipinfodb.com/v2/ip_query.php',
        params:{
            'key':'7487f05eb0ed1a6c1b81677ab603faf71e7587ec9c88b8bca0d21d7ae5faa114',
            'output':'json'
        },
        format:new OpenLayers.Format(),//dummy format
        callback:function(r) {
            var adr= '-';
            var lon= 0.0;
            var lat= 0.0;
            if (r.code===OpenLayers.Protocol.Response.SUCCESS) {
                adr= r.features.City+', '+r.features.CountryName+' ('+r.features.Ip+')';
                lon= parseFloat(r.features.Longitude);
                lat= parseFloat(r.features.Latitude); 
            }
            findHeight({
                'address':adr,
                'lon':lon,
                'lat':lat
            });
        },
        parseFeatures:function(data) {
            return data;
        }
    });
    ops.read();
}

/**
 * Function: findLocation
 * Retreive longitude, latitude with the Geolocation API or the service provided by
 * ipinfodb. Once done, retreive altitude and display the map centered on the found location.
 * In the later case, http://ipinfodb.com/ip_query.php returns an JSON answer that contains the searched IP.
 */
function findLocation() {
    geo= new OpenLayers.Control.Geolocate({
        bind: false,
        eventListeners:{
            "locationupdated":function(p) {
                loadInterface(
                    new OpenLayers.LonLat(p.position.coords.longitude, p.position.coords.latitude),
                    p.position.coords.altitude,
                    p.position.address?
                        p.position.address.city+', '+p.position.address.country
                    :   ''
                );
            },
            "locationfailed" :function(e) {
                findIPInfoDBLocation();
            },
            "locationuncapable":findIPInfoDBLocation // neither Chrome, nor Safari, Opera, Firefox 3.5+ :
        },
        geolocationOptions:{
            enableHighAccuracy: true,
            maximumAge: 0,
            timeout: 10000
        }
    });
    geo.activate();
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

    // find location and altitude :
    findLocation();
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
