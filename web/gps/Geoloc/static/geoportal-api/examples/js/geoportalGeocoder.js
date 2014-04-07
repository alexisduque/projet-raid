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
 * Function: afficheFmtOrigin
 * Shows the result in the original format.
 */
function afficheFmtOrigin() {
    var geocoder= viewer.getVariable('geocoder');
    geocoder.resultsElement.value= geocoder.outputResult;
}

/**
 * Function: afficheFmtKML
 * Shows the result in KML format.
 */
function afficheFmtKML() {
    var geocoder= viewer.getVariable('geocoder');
    geocoder.resultsElement.value= geocoder.outputResultKML;
}

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
}

/**
 * Function: showGeoportalView
 * Make the cartographic view visible.
 */
function showGeoportalView() {
    var gppanel= viewer.getVariable('gppanel');
    if (gppanel.style.visibility=='hidden') {
        gppanel.style.position= 'relative';
        gppanel.style.top= '0px';
        gppanel.style.left= '0px';
        gppanel.style.visibility= 'visible';
    }
}

/**
 * Function: sendAddress
 * Launch search and display addresses. Toggle view.
 *
 * Returns:
 * {Boolean} false.
 */
function sendAddress() {
    var geocoder= viewer.getVariable('geocoder');
    //réinitialise la liste des résultats
    geocoder.resultsElement.value= "";

    //déclenche la recherche
    geocoder.cpt= 0;
    showGeoportalView();
    geocoder.onSearchClick();
    return false;
}

/**
 * Function: validateData
 * Check the data to geocode
 */
function validateData() {
    hideGeoportalView();
    var geocoder= viewer.getVariable('geocoder');
    geocoder.checkData();
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

    /**
     * Class: Geoportal.Control.LocationUtilityService.Geocode.CSVForm
     * Implements a geocoder using form's input fields.
     *
     * Inherits from:
     * - <Geoportal.Control.LocationUtilityService.Geocode>
     */
    Geoportal.Control.LocationUtilityService.Geocode.CSVForm= OpenLayers.Class( Geoportal.Control.LocationUtilityService.Geocode, {
        /**
         * APIProperty: cpt
         * {DOMElement} a counter of queried adresses searched
         */
        cpt: 0,

        /**
         * APIProperty: separatorElement
         * {DOMElement} the separator character used in the data field.
         */
        separatorElement: null,

        /**
         * APIProperty: dataElement
         * {DOMElement} the data field.
         */
        dataElement: null,

        /**
         * APIProperty: resultsElement
         * {DOMElement} the textarea that will contain the results of the geocoder.
         */
        resultsElement: null,

        /**
         * Constructor: Geoportal.Control.LocationUtilityService
         * Build a button for searching an OpenLS Location Utility service.
         *
         * Parameters:
         * layer - {<Geoportal.Layer.OpenLS.Core.LocationUtilityService>}
         * options - {Object} options to build this control.
         *      Expected options are :
         *      * separatorElement - {String | DOMElement}
         *      * dataElement - {String | DOMElement}
         *      * statusElement - {String | DOMElement}
         *      * resultsElement - {String | DOMElement}
         */
        initialize: function(layer, options) {
            Geoportal.Control.LocationUtilityService.Geocode.prototype.initialize.apply(this, arguments);
            OpenLayers.Util.getElement('separatorCharacter').value='\t';
            if (typeof(this.separatorElement)=='string') {
                this.separatorElement= OpenLayers.Util.getElement(this.separatorElement);
            }
            if (typeof(this.dataElement)=='string') {
                this.dataElement= OpenLayers.Util.getElement(this.dataElement);
            }
            if (typeof(this.statusElement)=='string') {
                this.statusElement= OpenLayers.Util.getElement(this.statusElement);
            }
            if (typeof(this.resultsElement)=='string') {
                this.resultsElement= OpenLayers.Util.getElement(this.resultsElement);
            }
        },

        /**
         * APIMethod: destroy
         * Clean the control.
         */
        destroy: function() {
            this.resultsElement= null;
            Geoportal.Control.LocationUtilityService.Geocode.prototype.destroy.apply(this, arguments);
        },

        /**
         * APIMethod: activate
         * Prevents parent's class activation process.
         */
        activate: function() {
            if (!this.layer.map) {
                this.map.addLayer(this.layer);
            }
            this.layer.selectCntrl.deactivate();
            this.layer.destroyFeatures();
            return true;
        },

        /**
         * Method: onSearchClick
         * Search button has been hit, process the Location Utility Service query.
         *
         * Parameters:
         * element - {<DOMElement>} the element receiving the event.
         * evt - {Event} the fired event.
         */
        onSearchClick: function(element,evt) {
            //récupère nom des champs utilisateurs
            if (this.markers) {
                viewer.getMap().removeLayer(this.markers);
            }

            var tab= ["field_adresse","field_cp","field_ville","field_mrkname","field_mrkdesc"];

            var adresse, cp, ville, nom, desc;
            for (var i= 0;i<5;i++) {
                var slt= OpenLayers.Util.getElement(tab[i]);
                switch (i) {
                case 0:
                    adresse= slt.options[slt.selectedIndex].value;
                    break;
                case 1:
                    cp= slt.options[slt.selectedIndex].value;
                    break;
                case 2:
                    ville= slt.options[slt.selectedIndex].value;
                    break;
                case 3:
                    nom= slt.options[slt.selectedIndex].value;
                    break;
                case 4:
                    desc= slt.options[slt.selectedIndex].value;
                    break;
                }
            }

            //création de la première ligne : noms des champs
            var tabChamps= ["Id"];
            tabChamps= tabChamps.concat(this.lines[0].split(this.separatorElement.value.charAt(0)));
            tabChamps= tabChamps.concat(["Longitude","Latitude","Précision","Type","Occurence","Addresse"]);
            this.resultsElement.value+= tabChamps.join(this.separatorElement.value);
            this.resultsElement.value+= '\r\n';

            this.outputResultKML= "<?xml version='1.0' encoding='UTF-8'?>"+"\r\n"+"<kml xmlns='http://www.opengis.net/kml/2.2'>"+"\r\n"+"<Document>"+'\r\n'+"<name>Adresses géocodées</name>"+"\r\n"+"<description>Adresses</description>"+"\r\n";

            this.triggerRequest(adresse,ville,cp,nom,desc);

            //ajout de la couche de marqueurs
            this.markers= new OpenLayers.Layer.Markers("Adresses ");
            viewer.getMap().addLayer(this.markers);
        },

        /**
         * Method: triggerRequest
         * Trigger a request for one address
         *
         * Parameters:
         * adresse - {String}
         * ville - {String}
         * cp - {String}
         * nom - {String}
         * desc - {String}
         */
        triggerRequest : function(adresse, ville, cp, nom, desc) {
            if (this.adressesList[this.cpt]) {
                var a= new Geoportal.OLS.Address(this.countryCode);
                var v= OpenLayers.String.trim(this.adressesList[this.cpt][adresse]);
                if (v=='') { return false; }
                var s= new Geoportal.OLS.Street();
                s.name= v;
                v= OpenLayers.String.trim(this.adressesList[this.cpt][ville]);
                if (v=='') { return false; }
                var sa= new Geoportal.OLS.StreetAddress();
                sa.addStreet(s);
                a.streetAddress= sa;
                var p= new Geoportal.OLS.Place({
                    'classification':'Municipality',
                    'name':v
                });
                a.addPlace(p);
                v= OpenLayers.String.trim(this.adressesList[this.cpt][cp]);
                a.postalCode= new Geoportal.OLS.PostalCode({'name':v});
                //envoi de la requête au serveur OpenLS
                this.layer.GEOCODE(
                    [a],
                    {
                        onSuccess: this.LUSSuccess,
                        onFailure: this.LUSFailure,
                        scopeOn: {
                            cntrl:this,
                            address: adresse,
                            zipcode: cp,
                            city   : ville,
                            name   : nom,
                            desc   : desc
                        }
                    });
                a.destroy();
                a= null;
            } else {
                //écriture des résultats aux deux formats disponibles
                this.outputResult= this.resultsElement.value;
                this.outputResultKML= this.outputResultKML + "</Document>\r\n</kml>";
                OpenLayers.Util.getElement('formatOrigin').disabled= false;
                OpenLayers.Util.getElement('formatKML').disabled= false;
            }
        },

        /**
         * Method: LUSSuccess
         * Called when the Ajax request returns a response for a Location Utility
         * service request.
         *
         * Parameters:
         * request - {XmlNode} request to server.
         *      Context :
         *      * cntrl - {Geoportal.Control.LocationUtilityService.Geocode.CSVForm}
         *      * address - {String} street
         *      * zipcode - {String} postal code
         *      * city - {String} town
         *      * name - {String} place name (optional)
         *      * desc - {String} description (optional)
         *
         * Returns:
         * {Boolean} true if processing went well, false otherwise.
         */
        LUSSuccess: function(request) {
            if (!this.cntrl.layer.queriedAddresses) {
                this.cntrl.LUSFailure(request);
                return false;
            }

            var features= this.cntrl.layer.queriedAddresses[0].features;

            //détermine l'adresse dont l'accuracy est la plus proche de 1
            var minI= 0;
            if (features.length>1) {
                var minValue= Math.abs(1-features[0].attributes.geocodeMatchCode.accuracy);
                for (var i= 1, ilen= features.length; i<ilen; i++) {
                    var temp= Math.abs(1-features[i].attributes.geocodeMatchCode.accuracy);
                    if (temp<minValue) {
                        minI= i;
                        minValue= temp;
                    }
                }
            }

            var f= features[minI];

            //écriture des résultats aux deux formats disponibles
            var separator= this.cntrl.separatorElement.value;
            var centre= new OpenLayers.LonLat(f.geometry.x,f.geometry.y);
            var ll= centre.clone().transform(this.cntrl.map.getProjection(), OpenLayers.Projection.CRS84);
            var champs= new Array(''+(this.cntrl.cpt+1));/*Id*/
            champs= champs.concat(this.cntrl.lines[this.cntrl.cpt+1].split(separator.charAt(0)));
            champs.push(ll.lon);
            champs.push(ll.lat);
            champs.push(f.attributes.geocodeMatchCode.accuracy);
            champs.push(f.attributes.geocodeMatchCode.matchType);
            champs.push(features.length);
            champs.push(f.attributes.address);
            this.cntrl.resultsElement.value+= champs.join(separator.charAt(0));
            this.cntrl.resultsElement.value+= '\r\n';
            this.cntrl.outputResultKML+= "<Placemark>\r\n<name>"+this.cntrl.adressesList[this.cntrl.cpt][this.name]+"</name>\r\n<description>"+this.cntrl.adressesList[this.cntrl.cpt][this.desc]+"</description>\r\n<Point><coordinates>"+ll.lon+","+ll.lat+"</coordinates></Point>\r\n</Placemark>\r\n";

            var size= new OpenLayers.Size(52,33);
            var offset= new OpenLayers.Pixel(-(size.w/2), -size.h);
            var icon= new OpenLayers.Icon('./img/marker.png',size,offset);

            //création du marqueur de l'adresse courante
            var _cpt= this.cntrl.cpt;
            var _nom= this.name;
            var _des= this.desc;
            var mrkr= new OpenLayers.Marker(centre,icon);
            var _mks= this.cntrl.markers;
            var _adl= this.cntrl.adressesList;
            mrkr.events.register('mousedown', mrkr, function(evt) {
                if (this.feature==null) {
                    this.feature= new OpenLayers.Feature(_mks,this.lonlat.clone(),{
                        popupSize: new OpenLayers.Size(110,60),
                        popupContentHTML: "<div style='font-size:small;'><b>"+_adl[_cpt][_nom]+"</b><br>"+_adl[_cpt][_des]+"</div>"
                    });
                    this.feature.createPopup(true);
                    this.feature.popup.setBackgroundColor("white");
                    this.feature.popup.setOpacity(0.8);
                    _mks.map.addPopup(this.feature.popup);
                } else {
                    this.feature.popup.toggle();
                }
                OpenLayers.Event.stop(evt);
            });
            this.cntrl.markers.addMarker(mrkr);

            //une fois la requete terminée on lance la prochaine
            this.cntrl.cpt++;
            this.cntrl.triggerRequest(this.address,this.city,this.zipcode,this.name,this.desc);
            return true;
        },

        /**
         * Method: LUSFailure
         * Called when the Ajax request fails for a Location Utility
         *      service request.
         *
         * Parameters:
         * request - {XmlNode} request to server.
         *      Context :
         *      * cntrl - {Geoportal.Control.LocationUtilityService.Geocode.CSVForm}
         *      * address - {String} street
         *      * zipcode - {String} postal code
         *      * city - {String} town
         *      * name - {String} place name (optional)
         *      * desc - {String} description (optional)
         */
        LUSFailure: function(request) {
            var separator= this.cntrl.separatorElement.value;
            //écriture des résultats
            var champs= this.cntrl.lines[this.cntrl.cpt].split(separator.charAt(0));
            champs.unshift(''+(this.cntrl.cpt+1));/*Id*/
            champs.push('0');
            champs.push('0');
            champs.push('0');
            champs.push('');
            champs.push('0');
            champs.push(OpenLayers.i18n('lus.not.match'));
            this.cntrl.resultsElement.value+= champs.join(separator) + '\r\n';

            //une fois la requete terminée on lance la prochaine
            this.cntrl.cpt++;
            this.cntrl.triggerRequest(this.address,this.city,this.zipcode,this.name,this.desc);
        },

        /**
         * APIMethod: checkData
         * Check whether CSV data are correct or not.
         *
         * Returns:
         * {Boolean} true if data are correct, false otherwise.
         */
        checkData: function() {
            var origin= OpenLayers.Util.getElement('formatOrigin');
            origin.disabled= true;
            origin.checked= true;
            var kml= OpenLayers.Util.getElement('formatKML');
            kml.disabled= true;
            kml.checked= false;
            var capanel= document.getElementById('capanel');
            capanel.style.visibility= 'hidden';
            capanel.style.position= 'absolute';
            capanel.style.top= '-9999px';
            capanel.style.left= '-9999px';

            var separator= this.separatorElement.value;

            var valid= true;
            var errorLines= [];
            this.lines= this.dataElement.value.split("\n");
            //nettoyage lignes vides ...
            var ls= [];
            for (var i=this.lines.length-1; i>=0; i--) {
                if (this.lines[i].length>0) {
                    ls.unshift(this.lines[i]);
                }
            }
            this.lines= ls;
            var champs= this.lines[0].split(separator.charAt(0));
            if (champs.length<3) {
                errorLines.push(0);
                valid= false;
            }

            for (var i= 0, l= this.lines.length; i<l; i++) {
                if (l>1 && i==0) { continue; }
                if (this.lines[i].length==0) { continue; }
                if (champs.length!=this.lines[i].split(separator.charAt(0)).length) {
                    errorLines.push(i+1);
                    valid= false;
                }
            }

            if (valid) {
                //message
                this.statusElement.innerHTML= "OK : "+this.lines.length+" lignes / "+champs.length+" colonnes";
                this.statusElement.style.color= 'green';

                //remplissage des <select> pour le choix des champs d'adressage
                var tab= ["field_adresse","field_cp","field_ville","field_mrkname","field_mrkdesc"];
                for (var i= 0, l= tab.length; i<l; i++) {
                    //on vide la liste d'options
                    var select= OpenLayers.Util.getElement(tab[i]);
                    while (select.options.length>0) {
                        select.options[0]= null;
                    }
                    
                    //On remplit la première option du select
                    var first_opt= document.createElement('option');
                    first_opt.value= champs[i];
                    first_opt.text= champs[i]; 
                    select.options[0]= first_opt;
                    
                    //on remplit le select avec le reste des valeurs
                    for (var j= 0, k= champs.length; j<k; j++) {
                        if(j != i){ // ce champ n'a pas encore été ajouté au select
                            var key= document.createElement('option');
                            key.value= champs[j];
                            key.text= champs[j];
                            select.options[j+1]= key;
                        }
                        if(select.options[j].value==""){ //On supprime les champs vides du select
                            select.removeChild(select.options[j]);
                        }
                    }
                }

                //récupération des données
                this.adressesList= [];
                for (var i= 0, l= this.lines.length; i<l; i++) {
                    if (l>1 && i==0) { continue; }
                    if (this.lines[i].length==0) { continue; }
                    var obj= [];
                    for (var j= 0, k= champs.length; j<k; j++) {
                        var key= champs[j];
                        var value= this.lines[i].split(separator.charAt(0))[j];
                        obj[key]= value;
                    }
                    this.adressesList.push(obj);
                }

                //on met une fausse ligne dans le cas d'une seule ...
                if (this.lines.length==1) {
                    this.lines.unshift(champs.join(separator));
                }
                capanel.style.position= 'relative';
                capanel.style.top= '0px';
                capanel.style.left= '0px';
                capanel.style.visibility= 'visible';
                this.cpt= 0;
            } else {
                //message
                this.statusElement.innerHTML= "ERREUR : "+this.lines.length+" lignes / ["+Math.max(champs.length,3)+" colonnes attendues]<br>Erreurs ";
                if (errorLines.length==1) {
                    this.statusElement.innerHTML+= "à la ligne";
                } else {
                    this.statusElement.innerHTML+= "dans les lignes";
                }
                this.statusElement.innerHTML+= " : "+errorLines.toString();
                this.statusElement.style.color= 'red';
            }
        },

        /**
         * Constant: CLASS_NAME
         * {String} *"Geoportal.Control.LocationUtilityService.Geocode.CSVForm"*
         */
        CLASS_NAME: "Geoportal.Control.LocationUtilityService.Geocode.CSVForm"

    });

    // Initialiser l'application
    OpenLayers.Lang.setCode('fr'); // ensure French
    var VIEWEROPTIONS= {
        mode: 'normal',
        territory: 'FXX',
        displayProjection: ['IGNF:RGF93G', 'IGNF:ETRS89LCC'],
        layerSwitcher: 'off',  // on, off, mini
        toolboxCtrl: 'mini',      // on, off, mini
        infoPanel: false,        // true, false
        layerOptions: {
            'GEOGRAPHICALGRIDSYSTEMS.MAPS' : {
                opacity : 0.4,
                visibility: true
            },
            'ORTHOIMAGERY.ORTHOPHOTOS'     : {
                visibility : true
            }
        }
    };

    //options for creating viewer:
    var options= {
        // default value
        // valeur par défaut
        mode:VIEWEROPTIONS.mode,
        // default value
        // valeur par défaut
        territory:VIEWEROPTIONS.territory,
        // default value
        // valeur par défaut
        displayProjection:VIEWEROPTIONS.displayProjection,
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

    viewer.addGeoportalLayers(
        [
            'ORTHOIMAGERY.ORTHOPHOTOS',
            'GEOGRAPHICALGRIDSYSTEMS.MAPS'
        ],
        VIEWEROPTIONS.layerOptions
    );
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

    //les controles
    viewer.getMap().getControlsByClass(OpenLayers.Control.KeyboardDefaults.prototype.CLASS_NAME)[0].deactivate();
    var layerCore= new Geoportal.Layer.OpenLS.Core.LocationUtilityService(
        "StreetAddress:OPENLS;Geocode", //indispensable pour l'appel au serveur OpenLS
        {
            formatOptions: {
            }
        }
    );
    var geocoder= new Geoportal.Control.LocationUtilityService.Geocode.CSVForm(
        layerCore,{
            separatorElement:'separatorCharacter',
            dataElement:'input_data',
            resultsElement:'results_data',
            statusElement:'validationStatus'
        }
    );
    viewer.getMap().addControl(geocoder);
    geocoder.activate();
    viewer.setVariable('geocoder', geocoder);//speeds up looking for geocoder control
    var gppanel= OpenLayers.Util.getElement('gppanel');
    viewer.setVariable('gppanel', gppanel);

    viewer.getMap().setCenter(viewer.viewerOptions.defaultCenter,viewer.viewerOptions.defaultZoom);
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
