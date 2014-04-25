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
public class GetLastPositions extends HttpServlet {
	private static final long serialVersionUID = 1L;

	/**
	 * @see HttpServlet#HttpServlet()
	 */
	public GetLastPositions() {
		super();
		// TODO Auto-generated constructor stub
	}

	/**
	 * @see HttpServlet#doGet(HttpServletRequest request, HttpServletResponse
	 *      response)
	 */
	protected void doGet(HttpServletRequest request,
			HttpServletResponse response) throws ServletException, IOException {
		// TODO Auto-generated method stub
		response.setHeader("Access-Control-Allow-Origin","*");
	       response.setHeader("Access-Control-Allow-Methods", "GET,POST,PUT,DELETE,OPTIONS");
	       response.setHeader("Access-Control-Allow-Headers", "Content-Type");
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

		PrintWriter out = response.getWriter();
		response.setContentType("application/json");

		/* Creation de la connexion BD */
		m_Url = "jdbc:postgresql://gps-iso.insa-lyon.fr:5432/geoloc";
		m_Driver = "org.postgresql.Driver";
		m_UserName = "geoloc";
		m_Password = "raid$2014";

		m_Connection = null;
		// Connection con = null;
		try {
			/* ConnecterBD */
			Context context = new InitialContext();

			// DataSource ds = (DataSource)context.lookup("jdbc/casinoDS");
			// con = ds.getConnection();
			Class.forName(m_Driver);
			System.out.println("driver=" + m_Driver);
			// m_Connection = DriverManager.getConnection(getUrl(),
			// getUserName(), getPassword());
			m_Connection = DriverManager.getConnection(m_Url, m_UserName,
					m_Password);
			m_Statement = m_Connection.createStatement();
			/* Variable Requete SQL */
			String sql = null;
			/* defaut message */
			gMessage = ":KO(invalid parameters)";

			sql = new String(
					"select distinct on (id) id , time_stp, latitude, longitude, heading, speed from gps_positions order by id, time_stp desc");

			if (gdebugf)
				out.println(sql);
			ResultSet rs = m_Statement.executeQuery(sql);
			ResultSetMetaData rsMeta = rs.getMetaData();

			// Get the N of Cols in the ResultSet
			int noCols = rsMeta.getColumnCount();

			StringBuilder sb = new StringBuilder();
			int i_count = 0;
			sb.append("[");
			while (rs.next()) {
				sb.append("{\"id\": \"" + rs.getString(1) + "\",");
				sb.append("\"lat\": \"" + rs.getString(3) + "\",");
				sb.append("\"long\": \"" + rs.getString(4) + "\",");
				sb.append("\"date\": \"" + rs.getString(2) + "\",");
				sb.append("\"speed\" : \"" + rs.getString(6) + "\"},");
			}
			
			// delete last ","
			sb.deleteCharAt(sb.length() - 1);
			sb.append("]");
			out.println(sb.toString());
			gMessage = "";
		} catch (Exception e) {
			gMessage = new String(e.getMessage());
			if (gdebugf)
				e.printStackTrace();
			gMessage = new String(e.toString());
		} finally {
			try {
				m_Connection.close();
			} catch (Exception e) {
			}
		}
	}

	/**
	 * @see HttpServlet#doPost(HttpServletRequest request, HttpServletResponse
	 *      response)
	 */
	protected void doPost(HttpServletRequest request,
			HttpServletResponse response) throws ServletException, IOException {
		// TODO Auto-generated method stub
	}

}