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

//** Classe qui gere les commandes tappees dans la console **
// implementation de l'interface Runnable (une des 2 methodes pour creer un thread)
class CollectConsole implements Runnable
{
	CollectServer _socketServ; // pour utilisation des methodes de la classe principale
	BufferedReader _in; // pour gestion du flux d'entree (celui de la console)
	String _strCommande=""; // contiendra la commande tapee au clavier
	Thread _t; // contiendra le thread
	Integer[] _clients;
	//** Constructeur : initialise les variables necessaires **
	CollectConsole(CollectServer socketServ)
	{
		_socketServ=socketServ; // passage de local en global
		// le flux d'entree de la console sera gere plus pratiquement dans un BufferedReader
		_in = new BufferedReader(new InputStreamReader(System.in));
		_t = new Thread(this); // instanciation du thread
		_t.start(); // demarrage du thread, la fonction run() est ici lancee
	}

	//** Methode : attend les commandes dans la console et execute l'action demandee **
	public void run() // cette methode doit obligatoirement etre implementuee a cause de l'interface Runnable
	{
		try
		{
			// si aucune commande n'est tappee, on ne fait rien (bloquant sur _in.readLine())
			while ((_strCommande=_in.readLine())!=null)
			{
				if (_strCommande.equalsIgnoreCase("quit")) // commande "quit" detectee ...
					System.exit(0); // ... on ferme alors le serveur pas bon
				else if(_strCommande.equalsIgnoreCase("total")) // commande "total" detectee ...
				{
					// ... on affiche le nombre de clients actuellement connectes
					System.out.println("Nombre de devices connectes : "+_socketServ.getNbClients());
					System.out.println("---------------------------------");
				}
				else if(_strCommande.equalsIgnoreCase("list")) // commande "list" detectee ...
				{
					// ... on affiche les infos des clients actuellement connectes
					System.out.println("Nombre de devices connectes : "+_socketServ.getNbClients());
					System.out.println("---------------------------------");
					//_socketServ.listAllClients();
				}
				else if(_strCommande.equalsIgnoreCase("getinfo")) // commande "getinfo" detectee ...
				{
					char charCur[] = new char[1];
					charCur[0] = '\u0000';
					// ... on envoie le message aux devices actuellement connectes
					_socketServ.sendAll("$WP+UNCFG=0000,?","\r\n"+charCur[0]);
					//_socketServ.sendAll("1001 ophone getstatus","\r\n"+charCur[0]);
				}
				else if(_strCommande.equalsIgnoreCase("getlocation")) // commande "getlocation" detectee ...
				{
					char charCur[] = new char[1];
					charCur[0] = '\u0000';
					// ... on envoie le message aux clients actuellement connectes
					_socketServ.sendAll("$WP+GETLOCATION=0000","\r\n"+charCur[0]);
					//_socketServ.sendAll("getgps","\r\n"+charCur[0]);
				}
				else if(_strCommande.equalsIgnoreCase("setconf")) // commande "setconf" detectee ...
				{
					char charCur[] = new char[1];
					charCur[0] = '\u0000';
					// ... on envoie le message aux clients actuellement connectes
					_socketServ.sendAll("$WP+COMMTYPE=0000,4,,,Free,,,62.39.82.98,42400,0,212.27.40.241","\r\n"+charCur[0]);
				}
				else if(_strCommande.equalsIgnoreCase("getconf")) // commande "getconf" detectee ...
				{
					char charCur[] = new char[1];
					charCur[0] = '\u0000';
					// ... on envoie le message aux clients actuellement connectes
					_socketServ.sendAll("$WP+COMMTYPE=0000,?","\r\n"+charCur[0]);
					//_socketServ.sendAll("getstatus","\r\n"+charCur[0]);
				}
				else if(_strCommande.equalsIgnoreCase("setevent")) // commande "setevent" detectee ...
				{
					char charCur[] = new char[1];
					charCur[0] = '\u0000';
					// ... on envoie le message aux clients actuellement connectes
					_socketServ.sendAll("$WP+SETEVT=0000,50,1,4.882023,45.780110,500,2,2","\r\n"+charCur[0]);
				}
				else if(_strCommande.equalsIgnoreCase("resetevent")) // commande "resetevent" detectee ...
				{
					char charCur[] = new char[1];
					charCur[0] = '\u0000';
					// ... on envoie le message aux clients actuellement connectes
					_socketServ.sendAll("$WP+CLREVT=0000,50","\r\n"+charCur[0]);
				}
				else if(_strCommande.equalsIgnoreCase("clearbuffer")) // commande "clearbuffer" detectee ...
				{
					char charCur[] = new char[1];
					charCur[0] = '\u0000';
					// ... on envoie le message aux clients actuellement connectes
					// on va vider le buffer de la pile des positions enregistres dans device
					_socketServ.sendAll("$WP+QBCLR=0000","\r\n"+charCur[0]);
				}
				else if(_strCommande.equalsIgnoreCase("settrack")) // commande "settrack" detectee ...
				{
					char charCur[] = new char[1];
					charCur[0] = '\u0000';
					// ... on envoie le message aux clients actuellement connectes
					// si le signal GPS est valide et si la distance a change de 10m
					// le device envoie sa position en continu toutes les 120s
					_socketServ.sendAll("$WP+TRACK=0000,3,30,100,0,0,4,15","\r\n"+charCur[0]);
				}
				else if(_strCommande.equalsIgnoreCase("setnav")) // commande "setnav" detectee ...
				{
					char charCur[] = new char[1];
					charCur[0] = '\u0000';
					// ... on envoie le message aux clients actuellement connectes
					// si le signal GPS est valide et si la distance a change de 10m
					// le device envoie sa position en continu toutes les 120s
					_socketServ.sendAll("$WP+TRACK=0000,1,120,100,0,0,4,0","\r\n"+charCur[0]);
				}
				else if(_strCommande.equalsIgnoreCase("gettrack")) // commande "gettrack" detectee ...
				{
					char charCur[] = new char[1];
					charCur[0] = '\u0000';
					// ... on envoie le message aux clients actuellement connectes
					_socketServ.sendAll("$WP+TRACK=0000,?","\r\n"+charCur[0]);
				}
				else if(_strCommande.equalsIgnoreCase("resettrack")) // commande "resettrack" detectee ...
				{
					char charCur[] = new char[1];
					charCur[0] = '\u0000';
					// ... on envoie le message aux clients actuellement connectes
					_socketServ.sendAll("$WP+TRACK=0000,0","\r\n"+charCur[0]);
				}
				else if(_strCommande.equalsIgnoreCase("getsim")) // commande "getsim" detectee ...
				{
					char charCur[] = new char[1];
					charCur[0] = '\u0000';
					// ... on envoie le message aux clients actuellement connectes
					_socketServ.sendAll("$WP+SIMID=0000,?","\r\n"+charCur[0]);
				//	_socketServ.sendAll("getsim","\r\n"+charCur[0]);
				}
				else if(_strCommande.equalsIgnoreCase("getimei")) // commande "getimei" detectee ...
				{
					char charCur[] = new char[1];
					charCur[0] = '\u0000';
					// ... on envoie le message aux clients actuellement connectes
					_socketServ.sendAll("$WP+IMEI=0000,?","\r\n"+charCur[0]);
					//_socketServ.sendAll("getimei","\r\n"+charCur[0]);
				}
				else if(_strCommande.equalsIgnoreCase("getradio")) // commande "getradio" detectee ...
				{
					char charCur[] = new char[1];
					charCur[0] = '\u0000';
					// ... on envoie le message aux clients actuellement connectes
					_socketServ.sendAll("$WP+GSMINFO=0000,?","\r\n"+charCur[0]);
					//_socketServ.sendAll("1001 ophone getops","\r\n"+charCur[0]);
				}
				else if(_strCommande.equalsIgnoreCase("getversion")) // commande "getversion" detectee ...
				{
					char charCur[] = new char[1];
					charCur[0] = '\u0000';
					// ... on envoie le message aux clients actuellement connectes
					_socketServ.sendAll("$WP+VER","\r\n"+charCur[0]);
					//_socketServ.sendAll("1001 ophone getops","\r\n"+charCur[0]);
				}
				else if(_strCommande.equalsIgnoreCase("disconnect")) // commande "getradio" detectee ...
				{
					// ... on deconnecte les clients actuellement connectes
					_socketServ.delAllClients();
					// ... on affiche le nombre de clients actuellement connectes
					System.out.println("Nombre de devices connectes : "+_socketServ.getNbClients());
					System.out.println("---------------------------------");
				}
				else
				{
					//_socketServ.printCommandes();
				}
				System.out.flush(); // on affiche tout ce qui est en attente dans le flux
			}
		}
		catch (IOException e) {
			System.out.println(e.toString());
		}
	}
}
