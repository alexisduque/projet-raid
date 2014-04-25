<%@ page language="java" contentType="text/html; charset=ISO-8859-1"
    pageEncoding="ISO-8859-1"%>
<!DOCTYPE html PUBLIC "-//W3C//DTD HTML 4.01 Transitional//EN" "http://www.w3.org/TR/html4/loose.dtd">
<html>
<head>
<meta http-equiv="Content-Type" content="text/html; charset=ISO-8859-1">
<title>Recherche d'un tracker</title>
<link rel="StyleSheet" type="text/css" href="style.css">
<!-- Latest compiled and minified CSS -->
<link rel="stylesheet"
	href="//netdna.bootstrapcdn.com/bootstrap/3.1.1/css/bootstrap.min.css">
<!-- Optional theme -->
<link rel="stylesheet"
	href="//netdna.bootstrapcdn.com/bootstrap/3.1.1/css/bootstrap-theme.min.css">
<!-- Latest compiled and minified JavaScript -->
<script
	src="//netdna.bootstrapcdn.com/bootstrap/3.1.1/js/bootstrap.min.js"></script>
</head>
<body>
<% String url="plist"; %>
		<div class="container-fluid" style="text-align: center; width: 95%;">
	
		<img src="images/tcchappe.png" alt="INSA LYON TC" width="800"
			height="120" />
			<br>
		<h2>List des positions GPS d'un Tracker</h2>
		<br>
			<ul class="nav nav-pills nav-justified">
				<li><a href="index.html">Accueil</a></li>

				<li><a href="plast">Global Map</a></li>
				<li><a href="live.html">Live Tracking</a></li>
				<li><a href="FindPositions.jsp">Tracker</a></li>
				<li class="active"><a href="AllPositions.jsp">List</a></li>
			</ul>
		<div class="row" id="main">
		<h2><u>Saisie du tracker et de la periode</u></h2><br>
		
			<form class="form-track" action="<%= url %>" name="DatesJsp" method="get">
			
			<table align="center" size ="400px">

					<td align="center">ID du Tracker</td>
					<td><input class="form-control" type="text" size="" name="IdVehicule" value="1000000002"></td>
				</tr>
				<tr>
					<td align="center">Date de d&eacute;but</td>
					<td><input class="form-control" type="text" size="10" name="DateDebut" value="2014-03-29"
						onClick="MyGetDate(this);"></td>
				</tr>
				<tr>
					<td align="center">Date de fin</td>
					<td><input class="form-control" type="text" size="10" name="DateFin" value="2014-03-31"
						onClick="MyGetDate(this);"></td>
				</tr>

				<tr>
					<td colspan =2"><br>
					      <input type="submit" value="Valider" class="btn btn-block btn-primary">						
					</td>
				</tr>
			</table>
			</form>
	</div>

		<hr> <img src="images/insaLyon.png" width="128" />	</div>
</body>
</html>