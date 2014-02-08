package fr.insa.iso.gps.srv_collecte;

import java.io.IOException;
import java.io.FileInputStream;
import java.util.Properties;
import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Statement;
import java.util.logging.Logger;
import java.util.logging.Level;

public class PostgreSQLDataBase{

	private Connection m_Connection;
	private Statement m_Statement;
	private String m_Driver;
	private String m_Address;
	private String m_Port;
	private String m_Compte;
	private String m_UserName;
	private String m_Password;
	private String m_Url;
	private static Logger logger = Logger.getLogger(CollectServer.class.getName());
	private static String n_log = "";
	private static String l_log = ""; // recevra le niveau du logger


	public void PostgreSQLDatabase() {
	}

	public boolean Connect(){

		Properties props = new Properties();
		try {
			// le fichier de proprietes doit se trouve a la racine du package ws
			props.load(new FileInputStream("src/main/resources/geotracker.properties"));
			m_Url = props.getProperty("URL");
			m_Driver = props.getProperty("DRIVER");
			m_UserName = props.getProperty("USERNAME");
			m_Password = props.getProperty("PASSWORD");
		} catch (IOException e) {
			e.printStackTrace();
			System.out.println("OracleDatabase: impossible de trouver le fichier properties");
		}

		try
		{
			logger.log(Level.INFO,"user="+m_UserName+" pass="+m_Password);
			logger.log(Level.INFO,"url="+m_Url);
			logger.log(Level.INFO,"driver="+m_Driver);

			System.out.println("user="+m_UserName+" pass="+m_Password);
			//Class.forName(getDriver());
			Class.forName(m_Driver);
			System.out.println("driver="+m_Driver);
			//m_Connection = DriverManager.getConnection(getUrl(), getUserName(), getPassword());
			m_Connection = DriverManager.getConnection(m_Url, m_UserName, m_Password);
			m_Statement = m_Connection.createStatement();
			return true;
		}
		catch(SQLException ex){
			System.out.println(ex.getMessage().toString());
			return false;
		}
		catch(ClassNotFoundException ex){
			System.out.println(ex.getMessage().toString());
			return false;
		}
	}

	public boolean Close()
	{
		try	{
			this.m_Connection.close();
			return true;
		} catch(SQLException ex){
			System.out.println(ex.getMessage().toString());
			return false;
		} 
	}

	public ResultSet Requete(String req)
	{
		ResultSet rs=null;	
		try {
			rs=m_Statement.executeQuery(req);
			return rs;
		} catch(SQLException ex){
			rs=null;
			return rs;
		}
	} 
	public int Update(String req)
	{
		try {
			m_Statement.executeUpdate(req);
			return 0;
		} catch(SQLException ex){
			return 1;
		}
	}

	public String getDriver(){
		return m_Driver;
	}

	public void setDriver(String driver){
		this.m_Driver = driver;
	} 

	public String getUserName() {
		return m_UserName;
	}

	public void setUserName(String userName){
		this.m_UserName=userName;
	}

	public String getPassword() {
		return m_Password;
	}

	public void setPassword(String pass){
		this.m_Password=pass;
	}

	public String getAddress() {
		return m_Address;
	}

	public void setAddress(String address){
		this.m_Address=address;
	}

	public String getPort() {
		return m_Port;
	}

	public void setPort(String port){
		this.m_Port=port;
	}

	public String getCompte() {
		return m_Compte;
	}

	public void setCompte(String compte){
		this.m_Compte=compte;
	}

	public String getUrl() {
		return m_Url;
	}

	public void setUrl(String url){
		this.m_Url=url;
	}

	private boolean isClosed(){
		try {
			return m_Connection.isClosed();
		} catch (SQLException e) {
			e.printStackTrace();
			return false;
		}
	}

	public String getM_Address() {
		return m_Address;
	}

	public void setM_Address(String address) {
		m_Address = address;
	}

	public String getM_Compte() {
		return m_Compte;
	}

	public void setM_Compte(String compte) {
		m_Compte = compte;
	}



	public String getM_Driver() {
		return m_Driver;
	}

	public void setM_Driver(String driver) {
		m_Driver = driver;
	}

	public String getM_Password() {
		return m_Password;
	}

	public void setM_Password(String password) {
		m_Password = password;
	}

	public String getM_Port() {
		return m_Port;
	}

	public void setM_Port(String port) {
		m_Port = port;
	}


	public String getM_Url() {
		return m_Url;
	}

	public void setM_Url(String url) {
		m_Url = url;
	}

	public String getM_UserName() {
		return m_UserName;
	}

	public void setM_UserName(String userName) {
		m_UserName = userName;
	}

}
