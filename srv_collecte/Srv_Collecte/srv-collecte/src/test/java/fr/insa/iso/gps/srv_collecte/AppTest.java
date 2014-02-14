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

import junit.framework.Test;
import junit.framework.TestCase;
import junit.framework.TestSuite;

/**
 * Unit test for simple App.
 */
public class AppTest 
extends TestCase
{
    public static Properties props = new Properties();
    public static InputStream properties;
    public static String driver;
    public static String url;
    public static String passwd;
    public static String user;
    public static String log;
    /**
     * Create the test case
     *
     * @param testName name of the test case
     */
    public AppTest( String testName )
    {
        super( testName );
    }

    /**
     * @return the suite of tests being tested
     */
    public static Test suite()
    {
        return new TestSuite( AppTest.class );
    }

    /**
     * Config File Test :-)
     * @throws IOException
     *  
     */
    public void testProperties() throws IOException
    {
        
        assertNotNull("Impossible d'acceder au fichier de configuration",properties = Thread.currentThread().getContextClassLoader().getResourceAsStream("geotracker.properties"));
        props.load(properties);
        assertNotNull("Fichier de config incorrect", url = props.getProperty("URL"));
        assertNotNull("Fichier de config incorrect", driver = props.getProperty("DRIVER"));
        assertNotNull("Fichier de config incorrect", user = props.getProperty("USERNAME"));
        assertNotNull("Fichier de config incorrect", passwd = props.getProperty("PASSWORD"));
        assertNotNull("Fichier de config incorrect", log = props.getProperty("LOG"));
    }

    /**
     * Log File Test :-)
     * @throws IOException
     *  
     */
    public void testLog() throws IOException
    {
        FileHandler fh;
        assertNotNull("Fichier de config incorrect", log);
        try {
             fh = new FileHandler(log);
             fh.close();
        } catch (SecurityException | IOException e) {
            fail("Impossible d'ecrire le fichier de log");
        }
    }
    

     /**
     * Database connection Test :-)
     * @throws IOException
     *  
     */
    public static void testDatabase() throws ClassNotFoundException, SQLException
    {
        Connection m_Connection;
        PostgreSQLDataBase n_DataBase = new PostgreSQLDataBase();
        assertNotNull("Driver JDBC introuvble", Class.forName(props.getProperty("DRIVER")));
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
