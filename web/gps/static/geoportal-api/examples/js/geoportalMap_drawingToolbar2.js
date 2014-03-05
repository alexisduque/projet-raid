/*
 * Copyright (c) 2008-2011 Institut National de l'information Géographique et forestière France, released under the
 * BSD license.
 */

 /**
 * Property: key
 *
 * The API key to use
 */
const APIkey='nhf8wztv3m9wglcda6n6cbuf';

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
   
    // ----- Traduction
    translate();

    // ----- Options
    
    var options= {
        mode:'normal',
		territory:'FXX',
		proxy:'/geoportail/api/xmlproxy'+'?url='
    };

    viewer= new Geoportal.Viewer.Simple('viewerDiv', OpenLayers.Util.extend(
        options,
        // API keys configuration variable set by <Geoportal.GeoRMHandler.getConfig>
        // variable contenant la configuration des clefs API remplie par <Geoportal.GeoRMHandler.getConfig>
        window.gGEOPORTALRIGHTSMANAGEMENT===undefined? {'apiKey':APIkey} : gGEOPORTALRIGHTSMANAGEMENT)
    );
    if (!viewer) {
        // problem ...
        OpenLayers.Console.error(OpenLayers.i18n('new.instance.failed'));
        return;
    }
   

    //Ajout de la boite à outils
    viewer.getMap().addControl(new Geoportal.Control.ToolBox());  
    
    // Récupération de la boite à outils
    var toolBox= viewer.getMap().getControlsByClass('Geoportal.Control.ToolBox')[0];

    // Création de la barre de navigation
    var navbar = new Geoportal.Control.NavToolbar	(
	{
		// Div où la barre doit être ajoutée
		div: OpenLayers.Util.getElement(toolBox.id+'_navbar'),
		// Div où le resultat des mesures est affiché
		targetElement: OpenLayers.Util.getElement(toolBox.id+'_navbar')
	}
    );

    // Ajout de la barre de navigation
    viewer.getMap().addControl(navbar);    


    // Création de la barre de zoom
    var zoombar = new Geoportal.Control.ZoomBar	(
	{
		// Div où la barre doit être ajoutée
		div: OpenLayers.Util.getElement(toolBox.id+'_zoombar'),
		// Div où le resultat des mesures est affiché
		targetElement: OpenLayers.Util.getElement(toolBox.id+'_zoombar')
	}
    );

    // Ajout de la barre de zoom
    viewer.getMap().addControl(zoombar);    

    //Ajout des couches Geoportail
    viewer.addGeoportalLayers(['ORTHOIMAGERY.ORTHOPHOTOS','GEOGRAPHICALGRIDSYSTEMS.MAPS']);

    //Création d'une nouvelle couche ('vide') pour réaliser les dessins  
    var layer = new OpenLayers.Layer.Vector("Dessin");

    //Ajout de la barre de dessin 
    viewer.getMap().addControl(new Geoportal.Control.DrawingToolbar(
      layer, 
      { 
        mode: 'multiple',
        // options du bouton de sauvegarde de la couche
        saveLayerOptions: {
           url: 'http://api.ign.fr/geoportail/api/save' ,
           supportedFormats:{
             kml: {
              formatClass: OpenLayers.Format.KML,
              options:{
                mime: 'application/vnd.google-earth.kml'
              }
            }
          }
        }
      }
    ));


    //Ajout du gestionnaire de couche
    viewer.getMap().addControl(new Geoportal.Control.LayerSwitcher());
    
    // ----- Autres
    viewer.getMap().setCenterAtLonLat(2.418611,48.842222,10);
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
    
    Geoportal.GeoRMHandler.getConfig([APIkey], null,null, {
        onContractsComplete: initMap
    });
}

// assign callback when "onload" event is fired
// assignation de la fonction à appeler lors de la levée de l'évènement "onload"
window.onload= loadAPI;
