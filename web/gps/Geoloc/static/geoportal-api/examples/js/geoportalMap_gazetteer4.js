/*
 * Copyright (c) 2008-2013 Institut National de l'information Geographique et forestiere France, released under the
 * BSD license.
 */
/**
 * Property: currentTerritory
 * {String} the current territory.
 */
currentTerritory= 'FXX';

/**
 * Property: territoriesViewer
 * {Object} An array of map for each territory. Each entry is
 * a territory, each element is a {<Geoportal.Viewer>}.
 */
territoriesViewer= {
    'FXX':null,/* France Métropolitaine   */
    'GLP':null,/* DOM - Guadeloupe        */
    'MTQ':null,/* DOM - Martinique        */
    'GUF':null,/* DOM - Guyane Française  */
    'REU':null,/* DOM - Île de la Réunion */
    'MYT':null /* DOM - Mayotte           */
};

/**
 * Property: viewerOptions
 * {Object} options for creating viewer.
 */
viewerOptions= {
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
    //proxy:'/geoportail/api/xmlproxy'+'?url='
};

/**
 * Function: createMap
 * Create Map with Ortho-imagery and Scanned maps.
 */
function createMap() {
    currentTerritory= viewerOptions.territory || 'FXX';
    // viewer creation of type <Geoportal.Viewer>
    // création du visualiseur du type <Geoportal.Viewer>
    //                                   HTML div id, options
    territoriesViewer[currentTerritory]= new Geoportal.Viewer.Default('viewerDiv', OpenLayers.Util.extend(
        OpenLayers.Util.extend({}, viewerOptions),
        // API keys configuration variable set by
        // <Geoportal.GeoRMHandler.getConfig>
        // variable contenant la configuration des clefs API remplie par
        // <Geoportal.GeoRMHandler.getConfig>
        window.gGEOPORTALRIGHTSMANAGEMENT===undefined? {'apiKey':'nhf8wztv3m9wglcda6n6cbuf'} : gGEOPORTALRIGHTSMANAGEMENT)
    );
    if (!territoriesViewer[currentTerritory]) {
        // problem ...
        OpenLayers.Console.error(OpenLayers.i18n('new.instance.failed'));
        return;
    }

    territoriesViewer[currentTerritory].addGeoportalLayers([
        'ORTHOIMAGERY.ORTHOPHOTOS',
        'GEOGRAPHICALGRIDSYSTEMS.MAPS'],
        {
        });
    territoriesViewer[currentTerritory].getMap().setCenter(
        territoriesViewer[currentTerritory].viewerOptions.defaultCenter,
        territoriesViewer[currentTerritory].viewerOptions.defaultZoom);
    // cache la patience - hide loading image
    territoriesViewer[currentTerritory].div.style[OpenLayers.String.camelize('background-image')]= 'none';
}

/**
 * Function: createLayer
 * Create vector layer for receiving addresses.
 */
function createLayer() {
    return new Geoportal.Layer.OpenLS.Core.LocationUtilityService(
        'StreetAddress:OPENLS;Geocode',//layer name
        {
            maximumResponses:100,
            formatOptions: {
            },
            // define your own picto instead of default:
            marker:"http://maps.gstatic.com/intl/fr_fr/mapfiles/ms/icons/blue-dot.png"
        }
    );
}

/**
 * Function: createSearchEngine
 * Build controler for searching addresses.
 */
function createSearchEngine() {
    var olsLayer= createLayer();
    var gazetteer= new Geoportal.Control.LocationUtilityService.Geocode(olsLayer, {
        // force drawLocation
        drawLocation:true,
        // suffix of all fields' form - suffixe des champs du formulaire
        id:'Gazetteer',
        // place where to display results - endroit où lister les résultats
        resultDiv: OpenLayers.Util.getElement('resultsGazetteer'),
        outsideViewport:true,
        fields:{
            'q0':'address',
            'c' :null,
            's' :'search',
            'w' :null
        },
        activate: function() {
            this.layer.selectCntrl.deactivate();
            this.layer.destroyFeatures();
            this.loadContent(OpenLayers.Util.getElement('gpSearch'));
            if (!this.layer.map) {
                this.map.addLayer(this.layer);
            }
            this.resultDiv.innerHTML= '';
            this.resultDiv.style.display= 'none';

            // turn auto-completion on :
            if (this.autoCompleteControl) {
                this.map.addControl(this.autoCompleteControl);
            }

        },
        deactivate: function() {
            this.layer.cleanQueries();
        },
        loadContent: function(form) {
            // add mapping :
            this.inputs[this.fields.q0]= OpenLayers.Util.getElement('nameGazetteer');
            this.buttons[this.fields.s]= OpenLayers.Util.getElement('searchGazetteer');
            // add listeners :
            var e= this.buttons[this.fields.s];
            OpenLayers.Event.observe(
                form,
                "keypress",
                OpenLayers.Function.bind(function(evt) {
                    if (evt.keyCode==13 || evt.keyCode==10) {
                        return this.onSearchClick.apply(this,[e,evt]);
                    }
                    return true;
                },this)
            );
            e.onclick= OpenLayers.Function.bind(this.onSearchClick,this,e);

            // turn auto-completion on :
            if (this.autoCompleteOptions) {
                this.autoCompleteControl= new Geoportal.Control.AutoComplete(
                    this.inputs[this.fields.q0],
                    OpenLayers.Util.extend({
                        url: this.getAutoCompleteUrl(),
                        type: this.countryCode
                    }, this.autoCompleteOptions)
                );
            }

        },
        onSearchClick: function(element,evt) {
            if (evt || window.event) OpenLayers.Event.stop(evt? evt : window.event);
            
            // Retrieve street, city and postal code :
            var v= OpenLayers.String.trim(this.inputs[this.fields.q0].value);
            if (v=='') { return false; }
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
            var a= new Geoportal.OLS.Address(this.countryCode);
            a.streetAddress= sa;
            var p= new Geoportal.OLS.Place({
                'classification':'Municipality',
                'name':city
            });
            a.addPlace(p);
            a.postalCode= new Geoportal.OLS.PostalCode({'name':pc});
            //send request to OpenLS service :
            this.layer.GEOCODE(
                [a],
                {
                    onSuccess: this.LUSSuccess,
                    onFailure: this.LUSFailure,
                    scopeOn: this
                });
            a.destroy()
            a= null;
            return true;
        },
        setZoom: function(f) {
            if (f.attributes.geocodeMatchCode.matchType.match(/city/i)) {
                return 10;
            } else {
                return this.map.getNumZoomLevels() - 4;
            }
        },
        onResultClick: function(evt) {
            if (this.cntrl.map) {
                var xy= new OpenLayers.LonLat(this.feature.geometry.x, this.feature.geometry.y);
                var ll= xy.clone().transform(this.cntrl.map.getProjection(), OpenLayers.Projection.CRS84);
                var t= this.cntrl.map.catalogue.findTerritory(ll);
                if (t!==this.cntrl.map.baseLayer.territory) {
                    var oMap= this.cntrl.map;
                    this.feature.geometry.transform(oMap.getProjection(), OpenLayers.Projection.CRS84);
                    
                    var div= OpenLayers.Util.getElement("___$"+currentTerritory+"$___");
                    if (!div) {
                        div= OpenLayers.getDoc().createElement("div");
                        div.id= "___$"+currentTerritory+"$___";
                        div.style.position= "absolute";
                        div.style.left= "-9999px";
                        div.style.width= oMap.div.parentNode.clientWidth+"px";
                        div.style.height= oMap.div.parentNode.clientHeight+"px";
                        oMap.div.parentNode.appendChild(div);
                    }
                    oMap.render(div);
                    var features= [];
                    var response= this.cntrl.layer.queriedAddresses.slice();
                    for (var i in response[0].features) {
                        var feature= response[0].features[i].clone();
                        feature.geometry.transform(oMap.getProjection(), OpenLayers.Projection.CRS84);
                        features.push(feature);
                    }
                    this.cntrl.deactivate();
                    if (territoriesViewer[t]==null) {
                        viewerOptions.territory= t;
                        createMap();
                        var gazetteer= createSearchEngine();
                        territoriesViewer[t].getMap().addControls([gazetteer]);
                        gazetteer.activate();
                        this.cntrl= gazetteer;
                    } else {
                        territoriesViewer[t].getMap().render(OpenLayers.Util.getElement('viewerDiv'));
                        this.cntrl= territoriesViewer[t].getMap().getControlsByClass('Geoportal.Control.LocationUtilityService.Geocode')[0];
                        this.cntrl.activate();
                        currentTerritory= t;
                    }
                    this.cntrl.layer.queriedAddresses= response;
                    for (var i in features) {
                        features[i].geometry.transform(OpenLayers.Projection.CRS84, this.cntrl.map.getProjection());
                    }
                    this.cntrl.layer.queriedAddresses[0].features= features;
                    this.cntrl.LUSSuccess();//display results again !
                    this.feature.geometry.transform(OpenLayers.Projection.CRS84, this.cntrl.map.getProjection());
                    xy= ll.transform(OpenLayers.Projection.CRS84, this.cntrl.map.getProjection());
                }
                this.cntrl.map.setCenter(xy,this.zoom,false,false);
                xy= null;
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
                var scp= this.cntrl.inputs[this.fields.q0].value.split(',');
                scp.pop();//city
                if (scp[scp.length-1].match(/[0-9]{5}/) || scp[scp.length-1].length==0) {
                    scp.pop();//postal code or empty postal code ...
                }
                // first element(s) is street :
                var streetValue= scp.join(',');
                var cityValue= a.getPlaces()[0].name;
                var postalValue= a.postalCode.name;
                this.cntrl.inputs[this.fields.q0].value= streetValue+', '+postalValue+', '+cityValue;
                this.cntrl.onSearchClick(this.cntrl.inputs[this.fields.q0]);
            }
        },
        onSelectLocation: function(f) {
            if (!f) { return; }
            var a= f.attributes.address;
            var keyedInAddress= this.inputs[this.fields.q0].value;
            var streetValue= a._streetLocation?
                a._streetLocation.num || ''
            :   ''
            + a.streetAddress?
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

            this.inputs[this.fields.q0].value= (streetValue || '-')+', '+(postalValue || '-')+', '+(cityValue || '-');

            this.resultDiv.innerHTML= '';//clean up
            this.resultDiv.style.display= 'none';
            this.inputs[this.fields.q0].focus();
        },
        closeForm: function() {
            this.layer.abortRequest();
            this.inputs[this.fields.q0].value= '';
            this.resultDiv.innerHTML= '';
            this.resultDiv.style.display= 'none';
        },

        // turn auto-completion on :
        autoCompleteOptions: {}

    });

    return gazetteer;
}

/**
 * Function: initMap
 * Load the application. Called when all information have been loaded by
 * <loadAPI>().
 */
function initMap() {
    //The api is loaded at this step
    //L'api est chargée à cette étape

    //add translations
    translate(['legendFormGazetteer','fieldLblGazetteer','searchGazetteer']);

    createMap();
    var gazetteer= createSearchEngine();
    territoriesViewer[currentTerritory].getMap().addControls([gazetteer]);
    gazetteer.activate();
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
