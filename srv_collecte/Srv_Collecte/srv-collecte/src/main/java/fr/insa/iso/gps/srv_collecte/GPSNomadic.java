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

public class GPSNomadic extends GPSDevice {

	public static Logger logger;
	public static int _numClient;
        private static Vector<String> _vector;
	// cette classe se charge de faire un parsing de la trame et de renvoyer un boolean
        // true alors la classe CollectClient pourra utiliser les methodes pour extraire les
	// proprietes de la geolocalisation  
	public GPSNomadic(int _nClient) {
		super(_nClient);
		_numClient = _nClient;
		logger = Logger.getLogger(CollectServer.class.getName());
	}
	
        public Vector getVector() {
                return _vector;
        }
        
        public static void setVector(Vector vector) {
                _vector = vector;
        }
        
	public static String parseFrame(byte[] bufferData, int nlus) {

		String sId = null;

		logger.log(Level.INFO,""+_numClient+" boitier Nomadic ");
		// traitement specifique pour les devices nomadic
		// on peut recevoir plusieurs trames GPS en une seule fois
		// le separateur de la trame est alors Ox0D 0xOA
		logger.log(Level.INFO,""+_numClient+" transforme ");
		Vector<String> mVector = byteArrayToStrings(bufferData,nlus);
		logger.log(Level.INFO,""+_numClient+" retour transforme ");
		if (mVector.size() > 1) {
			logger.log(Level.INFO,""+_numClient+" taille du vector :"+mVector.size());
                        setMessage(mVector.elementAt(0));
			setVector(mVector);
                } else if (mVector.size() == 1) {
                        logger.log(Level.INFO,""+_numClient+" taille du vector :"+mVector.size());
                        setMessage(mVector.elementAt(0));
                        setVector(mVector);
		}  else {
			logger.log(Level.INFO,""+_numClient+" vector null ");
		}
                sId =  byteArrayToString(bufferData,0,10);
		return sId;
	}
}

