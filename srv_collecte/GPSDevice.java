package ws;

import java.util.Date;
import java.util.logging.Logger;
import java.util.logging.Level;
import java.util.Locale;
import java.util.Vector;
import java.util.Enumeration;
import java.nio.ByteBuffer;
import java.nio.ByteOrder;


public class GPSDevice {

	private String Id;
	private Date Date;
	private Double Longitude;
	private Double Latitude;
	private int Speed;
	private int Heading;
	private int Altitude;
	private String DateString;
	private static String Message;
	private static Logger logger = Logger.getLogger(ws.CollectServer.class.getName());;	
	public static int _numClient;

        // cette classe se charge de faire un parsing de la trame et de renvoyer un boolean
        // true alors la classe CollectClient pourra utiliser les methodes pour extraire les
        // proprietes de la geolocalisation  
        GPSDevice(int _nClient) {
                _numClient = _nClient;
                logger = Logger.getLogger(ws.CollectServer.class.getName());
        }


	public String getId() {
		return Id;
	}
	public void setId(String id) {
		this.Id = id;
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
	public static String getMessage() {
		return Message;
	}
	public static void setMessage(String message) {
		Message = new String(message);
	}
	public static boolean parseMessage(String stMessage) {
		return true;
	}

	public static String byteArrayToHexString(byte[] bArray,int nSize) {
		StringBuilder sb = new StringBuilder(nSize * 2);
	
		for (int i = 0; i < nSize ; i++) {
			sb.append(String.format("%02x",bArray[i]));
		}
		return sb.toString().toUpperCase();
	}

	public static long byteArrayToLong(byte[] bArray) {
		// le tableau de bytes doit contenir 8 bytes
		if (bArray.length != 8) {
			logger.log(Level.SEVERE,""+_numClient+" byteArrayToLong "+bArray.length);
			return -1;
		}
		ByteBuffer bb = ByteBuffer.wrap(bArray);
		// si on est en litteEndian on fera
		//bb.order(ByteOrder.LITTLE_ENDIAN);
		return bb.getLong();	
	}

	public static int byteArrayToInteger(byte[] bArray) {
		// le tableau de bytes doit contenir 4 bytes
		if (bArray.length != 4) {
			logger.log(Level.SEVERE,""+_numClient+" byteArrayToInteger "+bArray.length);
			return -1;
		}
		ByteBuffer bb = ByteBuffer.wrap(bArray);
		// si on est en litteEndian on fera
		//bb.order(ByteOrder.LITTLE_ENDIAN);
		return bb.getInt();	
	}

	public static short byteArrayToShort(byte[] bArray) {
		// le tableau de bytes doit contenir 2 bytes
		if (bArray.length != 2) {
			logger.log(Level.SEVERE,""+_numClient+" byteArrayToShort "+bArray.length);
			return -1;
		}
		ByteBuffer bb = ByteBuffer.wrap(bArray);
		// si on est en litteEndian on fera
		// bb.order(ByteOrder.LITTLE_ENDIAN);
		return bb.getShort();	
	}

	public static Vector<String> byteArrayToStrings(byte[] bArray, int nSize) {
		//
		Vector<String> values = new Vector<String>();	
		int j = 0;
		int count = nSize-1; // on a un test pour i et i+1
		// on va oter le caractere retour chariot et line feed 0x0D et 0xOA
		for (int i = 0; i < count ; i++) {
			if ((bArray[i] == 0x0D) && (bArray[i+1] == 0x0A)) {
				
				byte[] bvalue = new byte[i-j];
				System.arraycopy(bArray, j, bvalue, 0, (i-j));
				String st = new String(bvalue);
				logger.log(Level.INFO,""+_numClient+" traite chaine :j="+j+" i-j="+(i-j));
				logger.log(Level.INFO,""+_numClient+" traite chaine :"+st);
				logger.log(Level.INFO,""+_numClient+" longueur chaine :"+st.length());
				values.addElement(st);
				j = i+2;
				i++;
			} 
		}
		// on retourne un tableau de chaines de positions GPS
		return values;	
	}
	public static String byteArrayToString(byte[] bArray, int index, int nSize) {
		//
				
		byte[] bvalue = new byte[nSize];
		System.arraycopy(bArray, index, bvalue, 0, nSize);
		String st = new String(bvalue);
		logger.log(Level.INFO,""+_numClient+" traite chaine :"+st);
		logger.log(Level.INFO,""+_numClient+" longueur chaine :"+st.length());
		// on retourne une chaine de caracteres
		return st;	
	}
}

