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

    // add translations
    translate();

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
        // utile uniquement pour charger des resources externes
        //proxy:'/geoportail/api/xmlproxy'+'?url='
    };

    // viewer creation of type <Geoportal.Viewer>
    // création du visualiseur du type <Geoportal.Viewer>
    //                                   HTML div id, options
    viewer= new Geoportal.Viewer.Simple('viewerDiv', OpenLayers.Util.extend(
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

    //Loading of data layers
    //Chargement des couches de données
    viewer.addGeoportalLayers([
        'ORTHOIMAGERY.ORTHOPHOTOS'
    ], {});

    viewer.getMap().setCenterAtLonLat(0.00, 0.00, 1);

    //Adding a Vector layer: each feature will hold a well known graphic.
    //Ajout d'une couche vectorielle : chaque objet portera un symbole
    //pré-défini.
    var gs= [];
    for (var g in OpenLayers.Renderer.symbol) {
        gs.push(g);
    }
    var n= gs.length;
    var fs= new Array(n);
    var l= 0, c= 0, d= 100000.0;
    for (var i= 0; i<n; i++) {
        fs[i]= new OpenLayers.Feature.Vector(new OpenLayers.Geometry.Point(d*c, -d*l), { type: gs[i] });
        if (c++ > 12) { c= 0; l++; }
    }

    //Create a style map: the graphicName property is evaluated against the
    //type attribute
    //Créé une symbolisation cartographique: la propriété graphicName est
    //évaluée au travers de l'attribut type
    var styles= new OpenLayers.StyleMap({
        "default": new OpenLayers.Style({
            graphicName:"${type}",
            fillColor:"lime",
            fillOpacity:"${getOpacity}",
            strokeColor:"lime",
            strokeWidth:"${getWidth}",
            pointRadius:10
        }, {
            context:{   // Stroke or not stroke
                getWidth: function(f) {
                    var s= f.attributes.type;
                    return (s.charAt(0)=='_' && s.charAt(s.length-1)=='_'? 0 : 2);
                },
                // Opacity
                getOpacity: function(f) {
                    var s= f.attributes.type;
                    return (s.charAt(0)=='_' && s.charAt(s.length-1)=='_' ? 1 : 0.7);
                }
            }
        }),
        "select": new OpenLayers.Style({
            graphicName:"${type}",
            fillColor:"fuchsia",
            fillOpacity:1.0,
            strokeColor:"fuchsia",
            strokeWidth:"${getWidth}",
            label:"${type}",
            labelXOffset:0,
            labelYOffset:50,
            labelBackgroundColor:"black",
            fontColor:"yellow",
            pointRadius:20
        }, {
            context:{   // Stroke or not stroke
                getWidth: function(f) {
                    var s= f.attributes.type;
                    return (s.charAt(0)=='_' && s.charAt(s.length-1)=='_'? 0 : 2);
                }
            }
        })
    });

    //Create new layer
    //Création de la couche vectorielle
    var symbols= new OpenLayers.Layer.Vector("Symbols", {
        styleMap:styles,
        opacity:1.0,
        visibility:true
    });
    symbols.addFeatures(fs);
    viewer.getMap().addLayer(symbols);

    //Create a hover selector to display symbol's name
    //Création d'un sélecteur par survol pour afficher le nom du symbole
    var hoverCtrl= new OpenLayers.Control.SelectFeature(symbols, {
        autoActivate: true,
        hover: true
    });
    viewer.getMap().addControl(hoverCtrl);

    viewer.getMap().zoomToExtent(symbols.getDataExtent(), true);

    // cache la patience - hide loading image
    viewer.div.style[OpenLayers.String.camelize('background-image')]= 'none';
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
    if (checkApiLoading('loadAPI();',['OpenLayers','Geoportal','Geoportal.Viewer','Geoportal.Viewer.Simple'])===false) {
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
