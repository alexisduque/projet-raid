/*
 * Classe CollectClient : est instanciee par le serveur a chaque connexion d'un device
 * cette classe se charge de lire tout ce qui arrive sur la socket
 * si une trame GPS est detectee, elle effectue une analyse de cette trame et invoque 
 * la methode insertPosition pour enregistrer les informations GPS dans la table Oracle
 * 
 * Auteur: Philippe ISORCE (c) OPhone 2012
 */
package fr.insa.iso.gps.srv_collecte;

import java.net.Socket;
import java.net.SocketTimeoutException;
import java.text.DateFormat;
import java.text.SimpleDateFormat;
import java.text.SimpleDateFormat;
import java.util.Properties;
import java.util.Date;
import java.util.Locale;
import java.util.Vector;
import java.util.Enumeration;
import java.io.FileInputStream;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.io.PrintWriter;
import java.io.BufferedReader;
import java.io.IOException;
import java.nio.ByteBuffer;
import java.nio.ByteOrder;
import java.util.logging.FileHandler;
import java.util.logging.Logger;
import java.util.logging.Formatter;
import java.util.logging.SimpleFormatter;
import java.util.logging.Handler;
import java.util.logging.Level;
import java.util.logging.LogRecord;

//** Classe associee a chaque device **
//** Il y aura autant d'instances de cette classe que de devices connectes **
//implementation de l'interface Runnable 
//class CollectClient implements Runnable
class CollectClient extends Thread {

    private Thread _t; // contiendra le thread du device
    private Socket _s; // recevra le socket liant le device
    private PrintWriter _out; // pour la gestion du flux de sortie
    private BufferedReader _in; // pour la gestion du flux d'entree en String
    private InputStream _inb; // pour la gestion du flux d'entree en binaire
    private CollectServer _socketServ; // pour utilisation des methodes de la classe principale
    private int _numClient = 0; // contiendra le numero de device gere par ce thread (commence a 0)
    private String _id_Device = null; // chaque device est identifie par un ID de device transmis dans les reponses ou dans la 1ere trame
    private PostgreSQLDataBase n_DataBase;
    private GeoTrackerService n_Service;
    private String n_user = "";
    private String n_pass = "";
    private boolean echangeOk = false;
    private int timeOutEnSecondes = 300; // timer pour la deconnexion du thread
    private byte bAck = 1; // pour acquitter une trame
    private int deviceType = 0; // 0 -> device nomadic 1-> device teltonika 
    private GPSNomadic nClient;
    private GPSTeltonika tClient;
    private GPSTK102 tkClient;
    private static FileHandler fh;
    private static String n_log = ""; // recevra le nom du fichier du log
    private static String l_log = ""; // recevra le niveau du logger
    public static Logger logger = Logger.getLogger(CollectServer.class.getName());

    //** Constructeur : cree les elements necessaires au dialogue avec le device **
    CollectClient(Socket s, CollectServer socketServ) // le param s est donnee dans SocketServ par ss.accept()
    {
        _socketServ = socketServ; // passage de local en global (pour gestion dans les autres methodes)
        _s = s; // passage de local en global
        try {
            // fabrication d'une variable permettant l'utilisation du flux de sortie avec des string
            _out = new PrintWriter(_s.getOutputStream());
            // fabrication d'une variable permettant l'utilisation du flux d'entree avec des string
            //_in = new BufferedReader(new InputStreamReader(_s.getInputStream()));
            _inb = _s.getInputStream();
            // ajoute le flux de sortie dans la liste et recuperation de son numero
            _numClient = socketServ.addClient(_out, _s);
            //	setLogger();
        } catch (IOException e) {
            logger.log(Level.WARNING, "nouveau client " + _numClient);
            //System.out.println("timeout du client "+_numClient);
        }
    }

    //** Methode :  executee au lancement du thread par t.start() **
    //** Elle attend les messages en provenance du serveur et les redirige **
    // cette methode doit obligatoirement etre implementee a cause de l'interface Runnable
    public void run() {
        String message = ""; // declaration de la variable qui recevra les messages du client
        String hmessage = ""; // stockage en hexa du message du client
        // on indique dans la console la connection d'un nouveau client
        //	logger = Logger.getLogger(ws.CollectClient.class.getName());
        logger.log(Level.WARNING, "connexion nouveau client " + _numClient);
        /*Creation de la connexion BD*/
        n_DataBase = new PostgreSQLDataBase();
        //n_DataBase.setLogger();
        // user and pass are optional temporary
        n_DataBase.setUserName(n_user);
        n_DataBase.setPassword(n_pass);
        logger.log(Level.INFO, "trying to connect to database");
        n_Service = new GeoTrackerService();
        //n_Service.setLogger();
        n_Service.setDataBase(n_DataBase);

        try {
            if (n_DataBase.Connect()) {
                /* on fait juste un test de connexion et on ferme */
                n_DataBase.Close();

            } else {
                logger.log(Level.SEVERE, "impossible de se connecter a la base de donnees");
            }
            // la lecture des donnees entrantes se fait caractere par caractere ...
            // ou en mode buffer max de 255 caracteres
            // exemple de message recu du device en mode track:
            // 1000000002,20120607205431,4.881658,45.780070,0,270,227,4,2

            byte[] data = new byte[4096];
            int nlus = 0;
            String sIMEI = null;

            while ((nlus = _inb.read(data)) != -1) // attente  des messages  (bloquant sur _in.read())
            {
                logger.log(Level.INFO, "recu du device " + nlus + " char");
                byte[] bufferData = new byte[nlus];
                System.arraycopy(data, 0, bufferData, 0, nlus);
                hmessage = byteArrayToHexString(data, nlus);
                logger.log(Level.INFO, "recu du device (hexa) " + _numClient + ":" + hmessage);
				// a la connexion du device on est par defaut sur deviceType = 0

                //GPS type TK-102
                if ((data[0] == 0x5B) & (data[1] == 0x21)) {
                    // Demande connexion
                    // longueur IMEI 15 bytes
                    logger.log(Level.INFO, "" + _numClient + " boitier TK-102 ");
                    deviceType = 2; // type boitier TK-102
                    tkClient = new GPSTK102(_numClient);
                    // la classe parseHeader envoie l'id (IMEI- du device)
                    _id_Device = tkClient.parseHeader(bufferData, nlus);

                    if (_id_Device == null) {
                        continue;
                    } else {
                        _socketServ.updateClient(_numClient, deviceType, _id_Device); // on met a jour le client de la liste
                    }

                    logger.log(Level.WARNING, "recu du tracker(" + nClient._numClient + ") TK-102 demande de connexion");
                    //On change simplemement le type de message
                    String ack = tkClient.getMessage().replaceFirst("!", ".");
                    //Envoie l'ACK
                    logger.log(Level.WARNING, "envoi au tracker(" + nClient._numClient + ") TK-102 connexion OK : " + ack);
                    _out.write(ack);
                    _out.flush();
                    continue;
                    //Reception d'un KEEP ALIVE
                } else if ((data[0] == 0x5B) & (data[1] == 0x25)) {
                    logger.log(Level.WARNING, "recu du tracker(" + nClient._numClient + ") TK-102 keepalive");
                    String tkMessage = tkClient.parseFrame(bufferData, nlus);
                    //On change simplemement le type de message
                    String ack = tkClient.getMessage().replaceFirst("%", "&");
                    //Envoie l'ACK
                    _out.write(ack);
                    _out.flush();
                    logger.log(Level.WARNING, "envoi au tracker(" + nClient._numClient + ") TK-102 : maintient de connexion");
                    continue;
                } else if ((data[0] == 0x5B) & (data[1] == 0x3D)) {
                    // Traitement
                    String tkMessage = tkClient.parseFrame(bufferData, nlus);
                    n_Service.insertTKPosition(tkClient.getMessage(), _id_Device);
                    continue;
                } else if ((data[0] == 0x5B) & (data[1] == 0x4C)) {
                    logger.log(Level.WARNING, "recu du tracker(" + nClient._numClient + ") TK-102 : GPS indisponible");
                    String tkMessage = tkClient.parseFrame(bufferData, nlus);
                    logger.log(Level.WARNING, "recu du tracker(" + nClient._numClient + ") : " + tkMessage);
                    continue;
                }
                if ((deviceType == 0) && (nlus > 17)) {
                    logger.log(Level.INFO, "" + _numClient + " boitier Nomadic ");
                    deviceType = 0; // type boitier Nomadic
                    nClient = new GPSNomadic(_numClient);
                    _id_Device = nClient.parseFrame(bufferData, nlus);
					// on ajoute le type du device et son id
                    // a la table des clients du serveur
                    _socketServ.updateClient(_numClient, deviceType, _id_Device); // on met a jour le client de la liste
                    //si le message commence par $0K(message du GPS) on redirige vers CLI
                    if (nClient.getMessage().startsWith("$")) {
                        logger.log(Level.WARNING, "recu du tracker(" + nClient._numClient + ") reponse CLI");
                        logger.log(Level.INFO, "recu du tracker(" + nClient._numClient + "): " + nClient.getMessage());
                        _socketServ.serverCLI._clientCLI.output.println("Tracker " + nClient._numClient + " -> " + nClient.getMessage());
                        _socketServ.serverCLI._clientCLI.output.flush();
                        logger.log(Level.INFO, "envoi de: " + nClient.getMessage() + " au client CLI");
                        // TODO : envoyé la réponse du trcker au client CLI
                    } else {
                        n_Service.insertPosition(nClient.getMessage());
                    }
                    continue;
                }
				// traitement specifique pour les devices teltonika
                // entete du IMEI doit etre 0x0F deux bytes et total 17 bytes
                if ((nlus == 17) && (data[0] == 0x00) && (data[1] == 0x0F)) {
                    // longueur IMEI 15 bytes
                    logger.log(Level.INFO, "" + _numClient + " boitier Teltonika ");
                    deviceType = 1; // type boitier teltonika

                    tClient = new GPSTeltonika(_numClient);
                    // la classe parseHeader envoie l'id (IMEI- du device
                    _id_Device = tClient.parseHeader(bufferData, nlus);
                    if (_id_Device == null) {
                        continue;
                    } else {
						// on ajoute le type du device et son id
                        // a la table des clients du serveur
                        _socketServ.updateClient(_numClient, deviceType, _id_Device); // on met a jour le client de la liste
                        logger.log(Level.INFO, "" + _numClient + " update IMEI:");
                    }
                    n_Service.insertPosition(tClient.getMessage());
                    // on envoie un acquittement au device reception IMEI
                    _out.write(bAck);
                    _out.flush();
                    continue;
                }
				// ensuite on recoit une trame (AVL Data Packet)
                // une entete AVL Header composee de 4 bytes (zero bytes) et la taille du tableau 
                // des donnees AVL  sur 4 bytes (int)
                // CRC  16 bits sur 4 bytes (entier) int
                if ((deviceType == 1) && (data[0] == 0x00) && (data[1] == 0x00) && (data[2] == 0x00) && (data[3] == 0x00)) {
                    byte[] bAvlAck = tClient.parseFrame(bufferData, nlus);

                    // il faut acquitter dans un int sur 4 bytes avec le nombre de AVLData
                    logger.log(Level.INFO, "device AVL Packet ACK  " + _numClient);
                    for (int j = 0; j < 4; j++) {
                        _out.write(bAvlAck[j]);
                    }
                    _out.flush();
                }
                message = ""; // on vide la chaine de message pour qu'elle soit reutilisee
            }
        } catch (Exception e) {
            logger.log(Level.SEVERE, e.toString());
            logger.log(Level.SEVERE, "exception du client " + _numClient);
        } finally // finally se produira le plus souvent lors de la deconnexion du client
        {
            // on indique a la console la deconnexion du client
            logger.log(Level.WARNING, "le device " + _numClient + " se deconnecte");
            _socketServ.delClient(_numClient); // on supprime le client de la liste
            //		_s.close(); // fermeture du socket si il ne l'a pas deja ete (a cause de l'exception levee plus haut)
            //_inb.close();
            _out.close();
        }
    }

    public static void setLogger() {
        FileHandler fh;
        Properties props = new Properties();
        try {
            // le fichier de proprietes doit se trouve a la racine du package ws
            props.load(new FileInputStream("/geotracker.properties"));
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
        if (l_log.equals("ALL")) {
            logger.setLevel(Level.ALL);
        }
        if (l_log.equals("WARNING")) {
            logger.setLevel(Level.WARNING);
        }
        if (l_log.equals("SEVERE")) {
            logger.setLevel(Level.SEVERE);
        }

        try {
            // le log sera ecrit sous la racine du package
            int limit = 1000000; // 1 Mb
            int numLogFiles = 3;
            fh = new FileHandler(n_log, limit, numLogFiles);
            System.out.println("le logger est stocke dans " + n_log);
            // on implemente son propre formatter sur le handle du fichier de log
            fh.setFormatter(new Formatter() {
                public String format(LogRecord record) {
                    SimpleDateFormat sdf = new SimpleDateFormat("MMM dd,yyyy HH:mm");
                    long mil = record.getMillis();
                    Date resultdate = new Date(mil);
                    return resultdate + " "
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

    public static String byteArrayToHexString(byte[] bArray, int nSize) {
        StringBuilder sb = new StringBuilder(nSize * 2);

        for (int i = 0; i < nSize; i++) {
            sb.append(String.format("%02x", bArray[i]));
        }
        return sb.toString().toUpperCase();
    }

}
