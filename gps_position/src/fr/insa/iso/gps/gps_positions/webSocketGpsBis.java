package fr.insa.iso.gps.gps_positions;

import java.io.IOException;
import java.util.Collections;
import java.util.Date;
import java.util.HashSet;
import java.util.Set;
import DataBaseController;
import javax.websocket.OnClose;
import javax.websocket.OnMessage;
import javax.websocket.OnOpen;
import javax.websocket.Session;
import javax.websocket.server.ServerEndpoint;

@ServerEndpoint("/websocketgpsbis")
public class webSocketGpsBis {

	
	  @OnMessage
	  public void onMessage(String message, Session session) 
	    throws IOException, InterruptedException {
		 
			String jsonMessage;
			jsonMessage = "{\"type\": \"FeatureCollection\",\"features\": [{\"type\": \"Feature\",\"geometry\": {\"type\": \"LineString\",\"coordinates\": [[5.334083,45.562371],[5.332856,45.562556],[5.33051,45.562415],[5.330433,45.561501],[5.332883,45.559683],[5.33313,45.558625],[5.329596,45.558721],[5.324071,45.559391]]},\"properties\": {\"popupContent\": \"This a track.\",},\"id\": 1},{\"type\": \"Feature\",\"geometry\": {\"type\": \"LineString\",\"coordinates\": [[4.872985,45.784615],[4.872643,45.784300],[4.872650,45.784308],[4.872605,45.784336],[4.872588,45.784358],[4.872646,45.784636],[4.872541,45.784861],[4.873115,45.784846],[4.873918,45.785475],[4.874371,45.785461],[4.874880,45.785763],[4.875061,45.785748],[4.875060,45.785748],[4.875393,45.785898],[4.875960,45.786093],[4.876391,45.786323]]},\"properties\": {\"popupContent\": \"This a track.\",},\"id\": 2},{\"type\": \"Feature\",\"geometry\": {\"type\": \"Point\",\"coordinates\":[4.872985,45.784615] },\"properties\": {\"name\": \"Coureur A\",\"date\":\"2014/09/07\",\"speed\":\"14\"},\"id\": 3},{\"type\": \"Feature\",\"geometry\": {\"type\": \"Point\",\"coordinates\":[5.334083,45.562371]},\"properties\": {\"name\": \"coureur B\",\"date\":\"2014/09/07\",\"speed\":\"12\"},\"id\": 3}]}";
		  DataBaseController dbcont = new DataBaseController();
		  String jsonTracks = dbcont.getAllTracks(startdate, endate);
		  
	    // Print the client message for testing purposes
	    System.out.println("Received: " + message);
	  
	    // Send the first message to the client
	    session.getBasicRemote().sendText(jsonMessage);
	  
	  }
	  
	  @OnOpen
	  public void onOpen() {
	    System.out.println("Client connected");
	  }

	  @OnClose
	  public void onClose() {
	    System.out.println("Connection closed");
	  }

}
