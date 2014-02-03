package fr.insa.iso.gps.srv_collecte;

import java.net.Socket;


import java.util.Date;

public class CClient {
	private Socket socketClient;
	private int typeClient;
	private String idClient;

	// la socket du client	
	public Socket getSocket() {
		return socketClient;
	}
	public void setSocket(Socket sock) {
		this.socketClient = sock;
	}
	// le type du device du client	
	public int getType() {
		return typeClient;
	}
	public void setType(int type) {
		this.typeClient = type;
	}
	// identifiant du device du client	
	public String getId() {
		return idClient;
	}
	public void setId(String id) {
		this.idClient = new String(id);
	}
}

