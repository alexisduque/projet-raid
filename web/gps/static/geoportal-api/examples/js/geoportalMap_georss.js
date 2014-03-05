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
 * Method: _creat4RIPART
 * Create function for GeoRSS based features.
 *      the calling context is the feature.
 *
 * Returns:
 * {<Geoportal.Popup.Anchored>} - the popup.
 */
function _creat4RIPART() {
    var opts= OpenLayers.Util.extend({},this.layer.formatOptions);
    OpenLayers.Util.applyDefaults(
        opts,{
            size:this.layer.map.getSize(),
            closeBox:true,
            onPopupClose:Geoportal.Popup.onPopupClose,
            backgroundColor:'#ffffff',
            opacity:0.75
        });
    var popup= new Geoportal.Popup.Anchored(
        "chicken",
        this.geometry.getBounds().getCenterLonLat(),
        //taille devra s'adapter au contenu
        opts.size,
        "<div class='gpPopupHead gpGeoRSS'>" +
            (this.attributes.link?
                "<a class='gpLink' href='"+this.attributes.link+"' target='_blank'>"
            :   "") +
            (this.attributes.title || "?") +
            (this.attributes.link?
                "</a>"
            :   "") +
        "</div>" +
        "<div class='gpPopupBody gpGeoRSS'>" +
            (this.attributes.description || "") +
            (this.attributes.pubDate && this.attributes.author?
                "<div class='gpGeoRSSOriginator'>" +
                    OpenLayers.i18n("creationDate") +
                    this.attributes.date + '<br/>' +
                    OpenLayers.i18n("lastUpdateDate") +
                    this.attributes.pubDate +
                    OpenLayers.i18n("by") +
                    this.attributes.author +
                "</div>"
            :   "") +
        "</div>",
        null,
        opts.closeBox,
        opts.backgroundColor,
        opts.opacity,
        opts.onPopupClose,
        this
    );
    popup= Geoportal.Popup.completePopup(popup,this.layer.formatOptions);
    this.popup= popup;
    return this.popup;
}

/**
 * APIFunction: createPopUpForRIPART
 * Create function for GeoRSS based feature and give a style to the popup.
 * Used ofr OpenLayers.Format.GML on "featureadded" event through
 * <OpenLayers.Layer.Vector.onFeatureInsert>() callback.
 *
 * Parameters:
 * feature - {<OpenLayers.Feature.Vector>}
 */
function createPopUpForRIPART(feature) {
    feature.createPopup= OpenLayers.Function.bind(_creat4RIPART,feature);
}

/**
 * Function: initMap
 * Load the application. Called when all information have been loaded by
 * <loadAPI>().
 */
function initMap() {
    //The api is loaded at this step
    //L'api est chargée à cette étape

    // overloads :

    /**
     * APIProperty: popupClass
     * {<OpenLayers.Class>} The class which will be used to instantiate
     *     a new Popup. Default is <OpenLayers.Popup.AnchoredBubble>.
     *     Set to <OpenLayers.Popup.FramedCloud>.
     */
    OpenLayers.Feature.prototype.popupClass= OpenLayers.Popup.FramedCloud;

    /**
     * Method: parseData
     * Parse the data returned from the Events call.
     * IGNF: addition of pubDate and author informations.
     *
     * Parameters:
     * ajaxRequest - {<OpenLayers.Request.XMLHttpRequest>}
     */
    OpenLayers.Layer.GeoRSS.prototype.parseData= function(ajaxRequest) {
        var doc = ajaxRequest.responseXML;
        if (!doc || !doc.documentElement) {
            doc = OpenLayers.Format.XML.prototype.read(ajaxRequest.responseText);
        }

        if (this.useFeedTitle) {
            var name = null;
            try {
                name = doc.getElementsByTagNameNS('*', 'title')[0].firstChild.nodeValue;
            } catch (e) {
                name = doc.getElementsByTagName('title')[0].firstChild.nodeValue;
            }
            if (name) {
                this.setName(name);
            }
        }

        var options = {};

        OpenLayers.Util.extend(options, this.formatOptions);
        options.internalProjection = this.map.getProjection();

        var format = new OpenLayers.Format.GeoRSS(options);
        var features = format.read(doc);

        for (var i=0, len=features.length; i<len; i++) {
            var data = {};
            var feature = features[i];

            // we don't support features with no geometry in the GeoRSS
            // layer at this time.
            if (!feature.geometry) {
                continue;
            }

            var title = feature.attributes.title ?
                 feature.attributes.title : OpenLayers.i18n('untitled');

            var description = feature.attributes.description ?
                 feature.attributes.description : OpenLayers.i18n("no.description");

            var link = feature.attributes.link ? feature.attributes.link : "";

            var location = feature.geometry.getBounds().getCenterLonLat();
            // IGNF: FIXME check if location already exists to prevent markers superposition ?

            data.icon = this.icon == null ?
                OpenLayers.Marker.defaultIcon() : this.icon.clone();

            data.popupSize = this.popupSize ?
                this.popupSize.clone() : null;

            if (title || description) {
                // we have supplemental data, store them.
                data.title = title;
                data.description = description;

                var contentHTML = '<div>';
                contentHTML += '<div class="olLayerGeoRSSTitle">';
                if (link) {
                    contentHTML += '<a class="link" href="'+link+'" target="_blank">';
                }
                contentHTML += title;
                if (link) {
                    contentHTML += '</a>';
                }
                contentHTML += '</div>';
                contentHTML += '<div class="olLayerGeoRSSDescription">';
                contentHTML += description;
                contentHTML += '</div>';
                //IGNF:
                if (feature.attributes.pubDate && feature.attributes.author) {
                    contentHTML += '<div class="olLayerGeoRSSOriginator">';
                    contentHTML += OpenLayers.i18n("lastUpdateDate") + feature.attributes.pubDate + OpenLayers.i18n("by") + feature.attributes.author;
                    contentHTML += '</div>';
                }
                contentHTML += '</div>';
                data['popupContentHTML'] = contentHTML;
            }
            var feature = new OpenLayers.Feature(this, location, data);
            this.features.push(feature);
            var marker = feature.createMarker();
            marker.events.register('click', feature, this.markerClick);
            this.addMarker(marker);
        }
        this.events.triggerEvent("loadend");
    };

    /**
     * Method: markerClick
     * IGNF: pass closeBox flag.
     *
     * Parameters:
     * evt - {Event}
     */
    OpenLayers.Layer.GeoRSS.prototype.markerClick= function(evt) {
        var sameMarkerClicked = (this == this.layer.selectedFeature);
        this.layer.selectedFeature = (!sameMarkerClicked) ? this : null;
        for(var i=0, len=this.layer.map.popups.length; i<len; i++) {
            this.layer.map.removePopup(this.layer.map.popups[i]);
        }
        if (!sameMarkerClicked) {
            var popup = this.createPopup(true);// closeBox set to true
            popup.autoSize= false;//bug on popup size if true ?!
            this.layer.map.addPopup(popup);
        }
        OpenLayers.Event.stop(evt);
    };

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
        'GEOGRAPHICALGRIDSYSTEMS.MAPS'],
        {});

    viewer.getMap().setCenter(viewer.viewerOptions.defaultCenter,viewer.viewerOptions.defaultZoom);
    // cache la patience - hide loading image
    viewer.div.style[OpenLayers.String.camelize('background-image')]= 'none';

    //Ajout d'un fil GeoRSS : RIPART
    var ripart= viewer.getMap().addLayer("GeoRSS",
                "RIPART",
                "http://ripart.ign.fr/spip.php?page=georemrss",
                {
                    visibility:true,
                    originators:[{
                        logo:'ign'
                    }],
                    styleMap: new OpenLayers.StyleMap(
                        new OpenLayers.Style(
                            OpenLayers.Util.applyDefaults({
                                'graphic': true,
                                'externalGraphic': "${img}",
                                'graphicOpacity': 1.00,
                                'graphicWidth': 18,
                                'graphicHeight': 18,
                                'graphicXOffset': -9,
                                'graphicYOffset': -9
                            },OpenLayers.Feature.Vector.style["default"])
                        )),
                    onFeatureInsert: createPopUpForRIPART
                },
                {
                    formatOptions: {
                        createFeatureFromItem: function(item) {
                            var feature = OpenLayers.Format.GeoRSS.prototype.createFeatureFromItem.apply(this, arguments);
                            feature.attributes.date = this.getChildValue(item, "*", "date");;
                            feature.attributes.img = this.getChildValue(item, "*", "url");
                            return feature;
                        }
                    }
                });

    // Ajout d'un fil GeoRSS : tremblements de terre :
    var earthquakes= new OpenLayers.Layer.GeoRSS(
        "earthquakes.name",
        // 302 (Moved Temporarily), 301 (Moved Permanently) :
        //"http://earthquake.usgs.gov/recenteqsww/catalogs/eqs7day-M5.xml",
        "http://earthquake.usgs.gov/earthquakes/catalogs/eqs7day-M5.xml",
        {
            useFeedTitle:false,// empêche le renommage du fil RSS!
            projection: OpenLayers.Projection.CRS84,
            visibility:false,
            view:{
                drop:true,
                zoomToExtent:true
            },
            popupSize: new OpenLayers.Size(360,130),
            icon: new OpenLayers.Icon("http://maps.gstatic.com/intl/fr_fr/mapfiles/ms/icons/blue-dot.png", new OpenLayers.Size(32,32)),
            eventListeners: {
                "loadend" : function() {
                    ripart.setVisibility(false);
                    this.map.zoomTo(0);
                    this.map.zoomToExtent(this.getDataExtent());
                }
            }
        });
    viewer.getMap().addLayer(earthquakes);
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
