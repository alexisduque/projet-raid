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
 * Function: addmarker
 * Create a marker with shadow and popup when clicking on the marker.
 *
 * Parameters:
 * mLon - {<Number>} Longitude of marker in decimal degrees
 * mLat - {<Number>} Latitude of maker in decimal degrees
 * width - {<Integer>} width of popup's.
 * height - {<Integer>} height of popup's.
 * html - {<String>} HTML code of the popup's content.
 * open - {Boolean} true if open popup on creation.
 */
function addmarker(mLon,mLat,width,height,html,open) {
    //marker layer - couche du marqueur
    var markers= new OpenLayers.Layer.Markers("__Mrkrs$$__");
    viewer.getMap().addLayer(markers);
    //maker building - construction de l'ombre du marqueur
    // first shadow, d'abord l'ombre
    var shadow_size= new OpenLayers.Size(42,28);
    var shadow_offset= new OpenLayers.Pixel(0, -(shadow_size.h));
    var shadow_icon= new OpenLayers.Icon('/geoportail/api/js/2.0.3/theme/geoportal/img/marker_shadow.png',shadow_size,shadow_offset);
    var shadow_position= (new OpenLayers.LonLat(mLon,mLat)).transform(OpenLayers.Projection.CRS84, viewer.getMap().getProjection());
    var shadow_prn= new OpenLayers.Marker(shadow_position,shadow_icon);
    markers.addMarker(shadow_prn);

    // change popup rendering - changement de la présentation des popups
    OpenLayers.Feature.prototype.popupClass= OpenLayers.Popup.FramedCloud;

    // second marker itself - constructeur du marqueur lui-même
    var size= new OpenLayers.Size(20,34);
    var offset= new OpenLayers.Pixel(-(size.w/2), -(size.h));
    var icon= new OpenLayers.Icon('http://maps.gstatic.com/intl/fr_ALL/mapfiles/marker.png',size,offset);
    var position= shadow_position.clone();
    var pnr= new OpenLayers.Marker(position,icon);
    markers.addMarker(pnr);

    // manage click on marker - gestion du clic sur le marqueur
    pnr.events.register('mousedown', pnr, function(evt) {
        if (this.feature==null) {
            this.feature= new OpenLayers.Feature(markers,this.lonlat.clone(), {
                popupSize: new OpenLayers.Size(width,height),
                popupContentHTML: "<div style='font-size:12px;'>"+
                                    html+
                                  "</div>"
            });
            this.feature.createPopup(true);
            this.feature.popup.setBackgroundColor("white");
            this.feature.popup.setOpacity(0.7);
            markers.map.addPopup(this.feature.popup);
        } else {
            this.feature.popup.toggle();
        }
        OpenLayers.Event.stop(evt);
    });
    // disable if no popup at loading - à retirer si aucune popup au chargement
    if (open===true) {
        pnr.events.triggerEvent('mousedown');
    }
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

    // ===========================================================================================================
    // Configuration : change those values to generate a new map !
    // Longitude/Latitude marker - marqueur
    var markerLon=  2.424274;
    var markerLat= 48.845885;
    // Popup parameters - paramètres de la popup
    var popupW= 250;
    var popupH=  65;
    var popupContent= "<span style=\"font-weight:bold;font-size:14px\">Institut National de l'Information Géographique et Forestière</span><br/>"+
                      "73 avenue de Paris<br/>"+
                      "94165 SAINT-MANDÉ<br/>"+
                      "Tél : +33 1 43 98 80 00";
    // Longitude/Latitude map - carte
    var cenLon=  2.420260;
    var cenLat= 48.846024;
    // Width/Height map - Largeur/Hauteur de la carte
    var mapW= 300;
    var mapH= 300;
    // Zooms
    var mapZ= 12;
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
    if (nbArgs>0) {
        // if full parameter set, then enlarge map - si le paramètre full est
        // défini, alors carte en plein navigateur
        if (Args.full==='1') {
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
            // zoom and position (map is centered on the marker) - zoom et
            // centrage (carte centrée sur le marqueur)
            Args.zoom= fullMapZ;
            Args.lon= markerLon;
            Args.lat= markerLat;
        }
    }
    if (typeof(Args.zoom)!='number') {
        xTdom.style.width= mapW+'px';
        vWdom.style.width= mapW+'px';
        vWdom.style.height= mapH+'px';
        xEdom.style.width= mapW+'px';
        fOdom.style.width= mapW+'px';
        xCdom.style.width= mapW+'px';
        // no zoom, no full ! pas de zoom, pas plein navigateur !
        Args.zoom= mapZ;
        Args.lon= cenLon;
        Args.lat= cenLat;
    }
    // create map - création de la carte
    viewer= new Geoportal.Viewer.Default(           // Default viewer (one could use Geoportal.Viewer.Standard)
            "viewerDiv",                            // div id where to display dataset
            OpenLayers.Util.extend({                // viewer parameters :
                mode:'mini',
                territory:'FXX',                    // or other territory
                displayProjection:'CRS:84',
                nameInstance:'viewer'},
                gGEOPORTALRIGHTSMANAGEMENT          // API configuration with regard to the API key
            )
        );
    if (!viewer) {
        alert(OpenLayers.i18n('new.instance.failed'));
        return;
    }
    viewer.addGeoportalLayers(
        ['ORTHOIMAGERY.ORTHOPHOTOS', 'GEOGRAPHICALGRIDSYSTEMS.MAPS', 'TRANSPORTNETWORKS.ROADS'],
        {
            'TRANSPORTNETWORKS.ROADS'     : {opacity:0.40},
            'GEOGRAPHICALGRIDSYSTEMS.MAPS': {opacity:0.40},
            'ORTHOIMAGERY.ORTHOPHOTOS'    : {},
            global:{
                visibility:true
            }
        });
    // center map - centrage de la carte
    viewer.getMap().setCenterAtLonLat(Args.lon,Args.lat,Args.zoom);
    // cache la patience - hide loading image
    viewer.div.style[OpenLayers.String.camelize('background-image')]= 'none';

    // add KML - ajout du KML
    viewer.getMap().addLayer(
        "KML",
        {// i18n layer name
            'de':"RATP - U-Bahnlinie 1",
            'en':"RATP - Underground metro line 1",
            'es':"RATP - Línea 1 del metro",
            'fr':"RATP - Métro ligne 1",
            'it':"RATP - Linea 1 della metropolitana"
        },
        "../data/ratp-metro-l1-part.kml",//local url - no proxy needed
        {
            visibility:true,//display it
/* no agreement to display RATP's logo :
            originators:[
                {
                    pictureUrl:'./img/logo-ratp.gif',
                    url:'http://www.ratp.fr/'
                }
            ],
 */
            eventListeners:{
                "loadend":function() {//when KML is loaded, load next !
                    viewer.getMap().addLayer(
                        "KML",
                        {// i18n layer name
                            'de':"RATP - Bahnlinie A",
                            'en':"RATP - Railway line A",
                            'es':"RATP - Tren de la línea A",
                            'fr':"RATP - RER ligne A",
                            'it':"RATP - Linea ferroviaria A"
                        },
                        "../data/ratp-rer-a-part.kml",//local url - no proxy needed
                        {
                            visibility:true,//display it
/* no agreement to display RATP's logo :
                            originators:[
                                {
                                    pictureUrl:'./img/logo-ratp.gif',
                                    url:'http://www.ratp.fr/'
                                }
                            ],
 */
                            eventListeners:{
                                "loadend":function() {//when KML is loaded, load marker
                                    // add marker - ajout du marqueur
                                    addmarker(markerLon,markerLat,popupW,popupH,popupContent,false);
                                }
                            }
                        },{
                            handlersOptions:{
                                feature:{
                                    stopDown:false//allow pan map when drag in feature
                                }
                            },
                            preventDefaultBehavior:{//block popup on this KML
                                preFeatureInsert:true,
                                onFeatureInsert:true
                            }
                        }
                    )
                }
            }
        },{
            handlersOptions:{
                feature:{
                    stopDown:false//allow pan map when drag in feature
                }
            },
            preventDefaultBehavior:{//block popup on this KML
                preFeatureInsert:true,
                onFeatureInsert:true
            }
        }
    );
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
