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

    //add translations
    translate(['legendFormGazetteer','fieldLblGazetteer','searchGazetteer']);

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
        //proxy:'/geoportail/api/xmlproxy'+'?url='
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
        {
        });
    viewer.getMap().setCenter(viewer.viewerOptions.defaultCenter,viewer.viewerOptions.defaultZoom);
    // cache la patience - hide loading image
    viewer.div.style[OpenLayers.String.camelize('background-image')]= 'none';

    var olsLayer= new Geoportal.Layer.OpenLS.Core.LocationUtilityService(
        'PositionOfInterest:OPENLS;Geocode',//layer name
        {
            maximumResponses:100,
            formatOptions: {
            },
            // define your own picto instead of default:
            marker:"http://maps.gstatic.com/intl/fr_fr/mapfiles/ms/icons/blue-dot.png"
        }
    );

    var gazetteer= new Geoportal.Control.LocationUtilityService.GeoNames(olsLayer, {
        // force drawLocation
        drawLocation:true,
        // suffix of all fields' form - suffixe des champs du formulaire
        id:'Gazetteer',
        outsideViewport:true,
        // place where to display results - endroit où lister les résultats
        resultDiv: OpenLayers.Util.getElement('resultsGazetteer'),
        fields:{
            'q0':'name',
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
        closeForm: function() {
            this.layer.abortRequest();
            this.inputs[this.fields.q0].value= '';
            this.resultDiv.innerHTML= '';
            this.resultDiv.style.display= 'none';
        },
        //set appropriate zoom (instead of 10 ...)
        setZoom: Geoportal.Control.LocationUtilityService.GeoNames.setZoomForBDNyme,

        // turn auto-completion on :
        autoCompleteOptions: {}

    });
    viewer.getMap().addControls([gazetteer]);
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
