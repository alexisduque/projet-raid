package ws;

import java.util.Date;

public class SpeedLog {
	private int speed;
	private Date date;
	private String DateString;
	
	public int getSpeed() {
		return speed;
	}
	public void setSpeed(int speed) {
		this.speed = speed;
	}
	public Date getDate() {
		return date;
	}
	public void setDate(Date date) {
		this.date = date;
	}
	public String getDateString() {
		return DateString;
	}
	public void setDateString(String dateString) {
		DateString = dateString;
	}
	
}
