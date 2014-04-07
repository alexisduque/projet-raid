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
 * Function: hideGeoportalView
 * Make the cartographic view invisible.
 */
function hideGeoportalView() {
    var gppanel= viewer.getVariable('gppanel');
    gppanel.style.visibility= 'hidden';
    gppanel.style.position= 'absolute';
    gppanel.style.top= '-9999px';
    gppanel.style.left= '-9999px';
    viewer.getMap().setCenter(viewer.viewerOptions.defaultCenter,viewer.viewerOptions.defaultZoom);
}

/**
 * Function: showGeoportalView
 * Make the cartographic view visible.
 */
function showGeoportalView() {
    var gppanel= viewer.getVariable('gppanel');
    gppanel.style.position= 'relative';
    gppanel.style.top= '0px';
    gppanel.style.left= '0px';
    //FIXME: trouver le BUG sur forge
    document.getElementById('viewerDiv_OlMap').style.width='694px';
    gppanel.style.visibility= 'visible';
}

/**
 * Function: searchAddress
 * Launch search and display addresses. Toggle view.
 *
 * Returns:
 * {Boolean} always false to disable default behavior of browser.
 */
function searchAddress() {
    var geocoder= viewer.getVariable('geocoder');
    if (geocoder.onSearchClick()) {
        showGeoportalView();
    } else {
        hideGeoportalView();
    }
    return false;
}

/**
 * Function: initMap
 * Load the application. Called when all information have been loaded by
 * <loadAPI>().
 */
function initMap() {
    //The api is loaded at this step
    //L'api est chargée à cette étape

    /**
     * Class: Geoportal.Control.LocationUtilityService.Geocode.FormOut
     * Implements a geocoder using form's input fields.
     *
     * Inherits from:
     * - <Geoportal.Control.LocationUtilityService.Geocode>
     */
    Geoportal.Control.LocationUtilityService.Geocode.FormOut= OpenLayers.Class( Geoportal.Control.LocationUtilityService.Geocode, {

        /**
         * APIProperty: addressElement
         * {DOMElement} the form input that contains the address.
         */
        addressElement: null,

        /**
         * APIProperty: lonElement
         * {DOMElement} the form input that will contain the address'
         * longitude.
         */
        lonElement: null,

        /**
         * APIProperty: latElement
         * {DOMElement} the form input that will contain the address'
         * latitude.
         */
        latElement: null,

        /**
         * APIProperty: messageElement
         * {DOMElement} the div that will contain the messages of the
         * geocoder.
         */
        messageElement: null,

        /**
         * APIProperty: resultsElement
         * {DOMElement} the div that will contain the results of the geocoder.
         */
        resultsElement: null,

        /**
         * APIProperty: submitElement
         * {DOMElement} the DOM element that will contain the submit action.
         */
        submitElement: null,

        /**
         * Constructor: Geoportal.Control.LocationUtilityService
         * Build a button for searching an OpenLS Location Utility service.
         *
         * Parameters:
         * layer - {<Geoportal.Layer.OpenLS.Core.LocationUtilityService>}
         * options - {Object} options to build this control.
         *      Expected options are :
         *      * addressElement - {String | DOMElement}
         *      * lonElement - {String | DOMElement}
         *      * latElement - {String | DOMElement}
         *      * submitElement - {String | DOMElement}
         *      * resultsElement - {String | DOMElement}
         *      * messageElement - {String | DOMElement}
         */
        initialize: function(layer, options) {
            Geoportal.Control.LocationUtilityService.Geocode.prototype.initialize.apply(this, arguments);
            if (typeof(this.addressElement)=='string') {
                this.addressElement= OpenLayers.Util.getElement(this.addressElement);
            }
            if (typeof(this.lonElement)=='string') {
                this.lonElement= OpenLayers.Util.getElement(this.lonElement);
            }
            if (typeof(this.latElement)=='string') {
                this.latElement= OpenLayers.Util.getElement(this.latElement);
            }
            if (typeof(this.submitElement)=='string') {
                this.submitElement= OpenLayers.Util.getElement(this.submitElement);
            }
            if (typeof(this.resultsElement)=='string') {
                this.resultsElement= OpenLayers.Util.getElement(this.resultsElement);
            }
            if (typeof(this.messageElement)=='string') {
                this.messageElement= OpenLayers.Util.getElement(this.messageElement);
            }
        },

        /**
         * APIMethod: destroy
         * Clean the control.
         */
        destroy: function() {
            this.resultsElement= null;
            this.messageElement= null;
            this.addressElement= null;
            Geoportal.Control.LocationUtilityService.Geocode.prototype.destroy.apply(this, arguments);
        },

        /**
         * APIMethod: activate
         * Prevents parent's class activation process.
         */
        activate: function() {
            if (!Geoportal.Control.Form.prototype.activate.apply(this,arguments)) {
                return false;
            }
            if (!this.layer.map) {
                this.map.addLayer(this.layer);
            }
            Geoportal.Control.Form.focusOn(this.addressElement);
            this.layer.selectCntrl.deactivate();
            this.layer.destroyFeatures();
            return true;
        },

        /**
         * APIMethod: setMap
         * Register events and set the map.
         *
         * Parameters:
         * map - {<OpenLayers.Map>}
         */
        setMap: function(map) {
            Geoportal.Control.LocationUtilityService.Geocode.prototype.setMap.apply(this, arguments);
            this.addressElement.kbControl= this.map.getControlsByClass(OpenLayers.Control.KeyboardDefaults.prototype.CLASS_NAME)[0];
            this.addressElement.value= '';
            this.addressElement.onchange= OpenLayers.Function.bind(this.cleanLonLat,this);
            this.addressElement.onfocus= OpenLayers.Function.bind(Geoportal.Control.Form.focusOn, window, this.addressElement);
            this.addressElement.onblur= OpenLayers.Function.bind(Geoportal.Control.Form.focusOff, window, this.addressElement);
            this.resultsElement.innerHTML= '';//clean up
            this.resultsElement.style.display= '';
            this.messageElement.innerHTML= '';//clean up
            this.messageElement.style.display= 'none';
            this.submitElement.onclick= OpenLayers.Function.bind(searchAddress, window);
        },

        /**
         * Method: onSearchClick
         * Search button has been hit, process the Location Utility Service query.
         *
         * Parameters:
         * element - {<DOMElement>} the element receiving the event.
         * evt - {Event} the fired event.
         *
         * Returns:
         * {Boolean} false when nothing to do, true when request has been
         * issued.
         */
        onSearchClick: function(element,evt) {
            if (evt || window.event) OpenLayers.Event.stop(evt? evt : window.event);
            this.resultsElement.innerHTML= '';//clean up
            this.resultsElement.style.display= 'none';
            this.messageElement.innerHTML= '';//clean up
            this.messageElement.style.display= 'none';
            var v= OpenLayers.String.trim(this.lonElement.value);
            if (v!='') { return false; }
            v= OpenLayers.String.trim(this.latElement.value);
            if (v!='') { return false; }
            var a= new Geoportal.OLS.Address(this.countryCode);
            v= OpenLayers.String.trim(this.addressElement.value);
            if (v=='') { return false; }
            // Retrieve street, city and postal code :
            var scp= v.split(',');
            // last one is city
            // before-last is postal code if more than 2 fields
            // all other fields are joined for street
            if (scp.length<=1) { return false; }
            var city= OpenLayers.String.trim(scp.pop());
            if (city=='') { return false; }
            var pc= '';
            if (scp[scp.length-1].match(/[0-9]{5}/)) {
                pc= OpenLayers.String.trim(scp.pop());
            }
            v= OpenLayers.String.trim(scp.join(','));
            var s= new Geoportal.OLS.Street();
            s.name= v;
            var sa= new Geoportal.OLS.StreetAddress();
            sa.addStreet(s);
            a.streetAddress= sa;
            var p= new Geoportal.OLS.Place({
                'classification':'Municipality',
                'name':city
            });
            a.addPlace(p);
            a.postalCode= new Geoportal.OLS.PostalCode({'name':pc});
            //envoie de la requête au serveur OpenLS
            this.layer.GEOCODE(
                [a],
                {
                    onSuccess: this.LUSSuccess,
                    onFailure: this.LUSFailure,
                    scopeOn: this
                });
            a.destroy();
            a= null;
            return true;
        },

        /**
         * Method: LUSSuccess
         * Called when the Ajax request returns a response for a Location Utility
         * service request.
         *
         * Parameters:
         * request - {XmlNode} request to server.
         *
         * Returns:
         * {Boolean} true if processing went well, false otherwise.
         */
        LUSSuccess: function(request) {
            if (!this.layer.queriedAddresses) {
               this.LUSFailure(request);
               return false;
            }
            var features= this.layer.queriedAddresses[0].features;
            var onlyCities= 0;
            for (var i= 0, ilen= features.length; i<ilen; i++) {
                var f= features[i];
                var r= document.createElement('div');
                r.className= 'gpLUSResult';
                if ((i%2)==1) {
                    r.className+= 'Alternate';
                }
                if (f.attributes.geocodeMatchCode) {
                    var score= document.createElement('div');
                    score.className= 'gpGeocodeMatchCode';
                    if (f.attributes.geocodeMatchCode.accuracy<=1.00) {
                        score.className+= 'Accuracy075to100';
                    } else if (f.attributes.geocodeMatchCode.accuracy<=0.75) {
                        score.className+= 'Accuracy050to075';
                    } else if (f.attributes.geocodeMatchCode<=0.50) {
                        score.className+= 'Accuracy025to050';
                    } else if (f.attributes.geocodeMatchCode<=0.25) {
                        score.className+= 'Accuracy000to025';
                    }
                    var img= document.createElement('img');
                    img.className= 'gpGeocodeMatchCodeMatchType';
                    img.i18nKey= f.attributes.geocodeMatchCode.matchType;
                    img.alt= img.title= '';
                    img.src= Geoportal.Util.getImagesLocation()+'OLSnone.gif';
                    if (img.i18nKey) {
                        if (this.matchTypes) {
                            var key= '';
                            for (var j= 0, len=this.matchTypes.length; j<len; j++) {
                                if (!this.matchTypes[j].re ||
                                    (key= img.i18nKey.match(this.matchTypes[j].re))) {
                                    key= key[0].toLowerCase();
                                    if (key=='city') { onlyCities++; }
                                    img.i18nKey= 'gpControlLocationUtilityServiceGeocode.matchType.'+key;
                                    img.src= this.matchTypes[j].src;
                                    break;
                                }
                            }
                        }
                        img.alt= img.title= OpenLayers.i18n(img.i18nKey);
                    }
                    score.appendChild(img);
                    r.appendChild(score);
                }// FIXME: f.attributes.measure ?
                var s= document.createElement('span');
                s.style.cursor= 'pointer';
                var context= {
                    cntrl: this,
                    feature: f
                };
                var ga= f.attributes.address;
                s.innerHTML= ga.toString();
                context.zoom= this.setZoom(f);
                OpenLayers.Event.observe(
                        s,
                        "click",
                        OpenLayers.Function.bindAsEventListener(this.onResultClick,context));
                r.appendChild(s);
                this.resultsElement.appendChild(r);
            }
            if (onlyCities>0 && onlyCities==features.length) {
                this.messageElement.innerHTML= "L'adresse recherchée n'est pas valide car la ville n'est pas reconnue, soit choisissez une ville dans la liste ci-dessus et affiner la recherche sur cette ville en appuyant sur Ctrl-Alt-Clic gauche, soit modifiez la ville dans l'adresse recherchée. Si la nouvelle recherche ne change pas les résultats, c'est que l'adresse proposée n'est pas reconnue par le moteur de recherche.";
                this.messageElement.style.display= '';
            }
            this.resultsElement.style.display= '';
            return true;
        },

        /**
         * Method: LUSFailure
         * Called when the Ajax request fails for a Location Utility
         *      service request.
         *
         * Parameters:
         * request - {XmlNode} request to server.
         */
        LUSFailure: function(request) {
            this.resultsElement.innerHTML= '';//clean up
            this.messageElement.innerHTML= '';//clean up
            if (request) {
                var r= document.createElement('div');
                r.className= 'gpLUSResult';
                var s= document.createElement('span');
                s.innerHTML= OpenLayers.i18n('lus.not.match');
                r.appendChild(s);
                this.resultsElement.appendChild(r);
                this.resultsElement.style.display= '';
                this.messageElement.innerHTML= "L'adresse recherchée n'est pas valide, veuillez ré-essayer en modifiant la ville.";
                this.messageElement.style.display= '';
            } else {
                //FIXME: message d'erreur ?
                this.resultsElement.style.display= 'none';
                this.messageElement.style.display= 'none';
            }
        },

        /**
         * APIProperty: setZoom
         * Returns the zoom from the <Geoportal.OLS.Address> object.
         *      Defaults to map's numZoomLevels - 4.
         *      Expect a feature parameter that holds search results.
         */
        setZoom: function(f) {
            if (f.attributes.geocodeMatchCode.matchType.match(/city/i)) {
                return 11;
            } else {
                return this.map.getNumZoomLevels() - 4;
            }
        },

        /**
         * Method: onResultClick
         * Center the map on the address.
         *
         * Parameters:
         * evt - {Event}
         *
         * Context:
         * cntrl - {<Geoportal.Control.LocationUtilityService>}
         * zoom - {Integer}
         * feature - {<OpenLayers.Feature.Vector>}
         */
        onResultClick: function(evt) {
            if (evt || window.event) OpenLayers.Event.stop(evt? evt : window.event);
            if (this.cntrl.map) {
                var ll= new OpenLayers.LonLat(this.feature.geometry.x, this.feature.geometry.y);
                this.cntrl.map.setCenter(ll,this.zoom,false,false);
                ll= null;
                if (this.cntrl.drawLocation) {
                    this.cntrl.layer.destroyFeatures();
                    this.cntrl.layer.addFeatures([this.feature.clone()]);
                    this.cntrl.layer.selectCntrl.activate();
                }
            }
            if (!evt.ctrlKey) {
                this.cntrl.onSelectLocation(this.feature);
                return;
            }
            if (evt.altKey && this.feature.attributes.geocodeMatchCode.matchType.match(/city/i)) {
                // replay:
                var a= this.feature.attributes.address;
                // Retrieve street :
                var scp= this.cntrl.addressElement.value.split(',');
                scp.pop();//city
                if (scp[scp.length-1].match(/[0-9]{5}/) || scp[scp.length-1].length==0) {
                    scp.pop();//postal code or empty postal code ...
                }
                // first element(s) is street :
                var streetValue= scp.join(',');
                var cityValue= a.getPlaces()[0].name;
                var postalValue= a.postalCode.name;
                this.cntrl.lonElement.value= '';
                this.cntrl.latElement.value= '';
                this.cntrl.addressElement.value= streetValue+', '+postalValue+', '+cityValue;
                this.cntrl.onSearchClick(this.addressElement);
            }
        },

        /**
         * APIProperty: onSelectLocation
         * {Function} Optional function to be called when the address has been
         * received and located on the map.
         *
         * Parameters:
         * f - {<OpenLayers.Feature.Vector>} the selected address.
         */
        onSelectLocation: function(f) {
            if (!f) { return; }
            var a= f.attributes.address;
            var keyedInAddress= this.addressElement.value;
            var streetValue= a.streetAddress?
                a.streetAddress.getNbStreets()>0?
                    (a.streetAddress.getStreets()[0]).name || ''
                :   ''
            :   '';

            var postalValue= a.postalCode?
                a.postalCode.name || ''
            :   '';

            var cityValue= a.getNbPlaces()>0?
                (a.getPlaces()[0]).name?
                    (a.getPlaces()[0]).name || ''
                :   ''
            :   '';

            this.addressElement.value= streetValue+', '+postalValue+', '+cityValue;

            var ll= f.geometry.clone().transform(this.map.getProjection(),OpenLayers.Projection.CRS84);
            this.lonElement.value= ll.x;
            this.latElement.value= ll.y;
            this.resultsElement.innerHTML= '';//clean up
            this.resultsElement.style.display= '';
            this.messageElement.innerHTML= '';//clean up
            this.messageElement.style.display= 'none';
            this.addressElement.focus();
            this.layer.destroyFeatures();
            hideGeoportalView();
        },

        /**
         * Method: cleanLonLat
         * Empty lonElement and latElement values.
         */
        cleanLonLat: function() {
            this.lonElement.value=
            this.latElement.value= '';
        },

        /**
         * Constant: CLASS_NAME
         * {String} *"Geoportal.Control.LocationUtilityService.Geocode.FormOut"*
         */
        CLASS_NAME: "Geoportal.Control.LocationUtilityService.Geocode.FormOut"
    });

    // Initialiser l'application
    OpenLayers.Lang.setCode('fr'); // ensure French

    //options for creating viewer:
    var VIEWEROPTIONS= {
        mode: 'normal',
        territory: 'FXX',
        displayProjection: ['IGNF:RGF93G', 'IGNF:ETRS89LCC'],
        layerSwitcher: 'off',   // on, off, mini
        toolboxCtrl: 'mini',    // on, off, mini
        infoPanel: false,       // true, false
        layerOptions: {
            'GEOGRAPHICALGRIDSYSTEMS.MAPS' : {
                opacity: 0.4,
                visibility: true
            },
            'ORTHOIMAGERY.ORTHOPHOTOS'     : {
                visibility: true
            }
        }
    };

    OpenLayers.Util.getElement('legal').innerHTML= 'Mentions Légales';
    // La carte GeoPortail
    // viewer creation of type <Geoportal.Viewer>
    // création du visualiseur du type <Geoportal.Viewer>
    //                                       HTML div id, options
    viewer= new Geoportal.Viewer.Default('viewerDiv', OpenLayers.Util.extend(
        {
            'mode':VIEWEROPTIONS.mode,
            'territory':VIEWEROPTIONS.territory,
            'projection':VIEWEROPTIONS.projection,
            'displayProjection':VIEWEROPTIONS.displayProjection,
            'proxy':'/geoportail/api/xmlproxy'+'?url='
        },
        // API keys configuration variable set by
        // <Geoportal.GeoRMHandler.getConfig>
        // variable contenant la configuration des clefs API remplie par
        // <Geoportal.GeoRMHandler.getConfig>
        window.gGEOPORTALRIGHTSMANAGEMENT===undefined? {'apiKey':'nhf8wztv3m9wglcda6n6cbuf'} : gGEOPORTALRIGHTSMANAGEMENT)
    );
    if (!viewer) {
        // problem ...
        OpenLayers.Console.error('Création de la carte échouée');
        return;
    }
    // add photos and maps with their settings
    // ajout des photos et cartes avec leur configuration
    viewer.addGeoportalLayers([
        'ORTHOIMAGERY.ORTHOPHOTOS',
        'GEOGRAPHICALGRIDSYSTEMS.MAPS'
    ],VIEWEROPTIONS.layerOptions);
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

    //add controls
    //ajout des contrôles
    var geocoder= new Geoportal.Control.LocationUtilityService.Geocode.FormOut(
        new Geoportal.Layer.OpenLS.Core.LocationUtilityService(
            "StreetAddress:OPENLS;Geocode",//indispensable pour l'appel au serveur OpenLS
            {
                maximumResponses:100,//maximum number of response
                formatOptions:{
                }
            }),
            {
                matchTypes: [
                    {re:/city/i,    src:Geoportal.Util.getImagesLocation()+'OLScity.gif'},
                    {re:/street$/i, src:Geoportal.Util.getImagesLocation()+'OLSstreet.gif'},
                    {re:/number/i,  src:Geoportal.Util.getImagesLocation()+'OLSstreetnumber.gif'},
                    {re:/enhanced/i,src:Geoportal.Util.getImagesLocation()+'OLSstreetenhanced.gif'},
                    {re:null,       src:Geoportal.Util.getImagesLocation()+'OLSstreet.gif'}
                ],
                addressElement:'addressAddress',
                lonElement:'addressLongitude',
                latElement:'addressLatitude',
                submitElement:'GeoAddressFormToggle',
                resultsElement:'results',
                messageElement:'messages'
            });
    viewer.getMap().addControl(geocoder);
    geocoder.activate();
    viewer.setVariable('geocoder', geocoder);//speeds up looking for geocoder control
    var gppanel= OpenLayers.Util.getElement('gppanel');
    viewer.setVariable('gppanel', gppanel);

    // set center at default location and zoom
    // centrage en utilisant la position et la résolution par défaut
    viewer.getMap().setCenter(viewer.viewerOptions.defaultCenter,viewer.viewerOptions.defaultZoom);
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
