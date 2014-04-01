
//Your IGN Géoportail Api Key
var ignApiKey = "039dzrv50i1j8f7ad3wg1b2y"; //039dzrv50i1j8f7ad3wg1b2y ou 1n0k1kdcpneae443vb3n9y2z


var start = "2014-03-29 10:00:00" ;
var end = "2014-03-30 12:30:00";
var starttime;
var endtime;
var startdate;
var enddate;

var linesFeatureLayer;


//set up the map
map = new L.Map('map');

// Openstreet Map Layer
var osmUrl="http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png";
var osmAttrib='Map data © OpenStreetMap contributors';
var osm = new L.TileLayer(osmUrl, {minZoom: 3, maxZoom: 18, attribution: osmAttrib});	

//IGN Topo Scan Express Standard
var scanWmtsUrl	= "http://gpp3-wxs.ign.fr/"+ignApiKey + "/wmts?LAYER=GEOGRAPHICALGRIDSYSTEMS.MAPS.SCAN-EXPRESS.STANDARD&EXCEPTIONS=text/xml&FORMAT=image/jpeg&SERVICE=WMTS&VERSION=1.0.0&REQUEST=GetTile&STYLE=normal&TILEMATRIXSET=PM&&TILEMATRIX={z}&TILECOL={x}&TILEROW={y}" ;
var SCAN25= new L.TileLayer(scanWmtsUrl, {attribution: '&copy; <a href="http://www.ign.fr/">IGN</a>'});

map.setView([45.761430,4.849951], 6);
map.addLayer(osm);

function onEachFeature(feature, layer) {
    // does this feature have a property named popupContent?
    if (feature.properties && feature.properties.name) {
        layer.bindLabel(feature.properties.name,{ noHide: true });
    }
}
function pointToLayer (feature, latlng) {
	if (feature.geometry.type=="Point"){
		return L.circleMarker(latlng, {
			radius: 5,
			fillColor: "#00008A",
			color: "#000",
			weight: 1,
			opacity: 1,
			fillOpacity: 0.8
		});	
	}

}

var webSocket = 
    new WebSocket('ws://localhost:8080/GPSPositions/websocketgpsbis');

  webSocket.onerror = function(event) {
    onError(event)
  };

  webSocket.onopen = function(event) {
    onOpen(event)
  };

  webSocket.onmessage = function(event) {
    onMessage(event)
  };

  function onMessage(event) {

      var geoJsonMessage = eval('(' + event.data + ')');
      
    linesFeatureLayer = L.geoJson(geoJsonMessage,{
  		onEachFeature: onEachFeature,
  		pointToLayer: pointToLayer
  	});
    linesFeatureLayer.addTo(map);
  }

  function onOpen(event) {

    webSocket.send(start+","+end);
  }

  function onError(event) {
    alert(event.data);
  }
  
  function updateDate(){

starttime = document.getElementById('starttime').value;
endtime = document.getElementById('endtime').value;
startdate = document.getElementById('startdate').value;
enddate = document.getElementById('enddate').value;

start = startdate.concat(" ").concat(starttime);
end = enddate.concat(" ").concat(endtime);
map.removeLayer(linesFeatureLayer);
webSocket.send(start+","+end);
  }
  