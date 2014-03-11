/*
 * Classe GPSNomadic : est instanciee par le client a chaque connexion d'un device
 * cette classe se charge de lire tout ce qui arrive sur la socket
 * si une trame GPS est detectee, elle effectue une analyse de cette trame et invoque 
 * la methode insertPosition pour enregistrer les informations GPS dans la table Oracle
 * 
 * Auteur: Philippe ISORCE (c) OPhone 2012
 */
package fr.insa.iso.gps.srv_collecte;

import java.text.DateFormat;
import java.text.SimpleDateFormat;
import java.util.Date;
import java.util.Locale;
import java.util.Vector;
import java.util.Enumeration;
import java.util.logging.Logger;
import java.util.logging.Level;
import java.io.FileInputStream;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.io.PrintWriter;
import java.io.BufferedReader;
import java.io.IOException;
import java.nio.ByteBuffer;
import java.nio.ByteOrder;

public class GPSTK102 extends GPSDevice {

    public static Logger logger;
    public static int _numClient;
    private static String sIMEI;
    
    // cette classe se charge de faire un parsing de la trame et de renvoyer un boolean
    // true alors la classe CollectClient pourra utiliser les methodes pour extraire les
    // proprietes de la geolocalisation  
    public GPSTK102(int _nClient) {
        super(_nClient);
        _numClient = _nClient;
        logger = Logger.getLogger(CollectServer.class.getName());
    }

    public static String parseHeader(byte[] bufferData, int nlus) {

        logger.log(Level.INFO, "" + _numClient + " boitier TK-102 ");
        logger.log(Level.INFO, "" + _numClient + " transforme ");

        String message = new String(bufferData);
                // traitement specifique pour les devices teltonika
        // entete du IMEI doit etre 0x0F deux bytes et total 17 bytes
        if (message.startsWith("[!")) {
            sIMEI = message.substring(14, 28);
            logger.log(Level.INFO, "" + _numClient + " (hexa) :" + message.length() + ":" + sIMEI.getBytes());
            logger.log(Level.WARNING, "" + _numClient + " ID :" + message.length() + ":" + sIMEI.getBytes());
            logger.log(Level.INFO, "" + _numClient + " header :" + message);
            setMessage(message);

        } else {
            return null;
        }
        return sIMEI;
    }

    public static String parseFrame(byte[] bufferData, int nlus) {

        logger.log(Level.INFO, "" + _numClient + " boitier TK-102 ");
        // traitement specifique pour les devices nomadic
        // on peut recevoir plusieurs trames GPS en une seule fois
        // le separateur de la trame est alors Ox0D 0xOA
        logger.log(Level.INFO, "" + _numClient + " transforme ");
        String message = new String(bufferData);
        logger.log(Level.INFO, "" + _numClient + " retour transforme ");
        if (message.length() > 0) {
            logger.log(Level.INFO, "" + _numClient + " taille du message :" + message.length());
            // on va extraire l ID de la trame sur 10 caracteres	
            logger.log(Level.INFO, "" + _numClient + " insere :" + message);
            setMessage(message);
        }
        return message;
    }
}
