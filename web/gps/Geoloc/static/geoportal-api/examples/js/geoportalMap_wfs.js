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
 * Function: overRiver
 * Called when a feature is selected.
 *
 * Parameters:
 * feature - {<OpenLayers.Feature>}
 */
function overRiver(feature) {
    if (feature) {
        if (!feature.popup) {
            var ll= this.map.getLonLatFromViewPortPx(this.handlers.feature.evt.xy);
            feature.popup= new OpenLayers.Popup.FramedCloudMaxSize(
                "chicken",
                ll,
                null,
                "<div style='font-size:1.0em;line-height:1.5em;'>" + feature.attributes['NomMasseDE']+ "</div>",
                null,
                false);
        }
        if (feature.popup) {
            viewer.getMap().addPopup(feature.popup,true);
        }
    }
}

/**
 * Function: outRiver
 * Called when a feature is unselected.
 *
 * Parameters:
 * feature - {<OpenLayers.Feature>}
 */
function outRiver(feature) {
    if (feature && feature.popup) {
        feature.popup.destroy();
        feature.popup= null;
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

    OpenLayers.Popup.FramedCloudMaxSize= OpenLayers.Class(OpenLayers.Popup.FramedCloud, {
        'autoSize': false,
        'maxSize': new OpenLayers.Size(200,100)
    });

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
    //                                       HTML div id, options
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

    //Loading of data layers
    //Chargement des couches de données
    viewer.addGeoportalLayers([
        'ORTHOIMAGERY.ORTHOPHOTOS',
        'GEOGRAPHICALGRIDSYSTEMS.MAPS'],
        {});

    viewer.getMap().setCenter(viewer.viewerOptions.defaultCenter,11);
    // cache la patience - hide loading image
    viewer.div.style[OpenLayers.String.camelize('background-image')]= 'none';

    /*
        http://services.sandre.eaufrance.fr/geo/zonage?SERVICE=WFS&VERSION=1.0.0&REQUEST=GetFeature&TYPENAME=RWBODY&FILTER=%3Cogc:Filter%3E%3Cogc:PropertyIsEqualTo%3E%3Cogc:PropertyName%3ERWBODY_ID%3C/ogc:PropertyName%3E%3Cogc:Literal%3E1%3C/ogc:Literal%3E%3C/ogc:PropertyIsEqualTo%3E%3C/ogc:Filter%3E

        http://services.sandre.eaufrance.fr/geo/zonage?SERVICE=WFS&VERSION=1.0.0&REQUEST=GetFeature&TYPENAME=RWBODY&FILTER=%3Cogc:Filter%3E%3Cogc:BBOX%3E%3Cogc:PropertyName%3EmsGeometry%3C/ogc:PropertyName%3E%3Cgml:Box%20srsName=%22EPSG:4326%22%3E%3Cgml:coordinates%3E1.6821163238082106,48.51932901958912%203.0084324721917888,49.202336096410875%3C/gml:coordinates%3E%3C/gml:Box%3E%3C/ogc:BBOX%3E%3C/ogc:Filter%3E

        <gml:featureMember>
          <sa:RWBODY>
            <gml:boundedBy>
                <gml:Box srsName="EPSG:4326">
                    <gml:coordinates>2.919781,48.581070 3.280034,48.793862</gml:coordinates>
                </gml:Box>
            </gml:boundedBy>
            <sa:msGeometry>
              <gml:MultiLineString srsName="EPSG:4326">
                <gml:lineStringMember>
                  <gml:LineString>
                    <gml:coordinates>...</gml:coordinates>
                  </gml:LineString>
                </gml:lineStringMember>
                <gml:lineStringMember>
                  <gml:LineString>
                    <gml:coordinates>...</gml:coordinates>
                  </gml:LineString>
                </gml:lineStringMember>
              </gml:MultiLineString>
            </sa:msGeometry>
            <sa:ID>1482.000000000000000</sa:ID>
            <sa:EU_CD>FRHR100</sa:EU_CD>
            <sa:NAME>L&#39;Yerres de sa source au confluent de l&#39;Yvron (inclus)</sa:NAME>
            <sa:MS_CD>HR100</sa:MS_CD>
            <sa:REGION_CD>13</sa:REGION_CD>
            <sa:SYSTEM>B</sa:SYSTEM>
            <sa:INS_BY>AESN</sa:INS_BY>
            <sa:BASIN_CD>FRH</sa:BASIN_CD>
            <sa:STATUS_YR>2006</sa:STATUS_YR>
            <sa:MODIFIED>N</sa:MODIFIED>
            <sa:ARTIFICIAL>N</sa:ARTIFICIAL>
            <sa:SIZE>92.000</sa:SIZE>
            <sa:ALT_CAT>LOW</sa:ALT_CAT>
            <sa:GEOL_CAT>C</sa:GEOL_CAT>
            <sa:SIZE_CAT>M</sa:SIZE_CAT>
            <sa:LAT>0.00000</sa:LAT>
            <sa:LON>0.00000</sa:LON>
            <sa:GEOLOGY></sa:GEOLOGY>
            <sa:CRITMDO>N</sa:CRITMDO>
            <sa:HYDROECOR>9</sa:HYDROECOR>
            <sa:CTX_PISCI>C</sa:CTX_PISCI>
            <sa:TYPE_FR>P9</sa:TYPE_FR>
            <sa:STRAHLER_M>4</sa:STRAHLER_M>
            <sa:STRAHLER_M>4</sa:STRAHLER_M>
            <sa:REF_IBGN>**</sa:REF_IBGN>
            <sa:REF_IBD>**</sa:REF_IBD>
            <sa:REF_IP>**</sa:REF_IP>
            <sa:REF_IBMR>**</sa:REF_IBMR>
            <sa:FILTER>FRHR100L&#39;YERRES DE SA SOURCE AU CONFLUENT DE L&#39;YVRON (INCLUS)</sa:FILTER>
            <sa:DATAFROM>18750009500026</sa:DATAFROM>
          </sa:RWBODY>
        </gml:featureMember>

        http://services.sandre.eaufrance.fr/geo/zonage?SERVICE=WFS&VERSION=1.0.0&REQUEST=DescribeFeatureType&TYPENAME=RWBODY&

        <?xml version='1.0' encoding="ISO-8859-1" ?>
        <schema
           targetNamespace="http://xml.sandre.eaufrance.fr/"
           xmlns:sa="http://xml.sandre.eaufrance.fr/"
           xmlns:ogc="http://www.opengis.net/ogc"
           xmlns:xsd="http://www.w3.org/2001/XMLSchema"
           xmlns="http://www.w3.org/2001/XMLSchema"
           xmlns:gml="http://www.opengis.net/gml"
           elementFormDefault="qualified" version="0.1" >

          <import namespace="http://www.opengis.net/gml"
                  schemaLocation="http://schemas.opengeospatial.net/gml/2.1.2/feature.xsd"
          />

          <element name="RWBODY"
                   type="sa:RWBODYType"
                   substitutionGroup="gml:_Feature" />

          <complexType name="RWBODYType">
            <complexContent>
              <extension base="gml:AbstractFeatureType">
                <sequence>

                  <element name="msGeometry" type="gml:GeometryPropertyType" minOccurs="0" maxOccurs="1"/>
                  <element name="RWBODY_ID" type="string"/>
                  <element name="ID" type="string"/>
                  <element name="EU_CD" type="string"/>
                  <element name="NAME" type="string"/>
                  <element name="MS_CD" type="string"/>
                  <element name="REGION_CD" type="string"/>
                  <element name="SYSTEM" type="string"/>
                  <element name="INS_WHEN" type="string"/>

                  <element name="INS_BY" type="string"/>
                  <element name="BASIN_CD" type="string"/>
                  <element name="STATUS_YR" type="string"/>
                  <element name="MODIFIED" type="string"/>
                  <element name="ARTIFICIAL" type="string"/>
                  <element name="SIZE" type="string"/>
                  <element name="ALT_CAT" type="string"/>
                  <element name="GEOL_CAT" type="string"/>
                  <element name="SIZE_CAT" type="string"/>

                  <element name="LAT" type="string"/>
                  <element name="LON" type="string"/>
                  <element name="GEOLOGY" type="string"/>
                  <element name="CRITMDO" type="string"/>
                  <element name="HYDROECOR" type="string"/>
                  <element name="CTX_PISCI" type="string"/>
                  <element name="TYPE_FR" type="string"/>
                  <element name="STRAHLER_M" type="string"/>
                  <element name="ITEM001" type="string"/>

                  <element name="REF_IBGN" type="string"/>
                  <element name="REF_IBD" type="string"/>
                  <element name="REF_IP" type="string"/>
                  <element name="REF_IBMR" type="string"/>
                  <element name="TAILLE_FR" type="string"/>
                  <element name="DATAFROM" type="string"/>
                  <element name="DATEFROM" type="string"/>
                </sequence>
              </extension>

            </complexContent>
          </complexType>

        </schema>

     */
    var rwbodyStyle= new OpenLayers.StyleMap({
        "default": new OpenLayers.Style({
            strokeColor:'#0000ff',
            strokeWidth:3
        }),
        "select": new OpenLayers.Style({
            strokeColor:'#3399ff',
            strokeWidth:3
        })
    });
    var sandre= viewer.getMap().addLayer(
        "WFS",

            /**
             * layer_name parameter
             * holds the text that will be displayed by the layers switcher
             * contient le texte qui sera affiché dans le gestionnaire de couches
             */
        'sandre.layer.name',

        // ce service utilise une vieille version de MapServer qui ne
        // supporte pas POST avec FILTER. Le Sandre travaille sur une
        // nouvelle version qui elle fonctionne (testée avec succès)!
        // on attend donc son passage en production (avec le même URL).
/* veille version
        "http://services.sandre.eaufrance.fr/geo/zonage?",
 */
/* url de test
        "http://services.sandre.eaufrance.fr/geotest/mdo_metropole?",
 */
/* url sandre ?
 */
        "http://services.sandre.eaufrance.fr/geo/mdo_FXX?",
        {
            /** wfs_parameters
             * holds all parameters needed to define the wfs
             * contient tous les paramètres nécessaires au paramétrage du service wfs
             */
/* veille version
            typename: 'RWBODY'
 */
            typename:'MasseDEauRiviere'
        },
        {
            /**
             * wfs_options
              * optional: holds information about the wms layer behavior
              * optionnel: contient les informations permettant d'affiner le comportement de la couche wfs
              */
            protocolOptions:{
                featurePrefix:'sa',
                featureNS:'http://xml.sandre.eaufrance.fr/',
                geometryName:'msGeometry'
            },
            projection:'EPSG:2154',
            units:'m',
            // maxExtent expressed in EPSG:2154 :
            maxExtent: new OpenLayers.Bounds(-58253.71015916939,6031824.7296808595,1181938.177574663,7233428.222339219),
            minZoomLevel:11,
            maxZoomLevel:16,
            originators: [
                {
                    logo:'sandre',
                    pictureUrl: 'img/logo_sandre.gif',
                    url: 'http://sandre.eaufrance.fr'
                }
            ],
            styleMap:rwbodyStyle,
            onSelect:overRiver,
            onUnselect:outRiver,
            hover:true
        }
        /**
        * options_popup
        * optional: holds information about the gpx popup behavior
        * optionnel: contient les informations permettant d'affiner le comportement des popups associées à la couche wfs
        */
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
