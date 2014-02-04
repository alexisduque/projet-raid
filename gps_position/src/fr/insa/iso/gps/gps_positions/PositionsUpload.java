package fr.insa.iso.gps.gps_positions;

import java.io.IOException;
import java.io.PrintWriter;
import java.sql.CallableStatement;
import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.Statement;
import java.sql.Types;
import java.text.DateFormat;
import java.text.SimpleDateFormat;
import java.util.Date;
import java.util.Enumeration;
import java.util.Locale;

import javax.naming.Context;
import javax.naming.InitialContext;
import javax.servlet.ServletException;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

/**
 * Servlet implementation class PositionsUpload
 */
public class PositionsUpload extends HttpServlet {
	private static final long serialVersionUID = 1L;
       
    /**
     * @see HttpServlet#HttpServlet()
     */
    public PositionsUpload() {
        super();
        // TODO Auto-generated constructor stub
    }

	/**
	 * @see HttpServlet#doGet(HttpServletRequest request, HttpServletResponse response)
	 */
	protected void doGet(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
		// TODO Auto-generated method stub
        /*
         * Liste des variables :
         * Id : numero identification une chaine de caracteres
         * Dt : date et heure
         * La : latitude avec le point decimal
         * Lo : longitude avec le point decimal
         * Sp : vitesse (en km/h)
         * He : cap (0 a 360 degre)
         * Al : altitude avec le point decimal
         * Sa : nombre de satellites minimum 4 pour valide
         * D : debug [1|0] 1 pour debug active, 0 pour non actif
         */
        String gId = null;
        String gDate = null;
        String gDateD = null;
        Double gLatitude = null;
        Double gLongitude = null;
        Integer gSpeed = null;
        Integer gHeading = null;
        Double gAltitude = null;
        Integer gSat = null;
        String gMessage = null;
        int gCount = 0; // nombre de parametres dans url 
        /* variables pour la base de donnees */
    	Connection m_Connection;
    	Statement m_Statement;
    	String m_Driver;
    	String m_Address;
    	String m_Port;
    	String m_Compte;
    	String m_UserName;
    	String m_Password;
    	String m_Url;
        // ces booleans permettent de savoir si le parametre est passe dans l url
        boolean gidf = false;
        boolean gdatef = false;
        boolean gactivityf = false;
        boolean gkmf = false;
        boolean glatitudef = false;
        boolean glongitudef = false;
        boolean gspeedf = false;
        boolean gheadingf = false;
        boolean galtitudef = false;
        boolean gsatf = false;
        boolean gdebugf = false;

        m_Connection = null;
        //   Date systeme
        Date dateS = new Date();
        //    1. Choix de la langue
        Locale locale = Locale.getDefault();
        /**   2. Construction du DateFormat en choisissant un format :
               * SHORT = 01/01/2002
               * FULL = lundi 1 janvier 2002
               * le premier format est FULL, le deuxieme est adapte a Oracle
               */
        DateFormat dateFormat =
            DateFormat.getDateInstance(DateFormat.FULL, locale);
        DateFormat dateFormatO = new SimpleDateFormat("dd/MM/yyyy HH:mm:ss");
        // Attention : H majuscule dans le format pour les heures sur 24 heures
        response.setContentType("text/html");
        PrintWriter out = response.getWriter();

        /* 1 - on va parcourir la liste des parametres passes dans l url*/
        Enumeration noms = request.getParameterNames();
        while (noms.hasMoreElements()) {
            gCount++;
            String nom = (String)noms.nextElement();
            if (nom.equals("Id"))
                gidf = true;
            if (nom.equals("Dt"))
                gdatef = true;
            if (nom.equals("Ac"))
                gactivityf = true;
            if (nom.equals("Km"))
                gkmf = true;
            if (nom.equals("La"))
                glatitudef = true;
            if (nom.equals("Lo"))
                glongitudef = true;
            if (nom.equals("Sp"))
                gspeedf = true;
            if (nom.equals("He"))
                gheadingf = true;
            if (nom.equals("Al"))
                galtitudef = true;
            if (nom.equals("Sa"))
                gsatf = true;
            if (nom.equals("D"))
                gdebugf = true;

        }
        /* 2 - Recuperation des parametres et initialisation */

        //gId est obligatoire
        if (gidf == true) {
            gId = new String(request.getParameter("Id"));

            // gDate
            if (gdatef == true) {
                gDate = new String(request.getParameter("Dt"));
                gDateD = new String("");
                // JJMMAAAAHHMMSS on doit la convertir en 'DD/MM/YYYY:HH24:MI:SS'
                if (gDate.length() == 14) {
                    gDateD =
                            new String(gDate.substring(0, 2) + "/" + gDate.substring(2,
                                                                                     4) +
                                       "/" + gDate.substring(4, 8) + ":" +
                                       gDate.substring(8, 10) + ":" +
                                       gDate.substring(10, 12) + ":" +
                                       gDate.substring(12, 14));
                    //System.out.println(">>"+gDateD);
                } else
                    gDateD = new String(dateFormatO.format(dateS));
            } else
                gDateD = new String(dateFormatO.format(dateS));
            // gLatitude
            if (glatitudef == true)
                gLatitude = new Double(request.getParameter("La"));
            else
                gLatitude = new Double(0);
            // gLongitude
            if (glongitudef == true)
                gLongitude = new Double(request.getParameter("Lo"));
            else
                gLongitude = new Double(0);
            // gSpeed
            if (gspeedf == true)
                gSpeed = new Integer(request.getParameter("Sp"));
            else
                gSpeed = new Integer(0);
            // gHeading
            if (gheadingf == true)
                gHeading = new Integer(request.getParameter("He"));
            else
                gHeading = new Integer(0);
            // gAltitude
            if (galtitudef == true)
                gAltitude = new Double(request.getParameter("Al"));
            else
                gAltitude = new Double(0);
            // gSat
            if (gsatf == true)
                gSat = new Integer(request.getParameter("Sa"));
            else
                gSat = new Integer(0);
        }

        //    3. Affichage de la date et de l'heure dans la reponse HTTP

        response.setContentType("text/html");
        out.println("<HTML>");
        out.println("<HEAD><TITLE> INSA TC - GPS Positions Uploader </TITLE></HEAD>");
        out.println("<BODY>");
        if (gdebugf)
            out.println("<p> nous sommes le : " + dateFormat.format(dateS));

        /*Creation de la connexion BD*/
		m_Url =  "jdbc:postgresql://gps-iso.insa-lyon.fr:5432/geoloc";
		m_Driver = "org.postgresql.Driver";
		m_UserName = "geoloc";
		m_Password = "raid$2014";
        //Connection con = null;
        try {
            /*ConnecterBD*/
            Context context = new InitialContext();

            //DataSource ds = (DataSource)context.lookup("jdbc/casinoDS");
            //con = ds.getConnection();
			Class.forName(m_Driver);
			System.out.println("driver="+m_Driver);
			//m_Connection = DriverManager.getConnection(getUrl(), getUserName(), getPassword());
			m_Connection = DriverManager.getConnection(m_Url, m_UserName, m_Password);
			m_Statement = m_Connection.createStatement();
            /* Variable Requete SQL */
            String sql = null;
            /* defaut message */
            gMessage = ":KO(invalid parameters)";
            /*
             * La table POSITIONS est accessible via jdbc
             */

            /*
              * si on une position gps par exemple la latitude on met a jour les positions
              */
            if (gidf && glatitudef && glongitudef) {
            
                sql =
        new String("insert into GPS_POSITIONS (ID, HEADING, SPEED, LONGITUDE, LATITUDE , ALTITUDE, NBSAT, TIME_STP ) values (" +
            "'" + gId + "'," + gHeading + "," + gSpeed + "," + gLongitude +
            "," + gLatitude + "," + gAltitude + "," + gSat + "," + "'"+
            gDateD+"')" );
             if (gdebugf)
                 out.println("<p>" + sql);
             m_Statement.executeUpdate(sql);
             gMessage = "OK";
            }

            m_Statement.close();
            m_Connection.close();
        } catch (Exception e) {
            gMessage = new String( e.getMessage());
            if (gdebugf)
                e.printStackTrace();
            gMessage = new String(e.toString());
        } finally {
            try {
            	m_Connection.close();
            } catch (Exception e) {
                // il faudrait traiter cette exception...
            }
            out.println("<p>"+gMessage+"</p>")  ;  
            out.println("</BODY>");
            out.println("</HTML>");
            
        }
	}

	/**
	 * @see HttpServlet#doPost(HttpServletRequest request, HttpServletResponse response)
	 */
	protected void doPost(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
		// TODO Auto-generated method stub
	}

}
