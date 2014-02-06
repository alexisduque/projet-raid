package fr.insa.iso.gps.gps_positions;

import java.io.IOException;
import java.io.PrintWriter;
import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.ResultSet;
import java.sql.ResultSetMetaData;
import java.sql.Statement;

import javax.naming.Context;
import javax.naming.InitialContext;
import javax.servlet.ServletException;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

/**
 * Servlet implementation class PositionsList
 */
public class PositionsList extends HttpServlet {
	private static final long serialVersionUID = 1L;
       
    /**
     * @see HttpServlet#HttpServlet()
     */
    public PositionsList() {
        super();
        // TODO Auto-generated constructor stub
    }

	/**
	 * @see HttpServlet#doGet(HttpServletRequest request, HttpServletResponse response)
	 */
	protected void doGet(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
		// TODO Auto-generated method stub
        String gMessage = null;
        boolean gdebugf = false;
	  	boolean gidf = false;
	  	boolean gmaxf = false;
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
	  	String m_id = request.getParameter("IdVehicule");
	  	String m_max = request.getParameter("MaxPositions");
	  	int m_count = 0;

	  	if (m_id != null)
	  		gidf = true;
	  	if (m_max != null) {
	  		gmaxf = true;
	  		m_count = Integer.parseInt(m_max);
	  	}

        PrintWriter out = response.getWriter();
        response.setContentType("text/html");
        out.println("<HTML>");
        out.println("<HEAD><TITLE> INSA TC - GPS Positions Listing </TITLE></HEAD>");
        out.println("<BODY>");


        /*Creation de la connexion BD*/
		m_Url =  "jdbc:postgresql://gps-iso.insa-lyon.fr:5432/geoloc";
		m_Driver = "org.postgresql.Driver";
		m_UserName = "geoloc";
		m_Password = "raid$2014";
		m_Connection = null;
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
            String url = new String("=");
            /* defaut message */
            gMessage = ":KO(invalid parameters)";
            if (gidf == true)
            	sql =
            	new String("select ID, HEADING, SPEED, LONGITUDE, LATITUDE , ALTITUDE, NBSAT, TIME_STP from GPS_POSITIONS "+ 
            "where id = '" +m_id+"' "+ "order by TIME_STP DESC" );
            
            else
            	sql =
                new String("select ID, HEADING, SPEED, LONGITUDE, LATITUDE , ALTITUDE, NBSAT, TIME_STP from GPS_POSITIONS "+ 
                       " order by ID, TIME_STP DESC" );
            if (gdebugf)
             out.println("<p>" + sql);
         	ResultSet rs = m_Statement.executeQuery(sql);
			out.println("<table border>");

			ResultSetMetaData rsMeta = rs.getMetaData();
			// Get the N of Cols in the ResultSet
			int noCols = rsMeta.getColumnCount();

			out.println("<tr>");
			for (int c=1; c <= noCols; c++) {
				String el = rsMeta.getColumnLabel(c);
				out.println("<th> " + el + " </th>");
			}
			out.println("</tr>");
			int i_count = 0;
			while (rs.next()) {
				out.println("<tr>");
				for (int c=1; c <= noCols; c++) {
					String el = rs.getString(c);
					// colonne 4 longitude, colonne 5 latitude
					url = url +  rs.getString(5) + ","+rs.getString(4);
					out.println("<td> " + el + " </td>");
					if (c < noCols)
						url = url +"|";
					
				}
				out.println("</tr>");
				i_count++;
				if (i_count >= m_count)
					break;
			}
			out.println("</table>"+ "<br/>");
			//out.println ( "Requête exécutée: " + sql + "<br/>" );
			// url vers gmap_api.html avec les points dans url
			url = "gmap_api.html?"+url;
			//out.println ( "url: " + url + "<br/>" );
			out.println("<a href=\""+url+"\">Acc&eacute;s carte GMAP</a>");
			out.println("</br><a href=\""+"geoportail.html"+"\">Acc&eacute;s carte GeoPortail</a>");
			gMessage = "";
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
            out.println("<img src=\"images/insaLyon.png\" width=\"128\" high=\"128\" />");
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
