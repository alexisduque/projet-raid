/*
 * Copyright (c) 2008-2013 Institut National de l'information Geographique et forestiere France, released under the
 * BSD license.
 */
// the viewer variable is declared by the API through the instance parameter
viewer= null;

window.onload = loadGeoRM();

function loadGeoRM() {
	
    if (checkApiLoading('loadGeoRM();',['OpenLayers','Geoportal','Geoportal.Viewer','Geoportal.Viewer.Default'])===false) {
        return;
    }
    
    Geoportal.GeoRMHandler.getConfig(['nhf8wztv3m9wglcda6n6cbuf'] null,null , {
    	onContractsComplete : function (){
        //The api is loaded at this step
        //L'api est chargée à cette étape
 
        //add translations
        translate();
        
        var options = {
        				mode : 'normal',
        				territory : 'FXX',
        				proxy : '/geoportail/api/xmlproxy'+'?url='
        				};

        var viewer= new Geoportal.Viewer.Default('viewerDiv',OpenLayers.Util.extend(
                options,
                window.gGEOPORTALRIGHTSMANAGEMENT===undefined?
                    {'apiKey':key}
                :   gGEOPORTALRIGHTSMANAGEMENT)
            );
        
        if (!viewer) {
            OpenLayers.Console.error(OpenLayers.i18n('new.instance.failed'));
            return;
        }
        viewer.addGeoportalLayers([
            'ORTHOIMAGERY.ORTHOPHOTOS',
            'GEOGRAPHICALGRIDSYSTEMS.MAPS'],
            {
            });
        viewer.getMap().setCenter(viewer.viewerOptions.defaultCenter,viewer.viewerOptions.defaultZoom);
    }}
    );
}


