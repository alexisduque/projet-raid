package fr.insa.iso.gps.srv_collecte;

import java.io.FileInputStream;
import java.io.IOException;
import java.io.InputStream;
import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Statement;
import java.text.SimpleDateFormat;
import java.util.Date;
import java.util.Properties;
import java.util.logging.FileHandler;
import java.util.logging.Formatter;
import java.util.logging.Level;
import java.util.logging.LogRecord;
import java.util.logging.Logger;

import static org.junit.Assert.*;

import org.junit.Test;
import org.junit.Ignore;
import org.junit.runner.RunWith;
import org.junit.runners.JUnit4;
import org.junit.Before;

/**
 * Unit test for simple App.
 */
@RunWith(JUnit4.class)
public class AppTest 
{
    public static Properties props = new Properties();
    public static InputStream properties;
    public static String driver;
    public static String url;
    public static String passwd;
    public static String user;
    public static String log;

    @Before
    public void setup(){

        try {
            properties = Thread.currentThread().getContextClassLoader().getResourceAsStream("geotracker.properties");
            props.load(properties);
            url = props.getProperty("URL");
            driver = props.getProperty("DRIVER");
            user = props.getProperty("USERNAME");
            passwd = props.getProperty("PASSWORD");
            log = props.getProperty("LOG");
        }
        catch (IOException | NullPointerException e) {
            fail("Impossible d'acceder au fichie properties");
        }
    }

    /**
     * Config File Test :-)
     *  
     */
    @Test
    public void testProperties() throws IOException
    {
        
        assertNotNull("Impossible d'acceder au fichier de configuration",properties);
        assertNotNull("Fichier de config incorrect", url);
        assertNotNull("Fichier de config incorrect", driver);
        assertNotNull("Fichier de config incorrect", user);
        assertNotNull("Fichier de config incorrect", passwd);
        assertNotNull("Fichier de config incorrect", log);
    }

    /**
     * Log File Test :-)
     *  
     */
    /**
    @Test
    public void testLog() throws IOException
    {
        FileHandler fh;
        assertNotNull("Fichier de config incorrect " + log, log = props.getProperty("LOG"));
        try {
             fh = new FileHandler(log, true);
             fh.close();
        } catch (SecurityException | IOException e) {
            fail("Impossible d'ecrire le fichier de log : " + log);
        }
    }
    **/

     /**
     * Database connection Test :-)
     * @throws IOException
     *  
     */
    @Test
    public void testDatabase() throws ClassNotFoundException, SQLException
    {
        Connection m_Connection;
        PostgreSQLDataBase n_DataBase = new PostgreSQLDataBase();
        assertNotNull("Driver JDBC introuvble" + driver, Class.forName(driver));
        assertNotNull(m_Connection = DriverManager.getConnection(url, user, passwd));
        assertNotNull(m_Connection.createStatement());
        
        assertNotNull(n_DataBase.Connect());
            
        String sql = "SELECT id FROM gps_positions group by id order by id asc";
        String sqlpos = "select ID, HEADING, SPEED, LONGITUDE, LATITUDE , ALTITUDE, NBSAT, TIME_STP from GPS_POSITIONS order by ID, TIME_STP DESC";
        
        assertNotNull("Impossible de lire les données", n_DataBase.Requete(sql));
        assertNotNull("Impossible de lire les données", n_DataBase.Requete(sqlpos));
        n_DataBase.Close();

    }

}
