/*
 * Classe CollectConsole : est instanciee par le serveur des son lancement 
 * cette classe se charge de lire tout ce qui arrive le clavier 
 * Elle analyse ensuite le mot cle et declanche sur chaque device connecte 
 * l ecriture de la commande correspondante au mot cle.
 * 
 * Auteur: Philippe ISORCE (c) OPhone 2012
 */

package fr.insa.iso.gps.srv_collecte;

import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.io.IOException;
import java.io.PrintWriter;
import java.util.logging.FileHandler;
import java.util.logging.Logger;
import java.util.logging.Formatter;
import java.util.logging.SimpleFormatter;
import java.util.logging.Handler;
import java.util.logging.Level;
import java.util.logging.LogRecord;

import java.util.*;
import java.net.*;

//** Classe qui gere les commandes tappees dans la console **
// implementation de l'interface Runnable (une des 2 methodes pour creer un thread)
class CollectCLI implements Runnable
{	
	CollectServer _socketServ; // pour utilisation des methodes de la classe principale
	int portCLI; // port d'ecoute du CLI
	BufferedReader _in; // pour gestion du flux d'entree (celui de la console)
	String _strCommande=""; // contiendra la commande tapee au clavier
	Thread _t; // contiendra le thread
	Integer[] _clients;
	CLI_TCP_Thread _clientCLI;
	public static Logger logger = Logger.getLogger(CollectServer.class.getName());
	int nbCLI;
	//** Constructeur : initialise les variables necessaires **
	CollectCLI(CollectServer socketServ)
	{
		_socketServ = socketServ; // passage de local en global
		this.portCLI = 2948;
		this.nbCLI = 0;
		_t = new Thread(this); // instanciation du thread
		_t.start(); // demarrage du thread, la fonction run() est ici lancee
	}

	//** Methode : attend les commandes dans la console et execute l'action demandee **
	public void run() // cette methode doit obligatoirement etre implementuee a cause de l'interface Runnable
	{
		Socket sockCLI;
		try
		{
			ServerSocket socketEcoute =  new ServerSocket(portCLI);
			System.out.println("----------------------------------------");
			System.out.println("Attend client CLI sur le port : "+ portCLI);
			System.out.println("----------------------------------------");
			logger.log(Level.WARNING,"Attente client CLI sur le port: " + portCLI);
		    while (true)
		    {
				Socket sc = socketEcoute.accept(); // un client se connecte, un nouveau thread client est lance
				logger.log(Level.WARNING,"Nouveau client CLI");
      			logger.log(Level.INFO,"IP client CLI: " +sc.getRemoteSocketAddress());
				if (nbCLI == 0)
				{
      				logger.log(Level.INFO,"timeout actif");
					sc.setSoTimeout(180*1000);
					_clientCLI = new CLI_TCP_Thread(sc, _socketServ);
					_clientCLI.start();
					nbCLI = 1;
				} else {
      				logger.log(Level.WARNING,"un client est deja connecte - fermeture de la connection");
      				PrintWriter output  = new PrintWriter(sc.getOutputStream());
					output.println("Server CLI-> Connection refusée : un client est déjà connecté!");

      				try 
	    			{
	    				output.close();
			    		sc.close();
						System.out.println ("CLI" + Thread.currentThread()  + " : Logout !!! ");
	  				} 
	  				catch (IOException e)
	    			{
	    			}
				}
      			
		    }
		}
	      catch (Exception e)
		{
		  e.printStackTrace();
		}
	}

}

class CLI_TCP_Thread extends Thread
{
  	Socket sockThread;
  	String name;
 	CollectServer _socketServ;
  	public PrintWriter output;
	public static Logger logger = Logger.getLogger(CollectServer.class.getName());
  	public CLI_TCP_Thread (Socket Le_Socket, CollectServer collectServer)
    {
      this.sockThread = Le_Socket;
      this.name ="CollectServer CLI";
      this._socketServ = collectServer;
    }
  
  	public void run()
    {
    	try 
		{
			output  = new PrintWriter(sockThread.getOutputStream());
        	InputStreamReader input = new InputStreamReader(sockThread.getInputStream());
	 		BufferedReader binput   = new BufferedReader(input);
	  		String[] commands;
	  		String _strCommande;
	  		String _strRecu;
	  		while ((_strRecu = binput.readLine()) != null)
	   		{
	      		//output.print("-> ");
	      		//output.println(_strCommande);
	      		//output.flush();
	  			//System.out.println ("CLI(" + Thread.currentThread() + ") a recu :"  + _strCommande);
	  			logger.log(Level.INFO,"CLI(" + Thread.currentThread() +") a recu : "  + _strRecu);

	  			commands = _strRecu.split("\\s+");;
	  			_strCommande = commands[0];

				if (_strCommande.equalsIgnoreCase("quit")) // commande "quit" detectee ...
				{
					logger.log(Level.INFO,"CLI(" + Thread.currentThread() +") commamde quit detectée:");
					System.exit(0); // ... on ferme alors le serveur pas bon
				}
				else if(_strCommande.equalsIgnoreCase("total")) // commande "total" detectee ...
				{
					logger.log(Level.INFO,"CLI(" + Thread.currentThread() +") commamde total detectée:");
					// ... on affiche le nombre de clients actuellement connectes
					output.println(this.name + "-> Nombre de devices connectes : "+_socketServ.getNbClients());
				}
				else if(_strCommande.equalsIgnoreCase("list")) // commande "list" detectee ...
				{
					logger.log(Level.INFO,"CLI(" + Thread.currentThread() +") commamde list detectée:");
					// ... on affiche les infos des clients actuellement connectes
					output.println(this.name + "-> Nombre de devices connectes : "+_socketServ.getNbClients());
					_socketServ.listAllClients(output);
				}
				else if(_strCommande.equalsIgnoreCase("getinfo")) // commande "getinfo" detectee ...
				{
					logger.log(Level.INFO,"CLI(" + Thread.currentThread() +") commamde getinfo detectée:");
					char charCur[] = new char[1];
					charCur[0] = '\u0000';
					// ... on envoie le message aux devices actuellement connectes
					_socketServ.sendAll("$WP+UNCFG=0000,?","\r\n"+charCur[0]);
					output.println(this.name + "-> $WP+UNCFG=0000,?");
					//_socketServ.sendAll("1001 ophone getstatus","\r\n"+charCur[0]);
				}
				else if(_strCommande.equalsIgnoreCase("getlocation")) // commande "getlocation" detectee ...
				{
					logger.log(Level.INFO,"CLI(" + Thread.currentThread() +") commamde getlocatiob detectée:");
					char charCur[] = new char[1];
					charCur[0] = '\u0000';
					// ... on envoie le message aux clients actuellement connectes
					_socketServ.sendAll("$WP+GETLOCATION=0000","\r\n"+charCur[0]);
					output.println(this.name + "-> $WP+GETLOCATION=0000");

					//_socketServ.sendAll("getgps","\r\n"+charCur[0]);
				}
				else if(_strCommande.equalsIgnoreCase("setconf")) // commande "setconf" detectee ...
				{
					logger.log(Level.INFO,"CLI(" + Thread.currentThread() +") commamde setconf detectée:");
					char charCur[] = new char[1];
					charCur[0] = '\u0000';
					// ... on envoie le message aux clients actuellement connectes
					_socketServ.sendAll("$WP+COMMTYPE=0000,4,,,Free,,,134.214.202.152,2947,0,212.27.40.241","\r\n"+charCur[0]);
					output.println(this.name + "-> $WP+COMMTYPE=0000,4,,,Free,,,134.214.202.152,2947,0,212.27.40.241");
				}
				else if(_strCommande.equalsIgnoreCase("getconf")) // commande "getconf" detectee ...
				{
					logger.log(Level.INFO,"CLI(" + Thread.currentThread() +") commamde getconf detectée:");
					char charCur[] = new char[1];
					charCur[0] = '\u0000';
					// ... on envoie le message aux clients actuellement connectes
					_socketServ.sendAll("$WP+COMMTYPE=0000,?","\r\n"+charCur[0]);
					output.println(this.name + "-> $WP+COMMTYPE=0000,?");
					//_socketServ.sendAll("getstatus","\r\n"+charCur[0]);
				}
				else if(_strCommande.equalsIgnoreCase("setevent")) // commande "setevent" detectee ...
				{
					logger.log(Level.INFO,"CLI(" + Thread.currentThread() +") commamde setevent detectée:");
					char charCur[] = new char[1];
					charCur[0] = '\u0000';
					// ... on envoie le message aux clients actuellement connectes
					_socketServ.sendAll("$WP+SETEVT=0000,50,1,4.882023,45.780110,500,2,2","\r\n"+charCur[0]);
					output.println(this.name + "-> $WP+SETEVT=0000,50,1,4.882023,45.780110,500,2,2");
				}
				else if(_strCommande.equalsIgnoreCase("resetevent")) // commande "resetevent" detectee ...
				{
					logger.log(Level.INFO,"CLI(" + Thread.currentThread() +") commamde resetevent detectée:");
					char charCur[] = new char[1];
					charCur[0] = '\u0000';
					// ... on envoie le message aux clients actuellement connectes
					_socketServ.sendAll("$WP+CLREVT=0000,50","\r\n"+charCur[0]);
					output.println(this.name + "-> $WP+CLREVT=0000,50");
				}
				else if(_strCommande.equalsIgnoreCase("clearbuffer")) // commande "clearbuffer" detectee ...
				{
					logger.log(Level.INFO,"CLI(" + Thread.currentThread() +") commamde clearbuffer detectée:");
					char charCur[] = new char[1];
					charCur[0] = '\u0000';
					// ... on envoie le message aux clients actuellement connectes
					// on va vider le buffer de la pile des positions enregistres dans device
					_socketServ.sendAll("$WP+QBCLR=0000","\r\n"+charCur[0]);
					output.println(this.name + "-> $WP+QBCLR=0000");
				}
            
				else if(_strCommande.equalsIgnoreCase("settrack")) // commande "settrack" detectee ...
				{
					logger.log(Level.INFO,"CLI(" + Thread.currentThread() +") commamde settrack detectée:");
					char charCur[] = new char[1];
					charCur[0] = '\u0000';
					// ... on envoie le message aux clients actuellement connectes
					// si le signal GPS est valide et si la distance a change de 10m
					// le device envoie sa position en continu toutes les 120s
					_socketServ.sendAll("$WP+TRACK=0000,3,30,100,0,0,4,15","\r\n"+charCur[0]);
					output.println(this.name + "-> $WP+TRACK=0000,3,30,100,0,0,4,15");
				}
				else if(_strCommande.equalsIgnoreCase("setnav")) // commande "setnav" detectee ...
				{
					logger.log(Level.INFO,"CLI(" + Thread.currentThread() +") commamde setnav detectée:");
					char charCur[] = new char[1];
					charCur[0] = '\u0000';
					// ... on envoie le message aux clients actuellement connectes
					// si le signal GPS est valide et si la distance a change de 10m
					// le device envoie sa position en continu toutes les 120s
					_socketServ.sendAll("$WP+TRACK=0000,1,120,100,0,0,4,0","\r\n"+charCur[0]);
					output.println(this.name + "-> $WP+TRACK=0000,1,120,100,0,0,4,0");
				}
				else if(_strCommande.equalsIgnoreCase("gettrack")) // commande "gettrack" detectee ...
				{
					logger.log(Level.INFO,"CLI(" + Thread.currentThread() +") commamde gettrack detectée:");
					char charCur[] = new char[1];
					charCur[0] = '\u0000';
					// ... on envoie le message aux clients actuellement connectes
					_socketServ.sendAll("$WP+TRACK=0000,?","\r\n"+charCur[0]);
					output.println(this.name + "-> $WP+TRACK=0000,?");
				}
				else if(_strCommande.equalsIgnoreCase("resettrack")) // commande "resettrack" detectee ...
				{
					logger.log(Level.INFO,"CLI(" + Thread.currentThread() +") commamde resettrack detectée:");
					char charCur[] = new char[1];
					charCur[0] = '\u0000';
					// ... on envoie le message aux clients actuellement connectes
					_socketServ.sendAll("$WP+TRACK=0000,0","\r\n"+charCur[0]);
					output.println(this.name + "-> $WP+TRACK=0000,0");
				}
				else if(_strCommande.equalsIgnoreCase("getsim")) // commande "getsim" detectee ...
				{
					logger.log(Level.INFO,"CLI(" + Thread.currentThread() +") commamde getsim detectée:");
					char charCur[] = new char[1];
					charCur[0] = '\u0000';
					// ... on envoie le message aux clients actuellement connectes
					_socketServ.sendAll("$WP+SIMID=0000,?","\r\n"+charCur[0]);
				//	_socketServ.sendAll("getsim","\r\n"+charCur[0]);
					output.println(this.name + "-> :$WP+SIMID=0000,?");
				}
				else if(_strCommande.equalsIgnoreCase("getimei")) // commande "getimei" detectee ...
				{
					logger.log(Level.INFO,"CLI(" + Thread.currentThread() +") commamde getimei detectée:");
					char charCur[] = new char[1];
					charCur[0] = '\u0000';
					// ... on envoie le message aux clients actuellement connectes
					_socketServ.sendAll("$WP+IMEI=0000,?","\r\n"+charCur[0]);
					//_socketServ.sendAll("getimei","\r\n"+charCur[0]);
					output.println(this.name + "-> $WP+IMEI=0000,?");
				}
				else if(_strCommande.equalsIgnoreCase("getradio")) // commande "getradio" detectee ...
				{
					logger.log(Level.INFO,"CLI(" + Thread.currentThread() +") commamde getradio detectée:");
					char charCur[] = new char[1];
					charCur[0] = '\u0000';
					// ... on envoie le message aux clients actuellement connectes
					_socketServ.sendAll("$WP+GSMINFO=0000,?","\r\n"+charCur[0]);
					//_socketServ.sendAll("1001 ophone getops","\r\n"+charCur[0]);
					output.println(this.name + "-> $WP+GSMINFO=0000,?");
				}
				else if(_strCommande.equalsIgnoreCase("getversion")) // commande "getversion" detectee ...
				{
					logger.log(Level.INFO,"CLI(" + Thread.currentThread() +") commamde getversion detectée:");
					char charCur[] = new char[1];
					charCur[0] = '\u0000';
					// ... on envoie le message aux clients actuellement connectes
					_socketServ.sendAll("$WP+VER","\r\n"+charCur[0]);
					output.println(this.name + "-> $WP+VER");
					//_socketServ.sendAll("1001 ophone getops","\r\n"+charCur[0]);
				}
				else if(_strCommande.equalsIgnoreCase("disconnect")) // commande "getradio" detectee ...
				{
					logger.log(Level.INFO,"CLI(" + Thread.currentThread() +") commamde disconnect detectée:");
					// ... on deconnecte les clients actuellement connectes
					_socketServ.delAllClients();
					// ... on affiche le nombre de clients actuellement connectes
					output.println(this.name + "-> :Nombre de devices connectes : "+_socketServ.getNbClients());
				}
				else if(_strCommande.equalsIgnoreCase("help"))
				{
					logger.log(Level.INFO,"CLI(" + Thread.currentThread() +") commamde help detectée:");
					printCommandes(output);
				}
				else if(_strCommande.equalsIgnoreCase("logout"))
				{
					logger.log(Level.INFO,"CLI(" + Thread.currentThread() +") commamde logout detectée:");
					output.println(this.name + "-> Logout");
					break;
				}
				else if(_strCommande.equalsIgnoreCase("custom") && commands.length == 2 && commands[1].startsWith("$WP"))
				{
					logger.log(Level.INFO,"CLI(" + Thread.currentThread() +") commamde custom detectée:");
					char charCur[] = new char[1];
					charCur[0] = '\u0000';
					// ... on envoie le message aux clients actuellement connectes
					_socketServ.sendAll(commands[1],"\r\n"+charCur[0]);
					output.println(this.name + "-> "+commands[1]);
				}

				else if(_strCommande.equalsIgnoreCase("custom") && commands.length == 3 && commands[1].startsWith("$WP") && commands[2].matches("\\d+"))
				{
					logger.log(Level.INFO,"CLI(" + Thread.currentThread() +") commamde custom detectée:");
					char charCur[] = new char[1];
					charCur[0] = '\u0000';
					int idClient = Integer.parseInt(commands[2]);
					// ... on envoie le message aux clients actuellement connectes
					_socketServ.sendMess(commands[1],"\r\n"+charCur[0], idClient);
					//output.println(this.name + "-> "+commands[1]+" envoyé à " +idClient);
				}
				else
				{
					logger.log(Level.INFO,"CLI(" + Thread.currentThread() +") commamde inconnue detectée:");
					printCommandes(output);
					
				}
				output.flush();
				//System.out.flush(); // on affiche tout ce qui est en attente dans le flux
			}

		}
      	catch (Exception e)
		{
	  			return;
		}
      	finally
		{
	  		try 
	    	{
			    sockThread.close();
				System.out.println ("CLI" + Thread.currentThread()  + " : Logout !!! ");
				_socketServ.serverCLI.nbCLI = 0;
	  		} 
	  		catch (IOException e)
	    	{
	    	}
		}
    }

    public void printCommandes(PrintWriter output)
	{		
		output.println("--------------------------------------------------");
		output.println("Liste des commandes possibles:");
		output.println("getinfo: \t Obtenir les indentifiants");
		output.println("getlocation: \t Obtenir la position GPS");
		output.println("getsim: \t Obtenir les parametres SIM ");
		output.println("getimei: \t Obtenir les parametres IMEI");
		output.println("getradio: \t Obtenir les parametres 2G/3G");
		output.println("getversion: \t Obtenir la version du firmware");
		output.println("setconf: \t Configurer les parametres TCP");
		output.println("getconf: \t Obtenir les parametres TCP");
		output.println("settrack: \t Configurer le suivi rapide (30s et 100m) GPS");
		output.println("setnav: \t Configurer le suivi lent (120s) GPS");
		output.println("gettrack: \t Obtenir les parametres du tracking GPS");
		output.println("resettrack: \t Arret du tracking GPS");
		output.println("setevent: \t Configurer le geofencing GPS");
		output.println("resetevent: \t Arret du geofencing GPS");
		output.println("clearbuffer: \t Vider le buffer des donnees GPS");
		output.println("disconnect: \t Fermer les connexions TCP");
		output.println("list: \t\t Liste les devices connectes");
		output.println("total: \t\t Nombre de devices connectes");
		output.println("logout: \t Deconnexion du client CLI");
		output.println("custom: \t Envoie une commande personalisée");
		output.println("quit: \t\t Arrêt du serveur");
		output.println("--------------------------------------------------");
	}

}