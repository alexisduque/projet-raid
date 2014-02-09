/*
 * Classe CollectServer : est instanciee par son constructeur 
 * cette classe se charge d ecouter sur le port par defaut ou passe en parametre.
 * Des qu'un device se connecte, on instancie la classe CollectClient dans un nouveau Thread.
 * et retourne ecouter sur son port. La classe et ses propietes sont partagees par une autre classe
 * Commandes qui se charge de gerer les entrees clavier.
 * 
 * Auteur: Philippe ISORCE (c) OPhone 2012
 */

package fr.insa.iso.gps.srv_collecte;

import java.text.SimpleDateFormat;
import java.util.Properties;
import java.util.Date;
import java.util.Vector;
import java.util.logging.FileHandler;
import java.util.logging.Logger;
import java.util.logging.Formatter;
import java.util.logging.Level;
import java.util.logging.LogRecord;
import java.io.PrintWriter;
import java.io.IOException;
import java.net.Socket;
import java.net.ServerSocket;



//** Classe principale du serveur, gere les parametres globaux **
public class CollectServer 
{
	private Vector<PrintWriter> _tabClients = new Vector<PrintWriter>(); // contiendra tous les flux de sortie vers les clients
	private Vector<CClient> _sockClients = new Vector<CClient>();
	private int _nbClients=0; // nombre total de clients connectes
        public static Logger logger = Logger.getLogger(CollectServer.class.getName());
	private static FileHandler fh;
        private static String n_log = ""; // recevra le nom du fichier du log
        private static String l_log = ""; // recevra le niveau du logger

	//** Methode : la premiere methode executee, elle attend les connections **
	public static void main(String args[]) 
	{
		CollectServer socketServ = new CollectServer(); // instance de la classe principale
		setLogger();
		try {
			Integer port;
			if(args.length<=0) 
				port=new Integer("2947"); // si pas d'arguments : port 42500 par defaut
			else 
				port = new Integer(args[0]); // sinon il s'agit du numero de port passe en argument

			new CollectConsole(socketServ); // lance le thread de gestion des commandes
			// on pourrait creer objet OracleDataBase ici et commun a tous les thread RAF
			ServerSocket ss = new ServerSocket(port.intValue()); // ouverture d'un socket serveur sur port
      			logger.log(Level.WARNING,"starting on port "+port);
			printWelcome(port);
		
			while (true) // attente en boucle de connexion (bloquant sur ss.accept)
			{
				Socket sc = ss.accept(); // un client se connecte, un nouveau thread client est lance
      				logger.log(Level.WARNING,"nouveau client");
      				logger.log(Level.INFO,"timeout actif");
				sc.setSoTimeout(180*1000);
				CollectClient _client = new CollectClient(sc, socketServ);
				_client.start();
			}
		} catch (Exception e) { 
			System.out.println(e.toString());
      			logger.log(Level.WARNING,"timeout expired");
		}
	}

	//** Methode : affiche le message d'accueil **
	private static void printWelcome(Integer port)
	{
		System.out.println("----------------------------------------");
		System.out.println("CollectServer : ");
		System.out.println("----------------------------------------");
		System.out.println("Demarre sur le port : "+port.toString());
	}
	synchronized public void printCommandes()
	{		
		System.out.println("--------------------------------------------------");
		System.out.println("Liste des commandes possibles:");
		System.out.println("getinfo: \t Obtenir les indentifiants");
		System.out.println("getlocation: \t Obtenir la position GPS");
		System.out.println("getsim: \t Obtenir les parametres SIM ");
		System.out.println("getimei: \t Obtenir les parametres IMEI");
		System.out.println("getradio: \t Obtenir les parametres 2G/3G");
		System.out.println("getversion: \t Obtenir la version du firmware");
		System.out.println("setconf: \t Configurer les parametres TCP");
		System.out.println("getconf: \t Obtenir les parametres TCP");
		System.out.println("settrack: \t Configurer le suivi rapide (30s et 100m) GPS");
		System.out.println("setnav: \t Configurer le suivi lent (120s) GPS");
		System.out.println("gettrack: \t Obtenir les parametres du tracking GPS");
		System.out.println("resettrack: \t Arret du tracking GPS");
		System.out.println("setevent: \t Configurer le geofencing GPS");
		System.out.println("resetevent: \t Arret du geofencing GPS");
		System.out.println("clearbuffer: \t Vider le buffer des donnees GPS");
		System.out.println("disconnect: \t Fermer les connexions TCP");
		System.out.println("list: \t\t Liste les devices connectes");
		System.out.println("total: \t\t Nombre de devices connectes");
		System.out.println("quit: \t\t Quitter");
		System.out.println("--------------------------------------------------");
	}

	//** Methode : envoie le message GETLOCATION a tous les clients **
	synchronized public void sendAll(String message,String sLast)
	{
		PrintWriter out; // declaration d'une variable permettant l'envoie de texte vers le client
		for (int i = 0; i < _tabClients.size(); i++) // parcours de la table des connectes
		{
			out =  _tabClients.elementAt(i); // extraction de l'element courant (type PrintWriter)
			if (out != null) // securite, l'element ne doit pas etre vide
			{
				// ecriture du texte passe en parametre (et concatenation d'ue string de fin de chaine si besoin)
				out.print(message+sLast);
				out.flush(); // envoi dans le flux de sortie
			}
		}
	}

	//** Methode : detruit le client no i **
	synchronized public void delClient(int i)
	{
		_nbClients--; // un client en moins ! snif
		if (_tabClients.elementAt(i) != null) // l'element existe ...
		{
			_tabClients.removeElementAt(i); // ... on le supprime
			try {
				if (_sockClients.elementAt(i).getSocket() != null) { 
					Socket sl = _sockClients.elementAt(i).getSocket();
					if (sl != null)
						sl.close(); // on ferme la socket client
					_sockClients.removeElementAt(i); // on supprime le client
				}
			} catch (Exception e) {
      				logger.log(Level.WARNING,"erreur fermeture de socket");
			//	System.out.println("erreur fermeture socket");	
			}
		}
	}
	synchronized public void updateClient(int indice, int type, String sid)
	{
		if (_sockClients.elementAt(indice).getSocket() != null) { 
			_sockClients.elementAt(indice).setType(type);
			_sockClients.elementAt(indice).setId(sid);
      			logger.log(Level.INFO,"met a jour client:"+sid);
		}
	}
	synchronized public void listAllClients()
	{
		
		for (int i = 0;i < _nbClients;i++) {
			if (_sockClients.elementAt(i).getSocket() != null) { 
				if (_sockClients.elementAt(i).getType() == 0)
					System.out.println("rg:"+i+", id:"+_sockClients.elementAt(i).getId()+", type:nomadic") ;
				else
					System.out.println("rg:"+i+", id:"+_sockClients.elementAt(i).getId()+", type:teltonika") ;
			}
			// on affiche les infos du client sur la console
		}
	}
	synchronized public void delAllClients()
	{
		
		for (int i = 0;i < _nbClients;i++) {
			delClient(i);
		}
		_nbClients = 0;
	}
	//** Methode : ajoute un nouveau client dans la liste **
	synchronized public int addClient(PrintWriter out, Socket s)
	{
		_nbClients++; // un client en plus ! 
		_tabClients.addElement(out); // on ajoute le nouveau flux de sortie au tableau
		CClient cc = new CClient();
		cc.setSocket(s);  // on ajoute la nouvelle socket client
		_sockClients.addElement(cc); // on ajoute le nouveau client
      		logger.log(Level.WARNING,"ajout du client");
		return _tabClients.size()-1; // on retourne le numero du client ajoute (size-1)
	}

	//** Methode : retourne le nombre de clients connectes **
	synchronized public int getNbClients()
	{
		return _nbClients; // retourne le nombre de clients connectes
	}

	public static void setLogger()
	{
	    	FileHandler fh;
                Properties props = new Properties();
                try {
                        // le fichier de proprietes doit se trouve a la racine du package ws
                        props.load(Thread.currentThread().getContextClassLoader().getResourceAsStream("geotracker.properties"));
                        n_log = props.getProperty("LOG");
                } catch (IOException e) {
                        e.printStackTrace();
                        System.out.println("impossible de trouver le fichier properties");
                }

		// pour stopper les logs sur la console ou les parents
		logger.setUseParentHandlers(false);
		// pour acepter tous les niveaux
		// dans les proprietes on a LEVEL qui va indiquer le niveau du logger
		l_log = props.getProperty("LEVEL");	
		if (l_log.equals("ALL"))
      			logger.setLevel(Level.ALL);
		if (l_log.equals("WARNING"))
      			logger.setLevel(Level.WARNING);
		if (l_log.equals("SEVERE"))
      			logger.setLevel(Level.SEVERE);

		try {
			// le log sera ecrit sous la racine du package
			int limit = 10000000; // 1 Mb
			int numLogFiles = 2;
      			fh = new FileHandler(n_log, limit,numLogFiles);
			System.out.println("le logger est stocke dans "+ n_log);
			// on implemente son propre formatter sur le handle du fichier de log
			fh.setFormatter(new Formatter() {
      				public String format(LogRecord record) {
					SimpleDateFormat sdf = new SimpleDateFormat("MMM dd,yyyy HH:mm");
					long mil = record.getMillis();
					Date resultdate = new Date(mil);
        				return resultdate +" " 
					+ record.getLevel() + " ["
            				+ record.getSourceClassName() + "] ["
            				+ record.getSourceMethodName() + "] "
            				+ record.getMessage() + "\n";
      				}
    			});
			// et on affecte ce formatter au logger
      			logger.addHandler(fh);
/*
			// SimpleFormatter genere des messages sous forme texte
      			SimpleFormatter formatter = new SimpleFormatter();
			// on choisit le mode log texte et non XML
      			fh.setFormatter(formatter);
*/
    		} catch (SecurityException e) {
      			e.printStackTrace();
    		} catch (IOException e) {
      			e.printStackTrace();
    		}
	}
}
