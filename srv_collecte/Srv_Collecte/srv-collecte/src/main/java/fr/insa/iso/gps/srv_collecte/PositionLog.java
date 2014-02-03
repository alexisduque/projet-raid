package fr.insa.iso.gps.srv_collecte;

import java.util.Date;

public class PositionLog {
	private String id;
	private Date Date;
	private Double Longitude;
	private Double Latitude;
	private int Speed;
	private int Heading;
	private int Altitude;
	private String DateString;
	
	public String getId() {
		return id;
	}
	public void setId(String id) {
		this.id = id;
	}
	public Date getDate() {
		return Date;
	}
	public void setDate(Date date) {
		Date = date;
	}
	public Double getLongitude() {
		return Longitude;
	}
	public void setLongitude(Double longitude) {
		Longitude = longitude;
	}
	public Double getLatitude() {
		return Latitude;
	}
	public void setLatitude(Double latitude) {
		Latitude = latitude;
	}
	public int getSpeed() {
		return Speed;
	}
	public void setSpeed(int speed) {
		Speed = speed;
	}
	public int getHeading() {
		return Heading;
	}
	public void setHeading(int heading) {
		Heading = heading;
	}
	public int getAltitude() {
		return Altitude;
	}
	public void setAltitude(int altitude) {
		Altitude = altitude;
	}
	
	public String getDateString() {
		return DateString;
	}
	public void setDateString(String dateString) {
		DateString = dateString;
	}
}

