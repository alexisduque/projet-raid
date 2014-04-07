/*
 * Copyright (c) 2008-2013 Institut National de l'information Geographique et forestiere France, released
 * under the BSD license.
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
    viewer.getMap().setCenterAtLonLat(2.8798098734190742, 45.990823023072224, viewer.viewerOptions.defaultZoom);    
    // cache la patience - hide loading image
    viewer.div.style[OpenLayers.String.camelize('background-image')]= 'none';
    
    viewer.setInformationPanelVisibility(false);
    viewer.setLayersPanelVisibility(false);
    viewer.openToolsPanel(false);

    // on stocke les éléments du formulaire
    viewer.setVariable('GeoXYFormLon', OpenLayers.Util.getElement('GeoXYFormLon'));
    viewer.setVariable('GeoXYFormLat', OpenLayers.Util.getElement('GeoXYFormLat'));
    viewer.setVariable('Description', OpenLayers.Util.getElement('Description'));
    
    var pictos= document.getElementsByName('style_picto');
    for (var i= 0, l= pictos.length; i<l; i++) {
        // cross-browser ?
        pictos[i].onclick= function() {
            // this===bouton radio
            viewer.removeVariable('selectedPicto');
            viewer.setVariable('selectedPicto', this);

        }
        if (pictos[i].checked) {
            viewer.setVariable('selectedPicto', pictos[i]);
        }

    }
    var e= OpenLayers.Util.getElement('validation');
    e.onclick= savePoint;
    e= OpenLayers.Util.getElement('remove_feature');
    e.onclick= removePoint;
    e= OpenLayers.Util.getElement('save_layer');
    e.onclick= saveLayer;
    e= OpenLayers.Util.getElement('raz');
    e.onclick= hideExport;
    e= OpenLayers.Util.getElement('layer_kml');
    viewer.setVariable('export', e);

    viewer.getMap().addControl(new OpenLayers.Control.LoadingPanel());
    var tbx= viewer.getMap().getControlsByClass('Geoportal.Control.ToolBox')[0];
    var searchbar= new Geoportal.Control.SearchToolbar({
        div: OpenLayers.Util.getElement(tbx.id+'_search'),
        geonamesOptions: {
            setZoom: Geoportal.Control.LocationUtilityService.GeoNames.setZoomForBDNyme,
            layerOptions: {
                name: 'PositionOfInterest:OPENLS;Geocode',
                maximumResponses:100,
                formatOptions: {
                }
            }
        }
    });
    viewer.getMap().addControl(searchbar);

/*-------------------------------------------déclaration de vlayer-------------------------------------*/
    var vlayer= new OpenLayers.Layer.Vector('dessin',{
        externalProjection: OpenLayers.Projection.CRS84.clone(),//projection propre à la couche
        internalProjection: viewer.getMap().getProjection(),//projection de la carte
        displayInLayerSwitcher:false,//ne pas afficher dans le gestionnaire des couches
        supportedFormats:{// formats d'enregistrement (ici uniquement kml)
            kml:{
                formatClass: OpenLayers.Format.KML,
                options:{
                    mime: 'application/vnd.google-earth.kml'
                }
            }
        },
        supportedProjections:{
        	kml:[
        	     'CRS:84'
        	     ]
        },
        styleMap: new OpenLayers.StyleMap({
            // par défaut: le dessin avec le picto sélectionné
            "default"   : new OpenLayers.Style(
                OpenLayers.Util.applyDefaults({
                    'externalGraphic': "${getUrl}",
                    'graphicOpacity' : 1.0,
                    'graphicWidth'   : 21,
                    'graphicHeight'  : 25
                }, OpenLayers.Feature.Vector.style["default"]),
                {
                    context : {
                        getUrl: function(feature){
                            var url=feature.attributes.pictoUrl;
                            return url;
                        }
                    }
                }
            ),
            // temporaire : on n'affiche rien !
            "temporary" : new OpenLayers.Style(
                OpenLayers.Util.extend({
                    display:'none'
                }, OpenLayers.Feature.Vector['temporary'])
            ),
            // sélectionné : le dessin avec le marqueur rouge
            "select"    : new OpenLayers.Style(
                OpenLayers.Util.applyDefaults({
                    'externalGraphic': 'http://api.ign.fr/geoportail/api/js/2.0.3/img/marker.png',
                    'graphicOpacity' : 0.8,
                    'graphicWidth'   : 21,
                    'graphicHeight'  : 25
                }, OpenLayers.Feature.Vector.style["select"])
            )},
            {
                extendDefault:false
            }
        ),
        eventListeners:{
            "featureunselected": function(e) {
                if (e.feature.style) {
                    delete e.feature.style;
                    e.feature.style= null;
                }
                e.feature.attributes.pictoUrl=viewer.getVariable('selectedPicto').value;

                this.drawFeature(e.feature,'default');
                // remise à zéro du formulaire :
                raz();
            },
            "beforefeatureadded": function(e) {
                //this===vlayer===e.feature.layer !
                //désélection :
                viewer.getVariable('selectCntrl').unselectAll();
            },
            "featureselected": function(e) {
                //this===vlayer===e.feature.layer !
                // destruction du style pour utiliser le style de la couche en mode "sélectionné"

                if (e.feature.style) {
                    delete e.feature.style;
                    e.feature.style= null;
                }
                this.drawFeature(e.feature,'select');
                //rafraichissement du formulaire de saisie :
                updateXYForm(e.feature);
            }
        }
    });
    viewer.getMap().addLayer(vlayer);
    viewer.setVariable('points', vlayer);

/*-------------------------------------------Controle pour la saisie d'objets(ctrl+mousedown)-------------------------------------*/
    var draw_feature= new OpenLayers.Control.DrawFeature(
        vlayer,
        OpenLayers.Handler.Point,
        {
            autoActivate:true,
            callbacks:{
                done: function (geometry) {
                    //this.layer=== var vlayer= viewer.getVariable('points');
                    var attributes= {
                        //sauvegarde du type du picto courant:
                        'pictoUrl'       : viewer.getVariable('selectedPicto').value,
                        'description': ""
                    };
                    // Creer le nouveau point
                    var feature= new OpenLayers.Feature.Vector(geometry, attributes);
                    this.layer.addFeatures([feature]);
                    updateXYForm(feature);
                    viewer.getVariable('selectCntrl').select(feature);
                }
            },
            handlerOptions:{
                keyMask: OpenLayers.Handler.MOD_CTRL
            }
        }
    );
    viewer.getMap().addControl(draw_feature);

/*-------------------------------------------mise à jour du formulaire-------------------------------------------------------*/
    function updateXYForm (feature, pix) {
        if (!feature || !feature.geometry  || !feature.geometry.x || !feature.geometry.y) {
            return;
        }

        var pt= feature.geometry.clone();
        if (pt) {
            pt.transform(viewer.getMap().getProjection(),feature.layer.externalProjection);

            viewer.getVariable('GeoXYFormLon').value= pt.x;
            viewer.getVariable('GeoXYFormLat').value= pt.y;
            viewer.getVariable('Description').value= feature.attributes['description'];

            delete pt;
        }
    }

    
    function dragPoi (feature, pix) {

		viewer.getVariable('selectCntrl').unselectAll();
		viewer.getVariable('selectCntrl').select(feature);
		updateXYForm (feature, pix);
    }
/*-------------------------------------------Controle pour le deplacement----------------------------------*/
    var drag_control= new OpenLayers.Control.DragFeature(
        viewer.getVariable('points'),
        {
            onDrag:dragPoi,
            onComplete:updateXYForm
        }
    );
    viewer.getMap().addControl(drag_control);
    drag_control.activate();
    

/*-------------------------------------------Controle pour la selection d'objets----------------------------------*/
   var select_feature= new OpenLayers.Control.SelectFeature(
        viewer.getVariable('points'),
        {
            clickout: false,
            toggle: true,
            multiple: false,
            hover: false,
            toggleKey: null, // ctrl key removes from selection
            multipleKey: null, // shift key adds to selection
            box: false
        }
    );
    viewer.getMap().addControl(select_feature);
    select_feature.activate();
    viewer.setVariable('selectCntrl', select_feature);
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

/*-------------------------------------------Réinitialisation du formulaire---------------------------------------*/
function raz(){
    viewer.getVariable('Description').value= "";
    viewer.getVariable('GeoXYFormLon').value= "";
    viewer.getVariable('GeoXYFormLat').value= "";
    hideExport();
}

/*-------------------------------------------Réinitialisation du formulaire---------------------------------------*/
function hideExport(){
    viewer.getVariable('export').value= "";
    viewer.getVariable('export').style.display= 'none';
}

/*-------------------------------------------validation du formulaire---------------------------------------------*/
function savePoint(){
    var vlayer= viewer.getVariable('points');
    if (vlayer.selectedFeatures && vlayer.selectedFeatures.length>0) {
        vlayer.selectedFeatures[0].attributes['description']= viewer.getVariable('Description').value;
    }
}

/*-------------------------------------------Suppression du point selectionné-------------------------------------*/
function removePoint() {
    var vlayer= viewer.getVariable('points');
    if (vlayer.selectedFeatures && vlayer.selectedFeatures.length>0) {
        vlayer.destroyFeatures(vlayer.selectedFeatures[0]);
    }
    raz();
}

/*-------------------------------------------Enregistrement des points--------------------------------------------*/
function saveLayer(){
    //je recupère tous les points de cette couche
    var vlayer= viewer.getVariable('points');
    var all_features= vlayer.features.slice(0);
    
    var prj=vlayer.supportedProjections['kml'][0];


    var prt= true;
    var opts= OpenLayers.Util.extend({},vlayer.supportedFormats['kml'].options);
    OpenLayers.Util.applyDefaults(opts,{
        internalProjection: viewer.getMap().getProjection().clone(),
        externalProjection: new OpenLayers.Projection(prj)
    });
    var fw= new vlayer.supportedFormats['kml'].formatClass(opts);
    var str= fw.write(all_features,prt);
    viewer.getVariable('export').value= str;
    viewer.getVariable('export').style.display= 'block';
}
