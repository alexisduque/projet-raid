
/*
 * GeoTracker Web Service (c) O-Phone  2009-2010-2013
 * @author: Philippe Isorce
 * This four class are implementing all methods for searching ids, GPS positions and other things
 * from Oracle database.
 * You can test the following URL to get WSDL
 * http://localhost:8080/axis2/services/GeoTrackerService?wsdl
 * and the following URL to test getPositions method.
 * http://localhost:8080/axis2/services/GeoTrackerService/getPositions?id=1000000002&minDate=29/03/2008%20:%2008:00:00&maxDate=31/03/2009%20:%2012:00:00&maxResponse=10&OnlyMovingPositions=true
 * Enjoy it and return to me by email all possible bug to email adress : philippe.isorce@ophone.eu
 * Thanks.
 * 
 * Ph.I
 * 
 */

package fr.insa.iso.gps.srv_collecte;

import java.sql.ResultSet;
import java.sql.SQLException;
import java.io.FileInputStream;
import java.io.IOException;
import java.text.SimpleDateFormat;
import java.util.Properties;
import java.util.Date;
import java.util.logging.FileHandler;
import java.util.logging.Logger;
import java.util.logging.Formatter;
import java.util.logging.SimpleFormatter;
import java.util.logging.Handler;
import java.util.logging.Level;
import java.util.logging.LogRecord;

public class Test {
	//public static OracleDataBase n_DataBase;
	//public static MySQLDataBase n_DataBase;
	public static PostgreSQLDataBase n_DataBase;
	public static GeoTrackerService n_Service;
	public static String[] n_Ids;
	public static String n_user = "";
	public static String n_pass = "";
	private static Logger logger = Logger.getLogger(Test.class.getName());
	private static String n_log = "";
	public static void main (String[] args) {
		System.out.println("Test>>begin");
		TestLogger();
		//		TestSplit();
		TestDb();
		//		TestString();
	}
	/*
	 * Methodes pour les tests
	 */
	public static void TestDb()
	{
		//n_DataBase = new OracleDataBase();
		n_DataBase = new PostgreSQLDataBase();
		//n_DataBase = new MySQLDataBase();
		n_Service = new GeoTrackerService();
		// user and pass are optional temporary
		n_DataBase.setUserName(n_user);
		n_DataBase.setPassword(n_pass);
		System.out.println("Test>>trying to connect to database");
		if (n_DataBase.Connect())
		{
			String requestCount = "SELECT count(*) FROM gps_positions";
			//String requestCount = "SELECT count(*) FROM tracker";
			String sql = "SELECT id FROM gps_positions group by id order by id asc";
			// 356307040837709,20120703180105,4.8801632,45.7867008,0,0,193.0,6,0
			// IMEI, DateString, Longitude, Latitude, Speed, Heading,Altitude, nbSat, Event
			//String sqlpos = "SELECT EPILOTE_IDT || ',' || TO_CHAR(TIME_STP,\'YYYYMMDDHH24MISS\') || ',' || REPLACE(TO_CHAR(longitude),\',\',\'.\') || ',' || REPLACE(TO_CHAR(latitude),\',\',\'.\')  || ',' || speed || ',' || heading || ',' || altitude || ',' || nbsat || ',' || 0 FROM gps_positions WHERE epilote_idt = \'1000000001\' ORDER BY TIME_STP ASC"; 

			ResultSet rs=n_DataBase.Requete(requestCount);

			try {
				rs.next();
				// c est le resultat du count donc un entier
				System.out.println(rs.getInt(1)+" positions");
				n_Ids = new String[rs.getInt(1)];

				rs = n_DataBase.Requete(sql);
				int i=0;
				System.out.println("liste des trackers");
				while(rs.next())
				{
					n_Ids[i] = rs.getString(1);
					System.out.println("id:"+n_Ids[i]);
					i++;
				}
				// Affiche les 30 dernières positons

				String sqlpos = "select ID, HEADING, SPEED, LONGITUDE, LATITUDE , ALTITUDE, NBSAT, TIME_STP from GPS_POSITIONS order by ID, TIME_STP DESC";

				rs = n_DataBase.Requete(sqlpos);
				i=0;
				System.out.println("un extrait de la liste des positions");
				while(rs.next())
				{
					// on va obtenir une string avec le format que on lit sur une trame Nomadic
					double lat = rs.getDouble(3);
					double lon = rs.getDouble(4);
					int speed = rs.getInt(5);
					System.out.println(rs.getString(1)+" ["+rs.getString(2)+"] ("+
							lat+" "+lon+" "+speed+")");
					if (i > 10)
						break;
					i++;
				}

			} catch (SQLException e) {
				System.out.println("Test>>error");
				e.printStackTrace();
			}
			try {
				rs.close();
			} catch (SQLException e) {
				System.out.println("Test>>error");
				e.printStackTrace();
			}
			/*
			n_Ids = n_Service.getIds("","");
			for (int i = 0;i < n_Ids.length-1;i++)
				System.out.println("id:"+n_Ids[i]);
			PositionLog[] pos = new PositionLog[10];
			pos = n_Service.getPositions(n_Ids[2], "2008-03-29:00:00:00","2008-03-31:19:00:00",10, true);
			System.out.println(pos.length+" positions");
			for (int i = 0;i < pos.length-2;i++) 
				System.out.println( pos[i].getId()+","+pos[i].getDateString());
			 */	
			n_DataBase.Close();

		} else {
			System.out.println("Test>>Cannot connect to our DataBase");
		}
	}
	public static void TestSplit()
	{
		String message = "1000000001,20120607205431,4.881658,45.780070,0,270,227,4,2";
		String[] param;
		String separator = ",";
		param = message.split(separator);
		System.out.println("length="+param.length);
		for (int i = 0;i < param.length;i++) {
			System.out.println(param[i]);
		}

	}
	public static void TestLogger()
	{
		FileHandler fh;
		//String fileLog = "geotracker.log";
		Properties props = new Properties();
		try {
			// le fichier de proprietes doit se trouve a la racine du package ws
			props.load(new FileInputStream("src/main/resources/geotracker.properties"));
			n_log = props.getProperty("LOG");
		} catch (IOException e) {
			e.printStackTrace();
			System.out.println("impossible de trouver le fichier properties");
		}

		// pour stopper les logs sur la console ou les parents
		logger.setUseParentHandlers(false);
		// pour acepter tous les niveaux
		logger.setLevel(Level.ALL);
		try {
			// le log sera ecrit sous la racine du package
			fh = new FileHandler(n_log, true);
			System.out.println("le logger est stocke dans "+ n_log);
			// on implemente son propre formatter sur le handle du fichier de log
			fh.setFormatter(new Formatter() {
				public String format(LogRecord record) {
					SimpleDateFormat sdf = new SimpleDateFormat("MMM dd,yyyy HH:mm");
					long mil = record.getMillis();
					Date resultdate = new Date(mil);
					return resultdate +" " 
					+ record.getLevel() + " "
					+ record.getSourceClassName() + " "
					+ record.getSourceMethodName() + " "
					+ record.getMessage() + "\n";
				}
			});
			// et on affecte ce formatter au logger
			logger.addHandler(fh);
			/*
			// SimpleFormatter genere des messages sous forme texte
      			SimpleFormatter formatter = new SimpleFormatter();
			// on choisit le mode log texte et non XML
      			fh.setFormatter(formatter);
			 */
			// exemples de messages de log
			logger.log(Level.WARNING,"attention ceci est un message ");
			logger.log(Level.INFO,"ceci est un message d information");
			logger.log(Level.SEVERE,"ceci est une erreur critique");
			System.out.println("le log a ete mis a jour");
		} catch (SecurityException e) {
			e.printStackTrace();
		} catch (IOException e) {
			e.printStackTrace();
		}
	}
	public static void TestString()
	{
		long val1 = 4854668;
		long val2 = 45785901;
		long val3 = 2022;
		double longitude =  0.0;
		double latitude = 0.0;
		double altitude = 0.0;

		// pour ne pas perdre la precision on indique que le denominateur est un douvle
		longitude = val1/1000000d;
		latitude = val2/1000000d;
		altitude = val3/1000d;

		System.out.println("sans format:"+longitude+":"+latitude+":"+altitude);
		System.out.println("avec format GPS:"+String.format("%.6f",longitude)+":"+
				String.format("%.6f",latitude)+":"+
				String.format("%.1f",altitude));

	}

}

