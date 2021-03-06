package fr.insa.iso.gps.srv_collecte;

/*
 * GeoTracker Web Service (c) O-Phone  2009-2010
 * @author: Philippe Isorce
 * This four class are implementing all methods for searching ids, GPS positions and other things
 * from Oracle database.
 * You can test the following URL to get WSDL
 * http://localhost:8080/axis2/services/GeoTrackerService?wsdl
 * and the following URL to test getPositions method.
 * http://localhost:8080/axis2/services/GeoTrackerService/getPositions?id=1000000002&minDate=29/03/2008%20:%2008:00:00&maxDate=31/03/2009%20:%2012:00:00&maxResponse=10&OnlyMovingPositions=true
 * Enjoy it and return to me by email all possible bug to email adress : ph.isorce@toutophone.com
 * Thanks.
 * 
 * Ph.I
 * 
 */
import java.sql.ResultSet;
import java.sql.SQLException;
import java.text.DateFormat;
import java.text.DecimalFormat;
import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.Calendar;
import java.util.Date;
import java.util.List;
import java.util.Locale;
import java.util.TimeZone;
import java.util.logging.Logger;
import java.util.logging.Level;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

public class GeoTrackerService {

    private PostgreSQLDataBase m_DataBase;

    private String m_Release = "hello geotracker! release is 3.0.1 (c) Ph. Isorce";
    private String[] m_Names = new String[2];
    private int[] m_Numbers = new int[2];
    private String[] m_Ids;
    private static Logger logger = Logger.getLogger(CollectServer.class.getName());
    private static String n_log = "";
    private static String l_log = ""; // recevra le niveau du logger

    //------------ WEB SERVICE METHODS ---------------
    public String[] getIds(String user, String pass) {

        m_DataBase = new PostgreSQLDataBase();
        // user and pass are optional temporary
        m_DataBase.setUserName(user);
        m_DataBase.setPassword(pass);
        if (m_DataBase.Connect()) {
            String requestCount = "SELECT count(*) FROM vehicules";
            String sql = "SELECT tracker_id FROM trackers order by tracker_id asc";

            ResultSet rs = m_DataBase.Requete(requestCount);

            try {
                rs.next();
                m_Ids = new String[rs.getInt(1)];

                rs = m_DataBase.Requete(sql);
                int i = 0;
                while (rs.next()) {
                    m_Ids[i] = rs.getString(1);
                    i++;
                }
            } catch (SQLException e) {
                e.printStackTrace();
            }
            try {
                rs.close();
            } catch (SQLException e) {
                e.printStackTrace();
            }
            m_DataBase.Close();

        } else {
            // just to return valid values if no database is connected
            m_Ids = new String[1];
            m_Ids[0] = "Database can't be connected, sorry";
        }
        return m_Ids;
    }

    public PositionLog getLastPosition(String id) {
        PositionLog lastPositionLog;

        lastPositionLog = new PositionLog();
        lastPositionLog.setId(id);
        /* Oracle 
         m_DataBase = new OracleDataBase();		
         */
        m_DataBase = new PostgreSQLDataBase();
        if (m_DataBase.Connect()) {
            String sql = "SELECT * FROM gps_positions "
                    + "where time_stp=(select max(time_stp)from gps_positions "
                    + "where idt=\'" + id + "\')";
            ResultSet rs1 = m_DataBase.Requete(sql);
            try {
                while (rs1.next()) {
                    lastPositionLog.setDateString(rs1.getString("time_stp"));
                    lastPositionLog.setDate(rs1.getDate("time_stp"));
                    lastPositionLog.setAltitude(rs1.getInt("altitude"));
                    lastPositionLog.setHeading(rs1.getInt("heading"));
                    lastPositionLog.setLatitude(rs1.getDouble("latitude"));
                    lastPositionLog.setLongitude(rs1.getDouble("longitude"));
                    lastPositionLog.setSpeed(rs1.getInt("speed"));
                }
                rs1.close();
            } catch (SQLException e) {
                e.printStackTrace();
            }
        }

        m_DataBase.Close();
        return lastPositionLog;
    }

    public SpeedLog getMaxSpeed(String id) {
        SpeedLog maxSpeed = new SpeedLog();
        //m_DataBase = new OracleDataBase();
        m_DataBase = new PostgreSQLDataBase();
        if (m_DataBase.Connect()) {
            String sql = "SELECT * FROM gps_positions "
                    + "where speed=(select max(speed)from gps_positions "
                    + "where idt=\'" + id + "\')";
            ResultSet rs = m_DataBase.Requete(sql);

            try {
                while (rs.next()) {
                    maxSpeed.setDate(rs.getDate("time_stp"));
                    maxSpeed.setDateString(rs.getString("time_stp"));
                    maxSpeed.setSpeed(rs.getInt("speed"));
                }
                rs.close();
            } catch (SQLException e) {
                e.printStackTrace();
            }
        }
        m_DataBase.Close();
        return maxSpeed;
    }

    public PositionLog[] getPositions(String id, String minDate, String maxDate,
            int maxResponse, boolean OnlyMovingPositions) {
        // The last element must be null. If it is not, then the response reached its maxResponse limit

        List<PositionLog> listPos = new ArrayList<PositionLog>();
        m_DataBase = new PostgreSQLDataBase();

        if (m_DataBase.Connect()) {

            String sql = "SELECT count(*) FROM gps_positions "
                    + "where idt=\'" + id + "\' AND time_stp BETWEEN '"
                    + minDate + "\' AND \'" + maxDate
                    + "\' ORDER BY time_stp asc";

            ResultSet rs = m_DataBase.Requete(sql);
            int i = 0;
            try {
                PositionLog currPosition;
                PositionLog oldPosition = null;
                while (rs.next() && i <= maxResponse) {
                    currPosition = new PositionLog();
                    currPosition.setId(rs.getString("idt"));
                    currPosition.setDateString(rs.getString("time_stp"));
                    currPosition.setDate(rs.getDate("time_stp"));
                    currPosition.setAltitude(rs.getInt("altitude"));
                    currPosition.setHeading(rs.getInt("heading"));
                    currPosition.setLatitude(rs.getDouble("latitude"));
                    currPosition.setLongitude(rs.getDouble("longitude"));
                    currPosition.setSpeed(rs.getInt("speed"));
                    if (OnlyMovingPositions) {
                        if (oldPosition != null) {
                            if (!IsSamePosition(currPosition, oldPosition)) {
                                //positions[i] = currPosition;
                                listPos.add(currPosition);
                                oldPosition = currPosition;
                                i++;
                            }
                        } else {
                            oldPosition = currPosition;
                            //positions[i] = currPosition;
                            // adding position in list
                            listPos.add(currPosition);
                            i++;
                        }
                    } else {
                        //positions[i] = currPosition;
                        listPos.add(currPosition);
                        i++;
                    }
                }
            } catch (SQLException e) {
                e.printStackTrace();
            }
        }
        PositionLog[] positions = new PositionLog[listPos.size()];

        //System.out.println(positions[0].getId());
        m_DataBase.Close();
        int i = 0;
        for (PositionLog lpos : listPos) {
            positions[i] = lpos;
        }
        return positions;
    }

    public PostgreSQLDataBase getDataBase() {
        return m_DataBase;
    }

    public void setDataBase(PostgreSQLDataBase n_DataBase) {
        this.m_DataBase = n_DataBase;
    }

    private boolean IsSamePosition(PositionLog position1, PositionLog position2) {
        double currLongitude = position1.getLongitude();
        double oldLongitude = position2.getLongitude();
        double currLatitude = position1.getLatitude();
        double oldLatitude = position2.getLatitude();

        if ((currLongitude == oldLongitude) && (currLatitude == oldLatitude)) {
            return true;
        } else {
            return false;
        }
    }

    // methode pour enregistrer la position GPS recue depuis le device
    public int insertPosition(String message) {
        // parametres qui seront inseres dans la base de donnees
        String gpsId = null;
        String gpsDate = null;
        String gpsDateD = null;
        Double gpsLongitude = null;
        Double gpsLatitude = null;
        Integer gpsSpeed = null;
        Integer gpsHeading = null;
        Double gpsAltitude = null;
        Integer gpsNbsat = null;
        Integer gpsEvent = null;
        int result = 0;
        // constantes 
        final int EVENT_GPS = 0;
        final int NB_SAT = 4;
        final int ERROR_POS = -1;
        final int NB_PARAMS_NS90 = 9; // Nomadic NS90 personnal
        final int NB_PARAMS_NS10 = 14; // Nomadic NS10 embedded

        //   Date systeme
        Date dateS = new Date();
        //    1. Choix de la langue
        Locale locale = Locale.getDefault();
        /**
         * 2. Construction du DateFormat en choisissant un format : SHORT =
         * 01/01/2002 FULL = lundi 1 janvier 2002 le premier format est FULL, le
         * deuxieme est adapte a Oracle
         */
        DateFormat dateFormat = DateFormat.getDateInstance(DateFormat.FULL, locale);
        DateFormat dateFormatO = new SimpleDateFormat("dd/MM/yyyy:hh:mm:ss");
        //    3. Affichage de la date et de l'heure dans la reponse HTTP

        logger.log(Level.INFO, "date : " + dateFormat.format(dateS));
        logger.log(Level.INFO, "traitement insertionPosition:" + message);
        /* on va parcourir la liste des parametres du message recu

         pour un NS90 : 1000000001,20120607205431,4.881658,45.780070,0,270,227,4,2
         pour un NS10 : 2000000001,20120630065053,4.882276,45.780171,0,0,0,6,2,0.0,0,0.01,0.01,0
         */
        String[] params = message.split(",");
        if ((params.length != NB_PARAMS_NS10) && (params.length != NB_PARAMS_NS90)) {
            logger.log(Level.SEVERE, "message contains " + params.length);
            logger.log(Level.SEVERE, "message not GPS location " + message);
            return ERROR_POS;
        }
        gpsId = new String(params[0]);
        gpsDate = params[1];
        // gpsDate
        // AAAAMMJJHHMMSS on doit la convertir en 'DD/MM/YYYY:HH24:MI:SS'
        gpsDateD = new String("");
        if (gpsDate.length() == 14) {
            gpsDateD
                    = new String(gpsDate.substring(6, 8) + "/" + gpsDate.substring(4,
                                    6)
                            + "/" + gpsDate.substring(0, 4) + ":"
                            + gpsDate.substring(8, 10) + ":"
                            + gpsDate.substring(10, 12) + ":"
                            + gpsDate.substring(12, 14));
            //System.out.println(">>"+gDateD);
        } else {
            gpsDateD = new String(dateFormatO.format(dateS));
        }
        // autres parametres
        gpsLongitude = Double.parseDouble(params[2]);
        gpsLatitude = Double.parseDouble(params[3]);
        gpsSpeed = Integer.parseInt(params[4]);
        gpsHeading = Integer.parseInt(params[5]);
        gpsAltitude = Double.parseDouble(params[6]);
        gpsNbsat = Integer.parseInt(params[7]); // maintenant c est utilise
        gpsEvent = Integer.parseInt(params[8]);

        if (gpsNbsat < NB_SAT) {
            logger.log(Level.WARNING, "GPS position not valid < " + gpsNbsat + " satellite(s) :" + message);
            return ERROR_POS;
        }
        /*
         if (gpsEvent != EVENT_GPS) {
         System.out.println("event other than GPS position = "+gpsEvent+ "event :"+message);
         return ERROR_POS;			
         }
         */
        m_DataBase = this.getDataBase();
        if (m_DataBase.Connect()) {
            /*Requete SQL de type Update*/
            String sql
                    = "insert into GPS_POSITIONS (ID, HEADING, SPEED, LONGITUDE, LATITUDE , ALTITUDE, NBSAT, TIME_STP ) values ("
                    + "'" + gpsId + "'" + "," + gpsHeading + "," + gpsSpeed + "," + gpsLongitude + ","
                    + gpsLatitude + "," + gpsAltitude + "," + gpsNbsat + "," + "'" + gpsDateD + "')";

            logger.log(Level.INFO, "SQL:" + sql + ":END:");
            //result = m_DataBase.Update(sql);
            result = m_DataBase.Update(sql);
            if (result == 0) {
                logger.log(Level.INFO, "Status = OK");
            } else {
                logger.log(Level.WARNING, "Status = NOK");
            }
            m_DataBase.Close();
        } else {
            logger.log(Level.WARNING, "disable to connect to database");
        }
        return result;
    }

    public int insertTKPosition(String message, String gpsID) {

        Pattern pattern = Pattern.compile(
                "\\[.\\d{10}.\\(\\p{Upper}+"
                + "(\\d{2})(\\d{2})(\\d{2})" + // Time (HHMMSS)
                "([AV])" + // Validity
                "(\\d{2})(\\d{2}\\.\\d{4})" + // Latitude (DDMM.MMMM)
                "([NS])"
                + "(\\d{3})(\\d{2}\\.\\d{4})" + // Longitude (DDDMM.MMMM)
                "([EW])"
                + "(\\d{3}\\.\\d{3})" + // Speed
                "(\\d{2})(\\d{2})(\\d{2})" + // Date (DDMMYY)
                "\\d+\\)\\]");

        // parametres qui seront inseres dans la base de donnees
        String gpsId = null;
        String gpsDate = null;
        String gpsDateD = null;
        Double gpsLongitude = null;
        Double gpsLatitude = null;
        Integer gpsSpeed = null;
        Integer gpsHeading = null;
        Double gpsAltitude = null;
        Integer isGpsValid;
        Integer gpsNbsat = null;
        Integer gpsEvent = null;
        Integer hour, minute, sec, day, month, year;
        int result = 0;
        // constantes 
        final int EVENT_GPS = 0;
        final double MILE = 1.609344;
        final int NB_SAT = 4;
        final int ERROR_POS = -1;
        final int NB_PARAMS_NS90 = 9; // Nomadic NS90 personnal
        final int NB_PARAMS_NS10 = 14; // Nomadic NS10 embedded
        DecimalFormat f = new DecimalFormat();
	f.setMaximumFractionDigits(6);
        //   Date systeme
        Date dateS = new Date();

        Locale locale = Locale.getDefault();

        //DateFormat dateFormat = DateFormat.getDateInstance(DateFormat.FULL, locale);
        DateFormat dateFormat = new SimpleDateFormat("dd/MM/yyyy:HH:mm:ss");
        logger.log(Level.INFO,
                "traitement insertionPosition:" + message);

        // Parse message
        Matcher parser = pattern.matcher(message.replaceAll("[\n]+", ""));
        if (!parser.matches()) {
            logger.log(Level.WARNING,
                "Message incorrect, matching impossible:" + message);
            return ERROR_POS;
        }

        gpsId = gpsID;

        Integer index = 1;

        // Time
        hour =  Integer.valueOf(parser.group(index++));
        minute = Integer.valueOf(parser.group(index++));
        sec = Integer.valueOf(parser.group(index++));

        // Validity
        isGpsValid = parser.group(index++).compareTo("A") == 0 ? 1 : 0;

        // Latitude
        Double latitude = Double.valueOf(parser.group(index++));
        latitude += Double.valueOf(parser.group(index++)) / 60;
        if (parser.group(index++).compareTo("S") == 0) {
            latitude = -latitude;
        }
        gpsLatitude = latitude;
        gpsLatitude *= 10000.0;
	gpsLatitude = Math.floor(gpsLatitude+0.5);
	gpsLatitude /= 10000.0; // 1.67

        // Longitude
        Double longitude = Double.valueOf(parser.group(index++));
        longitude += Double.valueOf(parser.group(index++)) / 60;
        if (parser.group(index++).compareTo("W") == 0) {
            longitude = -longitude;
        }
        gpsLongitude = longitude;
        gpsLongitude *= 10000.0;
	gpsLongitude = Math.floor(gpsLongitude+0.5);
	gpsLongitude /= 10000.0; // 1.67
        
        // Speed
        double speedKilo = Double.valueOf(parser.group(index++)) * MILE;
        gpsSpeed = (int)speedKilo;

        // Date
        day = Integer.valueOf(parser.group(index++));
        month = Integer.valueOf(parser.group(index++));
        year = 2000 + Integer.valueOf(parser.group(index++));

        // Altitude
        gpsAltitude = 0.0;
        
        //Date : on doit la convertir en 'DD/MM/YYYY:HH24:MI:SS'
        Calendar time = Calendar.getInstance(TimeZone.getTimeZone("GMT"));
        time.clear();
        time.set(Calendar.HOUR_OF_DAY, hour);
        time.set(Calendar.MINUTE, minute);
        time.set(Calendar.SECOND, sec);
        time.set(Calendar.DAY_OF_MONTH, day);
        time.set(Calendar.MONTH, month - 1);
        time.set(Calendar.YEAR, year);
        gpsDateD = dateFormat.format(time.getTime());

//        gpsDateD = new String (day + "/" + month
//                            + "/" + year + ":"
//                            + hour + ":"
//                            + minute + ":"
//                            + sec);
        
        // autres parametres
        //gpsHeading = Integer.parseInt(params[5]);
        gpsHeading = 0;
        //gpsNbsat = Integer.parseInt(params[7]); // maintenant c est utilise
        //gpsEvent = Integer.parseInt(params[8]);
        gpsNbsat = isGpsValid;
        if (gpsNbsat < 1) {
            logger.log(Level.WARNING, "GPS position not valid < " + gpsNbsat + " satellite(s) :" + message);
            return ERROR_POS;
        }
        /*
         if (gpsEvent != EVENT_GPS) {
         System.out.println("event other than GPS position = "+gpsEvent+ "event :"+message);
         return ERROR_POS;			
         }
         */
        m_DataBase = this.getDataBase();

        if (m_DataBase.Connect()) {
            /*Requete SQL de type Update*/
            String sql
                    = "insert into GPS_POSITIONS (ID, HEADING, SPEED, LONGITUDE, LATITUDE , ALTITUDE, NBSAT, TIME_STP ) values ("
                    + "'" + gpsId + "'" + "," + gpsHeading + "," + gpsSpeed + "," + gpsLongitude + ","
                    + gpsLatitude + "," + gpsAltitude + "," + gpsNbsat + "," + "'" + gpsDateD + "')";

            logger.log(Level.INFO, "SQL:" + sql + ":END:");
            //result = m_DataBase.Update(sql);
            result = m_DataBase.Update(sql);
            if (result == 0) {
                logger.log(Level.INFO, "Status = OK");
            } else {
                logger.log(Level.WARNING, "Status = NOK");
            }
            m_DataBase.Close();
        } else {
            logger.log(Level.WARNING, "disable to connect to database");
        }
        return result;
    }

    private PostgreSQLDataBase getM_DataBase() {
        return m_DataBase;
    }

    private void setM_DataBase(PostgreSQLDataBase dataBase) {
        m_DataBase = dataBase;
    }

    public String getRelease() {
        String rel = m_Release;
        return rel;
    }

    public boolean setRelease(String release) {
        m_Release = release;
        return true;
    }

    public String[] getNames() {
        m_Names[0] = "Philippe";
        m_Names[1] = "Isorce";
        return m_Names;
    }

    public int[] getNumbers() {
        m_Numbers[0] = 1957;
        m_Numbers[1] = 13;
        return m_Numbers;
    }
}
