package fr.insa.iso.gps.gps_positions;

import java.io.StringReader;
import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Statement;
import java.util.Date;

import javax.json.*;
import javax.naming.Context;
import javax.naming.InitialContext;

public class DataBaseController {

	
	public static String getAllTrackers (Date startdate, Date endate){
		System.out.println("getAllTrackers");
		return null;
	}
	
	public String getAllTracks (String startdate, String endate){
		System.out.println("getAllTracks");
		Connection m_Connection;
    	Statement m_Statement;
    	String m_Driver;
    	String m_Address;
    	String m_Port;
    	String m_Compte;
    	String m_UserName;
    	String m_Password;
    	String m_Url;
    	String sql;
    	String json;
    	
    	m_Url =  "jdbc:postgresql://gps-iso.insa-lyon.fr:5432/geoloc";
		m_Driver = "org.postgresql.Driver";
		m_UserName = "geoloc";
		m_Password = "raid$2014";
		m_Connection = null;
		
		json="{}";
		
		try {
			Context context = new InitialContext();
			Class.forName(m_Driver);
			m_Connection = DriverManager.getConnection(m_Url, m_UserName, m_Password);
			m_Statement = m_Connection.createStatement();
			sql = new String("select ID, LONGITUDE, LATITUDE, TIME_STP from GPS_POSITIONS "+ 
	        "where TIME_STP BETWEEN '"+startdate+"' AND '"+endate+"' order by ID, TIME_STP DESC" );
			System.out.println("SQL = "+sql );
			ResultSet rs = m_Statement.executeQuery(sql);
			

			
			
			JsonArrayBuilder features = Json.createArrayBuilder();
			
			JsonObjectBuilder feature = Json.createObjectBuilder();
			
			JsonObjectBuilder properties = Json.createObjectBuilder();
			
			JsonObjectBuilder geometry = Json.createObjectBuilder();
			
			JsonArrayBuilder coordinates = Json.createArrayBuilder();
			
			String idinit = "";
			while(rs.next()){
				String id = rs.getString("id");
				double latitude = rs.getDouble("latitude");
				double longitude = rs.getDouble("longitude");
				java.sql.Date date = rs.getDate("time_stp");
				if (idinit.equals(id) == false && idinit.equals("") == false){
					System.out.println("initid "+idinit+"  id "+id);
					geometry.add("type", "LineString");
					geometry.add("coordinates", coordinates.build());
					properties.add("popupContent",idinit);
					feature.add("type", "Feature");
					feature.add("geometry", geometry.build());
					feature.add("properties", properties.build());
					feature.add("id", idinit);
					features.add(feature.build());
					//On initialise tous les objets utilisés
					feature = Json.createObjectBuilder();
					geometry = Json.createObjectBuilder();
					coordinates = Json.createArrayBuilder();
					properties = Json.createObjectBuilder();
					
				}
				
				idinit = id;
				JsonArrayBuilder coordinate = Json.createArrayBuilder();
				coordinate.add(longitude);
				coordinate.add(latitude);
				coordinates.add(coordinate.build());
				
				
			}
			geometry.add("type", "LineString");
			geometry.add("coordinates", coordinates.build());
			properties.add("popupContent",idinit);
			feature.add("type", "Feature");
			feature.add("geometry", geometry.build());
			feature.add("properties", properties.build());
			feature.add("id", idinit);
			features.add(feature.build());
			


			JsonObjectBuilder objectBuilder = Json.createObjectBuilder();
			objectBuilder.add("type", "FeatureCollection");
			objectBuilder.add("features", features.build());
			
			JsonObject object = objectBuilder.build();
			json=object.toString();
			
		} catch (Exception e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		}
		
		
		return json;
		
	}
	
	public static String getLastPoints (){
		System.out.println("getLastPoints");
		return null;
	}

}
