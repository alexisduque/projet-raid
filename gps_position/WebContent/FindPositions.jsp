<%@ page language="java" contentType="text/html; charset=ISO-8859-1"
    pageEncoding="ISO-8859-1"%>
<!DOCTYPE html PUBLIC "-//W3C//DTD HTML 4.01 Transitional//EN" "http://www.w3.org/TR/html4/loose.dtd">
<html>
<head>
<meta http-equiv="Content-Type" content="text/html; charset=ISO-8859-1">
<title>Recherche du tracker</title>
<link rel="StyleSheet" type="text/css" href="style.css">

</head>
<body>
			<% String url="plist"; %>
			<img src="images/ImageChappeNord.png" alt="INSA LYON TC" width="800" height="120" />
			<h3>Recherche des positions GPS d'un Tracker </h3>
			<ul id="tabnav">
     		<li class="active"><a href="index.html">Accueil</a></li>
     		<li><a href="geotest.html">Global Map</a></li>
     		<li><a href="FindPositions.jsp">Tracker</a></li>
     		<li><a href="plist">List</a></li>
			</ul>
			<form action="<%= url %>" name="DatesJsp" method="get">
			<table align="center">
				<tr>
					<td align="right">ID du Tracker</td>
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
					<td><br>
					    <input type="submit" value="Valider">			
					</td>
				</tr>
			</table>
			</form>
			   </ul>

		<hr> <img src="images/insaLyon.png" width="128" />	
</body>
</html>