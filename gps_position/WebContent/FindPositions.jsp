<%@ page language="java" contentType="text/html; charset=ISO-8859-1"
    pageEncoding="ISO-8859-1"%>
<!DOCTYPE html PUBLIC "-//W3C//DTD HTML 4.01 Transitional//EN" "http://www.w3.org/TR/html4/loose.dtd">
<html>
<head>
<meta http-equiv="Content-Type" content="text/html; charset=ISO-8859-1">
<title>Recherche du tracker</title>
</head>
<body>
			<% String url="plist"; %>
			<h3>Recherche des positions GPS d'un Tracker </h3>
			<form action="<%= url %>" name="DatesJsp" method="get">
			<table align="center">
				<tr>
					<td align="right">ID du v&eacute;hicule</td>
					<td><input type="text" size="10" name="IdVehicule" value="2000000001"></td>
				</tr>
				<tr>
					<td colspan="2" align="center">
					<h2><u>Formulaire de saisie des options</u></h2>
					</td>
				</tr>
				<tr>
					<td align="right">Date de d&eacute;but de p&eacute;riode</td>
					<td><input type="text" size="10" name="DateDebut" value="2014-01-01"
						onClick="MyGetDate(this);"></td>
				</tr>
				<tr>
					<td align="right">Date de fin de p&eacute;riode</td>
					<td><input type="text" size="10" name="DateFin" value="2014-01-31"
						onClick="MyGetDate(this);"></td>
				</tr>
				<tr>
					<td align="right">Nombre max de positions</td>
					<td><input type="text" size="10" name="MaxPositions" value="10"></td>
				</tr>
				<tr>
					<td align="right">Pour faire seulement un test</td>
					<td align="left"> cochez le bouton vrai</td>
				</tr>
				<tr>
					<td>Vrai<input type="radio" name="Test" value="vrai" checked></td>
					<td>Faux<input type="radio" name="Test" value="faux"></td>
				</tr>
				<tr>
					<td><br>
					    <input type="submit" value="Valider">			
					</td>
				</tr>
			</table>
			</form>
			  <% 
			  	String idvehicule = request.getParameter("IdVehicule");
			    String firstdate = request.getParameter("DateDebut");
			  	String lastdate = request.getParameter("DateFin");
			  	String maxpositions = request.getParameter("MaxPositions");
			  %>
			  	<hr>
			    Vous avez saisi les options suivantes :
			    <ul>
			  <% 
			  	if (idvehicule != null)
			       	out.println("<li>" + idvehicule);
			  	if (firstdate != null)
			       	out.println("<li>" + firstdate);
			  	if (lastdate != null)
			      	out.println("<li>" + lastdate);   
			  	if (maxpositions != null)
			      	out.println("<li>" + maxpositions);   
			   %>
			   </ul>
			<%

	%>
		 <img src="images/insaLyon.png" width="128" high="128" />	
</body>
</html>