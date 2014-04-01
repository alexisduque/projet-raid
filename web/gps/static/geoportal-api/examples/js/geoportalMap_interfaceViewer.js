/*
 * the interfaceViewer instance
 */
var iv;

/**
 * display events information in textarea
 */
var events = [];
function changeEventText(str){
    var d = new Date();
    str = '(' + d.getHours() + 'h' + d.getMinutes() + ':' + d.getSeconds() + '.' + d.getMilliseconds() + ') ' + str;
    events.unshift(str);
    if (events.length == 20) {
        events.pop();
    }
    str = '<li>';
    str += events.join('</li><li>');
    str += '</li>';
    document.getElementById("events").innerHTML = str;
}

/* Events registration
 * This function is called by the loader on viewer creation complete.
 */
function viewerLoaded(){
    iv.addEvent("centerchanged",centerChanged);
    iv.addEvent("zoomchanged",zoomChanged);
    iv.addEvent("layerchanged",layerChanged);
    iv.addEvent("layeradded",layerAdded);
    iv.addEvent("layerremoved",layerRemoved);
    iv.addEvent("componentchanged",componentChanged);
}
/* Events action
 * These functions are executed when an event occured (the event is dispatched by the JS API).
 */
function componentChanged(evt){
    changeEventText(evt.componentName+' : iconified='+evt.componentIconified);
}
function centerChanged(evt){
    //console.log("centerchanged",evt);
    changeEventText(evt.type+' : lon='+evt.dx+', lat='+evt.dy);
}
function zoomChanged(evt){
    //console.log("zoomchanged",evt);
    changeEventText(evt.type+' : zoomLevel='+evt.zoomLevel+', resolution='+evt.resolution);
}
function layerChanged(evt){
    changeEventText(evt.type+' : name='+evt.layerName+', opacity='+evt.layerOpacity+', visibility='+evt.layerVisibility);
}
function layerAdded(evt){
    changeEventText(evt.type+' : name='+evt.layerName);
}
function layerRemoved(evt){
    changeEventText(evt.type+' : name='+evt.layerName);
}

/*
 * center the view to Italy using sexagesimal degrees
 */
function centerToSexa(){
    iv.setCenter("2°21'36","48°51'18");
}
/*
 * center the view to the location entered by the user in text field
 */
function centerToLocation(){
    iv.setCenterAtLocation({address:document.getElementById("addressInput").value});
}

/*
 * center the view to the place entered by the user in text field
 */
function centerToPlace(){
    iv.setCenterAtLocation({place:document.getElementById("placeInput").value});
}

/*
 * set the API keys entered by the user in text field
 */
function setApiKeys(){
    var keys = document.getElementById("keysInput").value;
    iv.setKeys(keys.split(','));
}
function getControlByClass(classname){
    var controls = iv.getViewer().getMap().getControlsByClass(classname);
    if (!controls || controls.length==0) { return null; }
    return controls[0];
}
function getControlIdByClass(classname){
    var control = getControlByClass(classname);
    return control ? control.id : '';
}

/*
 * get the layerSwitcher control id
 */
function getLayerSwitcherId(){
    return getControlIdByClass("Geoportal.Control.LayerSwitcher");
}

/*
 * get the toolBox control id
 */
function getToolBoxId(){
    return getControlIdByClass("Geoportal.Control.ToolBox");
}

/*
 * get the navigation control id
 */
function getNavigationControlId(){
    return getControlIdByClass("OpenLayers.Control.Navigation");
}
/*
 * get the layerCatalog control id
 */
function getLayerCatalogControlId(){
    return getControlIdByClass("Geoportal.Control.LayerCatalog");
}

function modifyNavigationControl(){
    iv.modifyComponent(getNavigationControlId(),{ zoomWheelEnabled : false });
    var navCtrl = getControlByClass("OpenLayers.Control.Navigation");
    if(navCtrl){
        navCtrl.deactivate();
        navCtrl.activate();
    }
}
function modifyTOS(){
    iv.modifyComponent(getControlIdByClass("Geoportal.Control.TermsOfService"),{ tosURL : 'http://www.geoportail.fr/' });
    var tosCtrl = getControlByClass("Geoportal.Control.TermsOfService");
    if(tosCtrl){
        tosCtrl.draw();
    }
}
/*
 * add an external layer
 */
function addWMSLayer(){
    iv.addLayer({
        type:"WMS",
        name:'Eaux potables',
        url:"http://services.sandre.eaufrance.fr/geo/zonage-shp?",
        params:{//paramètres_du_wms: contient tous les paramètres nécessaires au paramétrage du service WMS
            layers:'PROTAREAD',
	    format:'image/png',
	    transparent:'true'
        },
        options:{ //options_couche: contient les paramètres pour gérer le comportement de la couche WMS
            singleTile:false,
            //projection:'EPSG:2154',
            //units:'m',
            projection:'EPSG:4326',
            minZoomLevel: 5,
            maxZoomLevel:15,
            opacity:1,
            isBaseLayer: false,
            visibility: true,
            originators:[
                {
                    logo:'sandre',
                    pictureUrl: 'img/logo_sandre.gif',
                    url: 'http://sandre.eaufrance.fr'
                }
            ]
        }
    });
}

/*
 * add two external layers
 */
function addWMSLayers(){
    iv.addLayers([
        {
        type:"WMS",
        name:"Rivières principales",
        url:"http://services.sandre.eaufrance.fr/geo/zonage-shp?",
        params:{//paramètres_du_wms: contient tous les paramètres nécessaires au paramétrage du service WMS
            layers:'RWBODYMAIN',
            format:'image/png',
            transparent:'true'
        },
        options:{ //options_couche: contient les paramètres pour gérer le comportement de la couche WMS
            singleTile:false,
            //projection:'EPSG:2154',
            //units:'m',
            projection:'EPSG:4326',
            minZoomLevel: 5,
            maxZoomLevel:15,
            opacity:1,
            isBaseLayer: false,
            visibility: true,
            originators:[
                {
                    logo:'sandre',
                    pictureUrl: 'img/logo_sandre.gif',
                    url: 'http://sandre.eaufrance.fr'
                }
            ]
        }},
        {
        type:"WMS",
        name:"Masse d'eau cotière",
        url:"http://services.sandre.eaufrance.fr/geo/zonage-shp?",
        params:{//paramètres_du_wms: contient tous les paramètres nécessaires au paramétrage du service WMS
            layers:'CWBODY',
            format:'image/png',
            transparent:true
        },
        options:{ //options_couche: contient les paramètres pour gérer le comportement de la couche WMS
            singleTile:false,
            //projection:'EPSG:2154',
            //units:'m',
            projection:'EPSG:4326',
            minZoomLevel: 5,
            maxZoomLevel:15,
            opacity:1,
            isBaseLayer: false,
            visibility: true,
            originators:[
                {
                    logo:'sandre',
                    pictureUrl: 'img/logo_sandre.gif',
                    url: 'http://sandre.eaufrance.fr'
                }
            ]
        }}]
            );
}

window.onload= function() {
    // Call the IGN loader
    iv = Geoportal.load(
        // div's ID:
        'viewerDiv',
        // API's keys:
        ['nhf8wztv3m9wglcda6n6cbuf'],
        {// map's center :
            // longitude:
            lon:2.731525,
            // latitude:
            lat:45.833333
        },null,{
        language:'fr',
        //geormUrl:null,
        geormUrl:'',
        onView:viewerLoaded,
        proxyUrl:'/geoportail/api/xmlproxy'+'?url=',
        //territory: 'REU',
        //layers: ['ORTHO_JPEG_EPSG_3857_2008_974:WMTS'/*,'BDP_PNG_MERCATOR_D974:WMTS'*/],
        //layers: ['sde:chef_lieu:WMS'],
        viewerClass: Geoportal.Viewer.Default,
        }
    );
};
