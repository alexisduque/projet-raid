/*
 * Classe GPSTeltonika : est instanciee par le client a chaque connexion d'un device
 * cette classe se charge de lire tout ce qui arrive sur la socket
 * si une trame GPS est detectee, elle effectue une analyse de cette trame et invoque 
 * la methode insertPosition pour enregistrer les informations GPS dans la table Oracle
 * 
 * Auteur: Philippe ISORCE (c) OPhone 2012
 */

package ws;

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

public class GPSTeltonika extends GPSDevice {

	private static Logger logger;
	private static int _numClient;
	private static String sIMEI;

	// cette classe se charge de faire un parsing de la trame et de renvoyer un boolean
        // true alors la classe CollectClient pourra utiliser les methodes pour extraire les
	// proprietes de la geolocalisation  
	public GPSTeltonika(int _nClient) {
		super(_nClient);
		_numClient = _nClient;
		logger = Logger.getLogger(ws.CollectServer.class.getName());
	}
	
	public static String parseHeader(byte[] bufferData, int nlus) {

		logger.log(Level.INFO,""+_numClient+" boitier Nomadic ");
		// traitement specifique pour les devices nomadic
		// on peut recevoir plusieurs trames GPS en une seule fois
		// le separateur de la trame est alors Ox0D 0xOA
		logger.log(Level.INFO,""+_numClient+" transforme ");
                // traitement specifique pour les devices teltonika
                // entete du IMEI doit etre 0x0F deux bytes et total 17 bytes
		if ((nlus == 17) && (bufferData[0] == 0x00) && (bufferData[1] == 0x0F)) {
                	// longueur IMEI 15 bytes
                        byte[] bIMEI = new byte[15];
                        for (int i=0; i < 15;i++)
	                        bIMEI[i]=bufferData[i+2];
			sIMEI = new String(bIMEI);
                        logger.log(Level.INFO,"IMEI pour le client "+_numClient+":"+sIMEI);
                        // le client envoie un acquittement au device reception IMEI
			return sIMEI;
		} else {
			return null;
		}
	}
	public static byte[] parseFrame(byte[] bufferData, int nlus) {

		logger.log(Level.INFO,""+_numClient+" boitier teltonika ");
		// traitement specifique pour les devices nomadic
		// on peut recevoir plusieurs trames GPS en une seule fois
		// le separateur de la trame est alors Ox0D 0xOA
		logger.log(Level.INFO,""+_numClient+" transforme ");
                // traitement specifique pour les devices teltonika

		int value = 0;
		String hmessage = "";
		// entete 8 bytes, 4 zero bytes, 4 bytes pour la longueur 
		byte[] bAvlLength = new byte[4];
		for (int i=0; i < 4;i++)
			bAvlLength[i]=bufferData[i+4];
		hmessage = byteArrayToHexString(bAvlLength,4);
		logger.log(Level.INFO,"device length (hexa) "+_numClient+":"+hmessage);
		int nAvlLength = 0;
		nAvlLength = byteArrayToInteger(bAvlLength);
		logger.log(Level.INFO,"AVL pour le client "+_numClient+":"+nAvlLength+" -> Longueur");

		// et ensuite 1 byte pour le codec et 1 pour la longueur du AVLDataArray
		// on decode le codec on aura 0x08 qui est le Codec ID
		int nAvlCodec = (int)bufferData[8];
		logger.log(Level.INFO,"AVL pour le client "+_numClient+":"+nAvlCodec+" -> Codec");
		// on decode le nombre de AVL Data exemple : on aura 0x19 hexa -> 25 
		int nAvlDataLength = 0; // pour comparer a la fin du traitement des AVL Data
		int nAvlData = bufferData[9];
		logger.log(Level.INFO,"AVL pour le client "+_numClient+":"+nAvlData+" elements AVL Data");
		// on decode chaque AVL Data apres le 10eme byte
		int _off = 0; // offset pour se deplacer dans le Packet
		for (int i = 0; i < nAvlData; i++) {
			logger.log(Level.INFO,"-----------device traitement AVLData No "+_numClient+":"+(i+1)+"----------------------");
			// les 8 premiers bytes sont le timestamp	
			byte[] bAvlDataTimestamp = new byte[8];
			for (int j=0; j < 8;j++)
				bAvlDataTimestamp[j]=bufferData[j+10+_off];
			hmessage = byteArrayToHexString(bAvlDataTimestamp,8);
			logger.log(Level.INFO,"device timestamp (hexa) "+_numClient+":"+hmessage);
			long nAvlDataTimestamp = 0;
			nAvlDataTimestamp = byteArrayToLong(bAvlDataTimestamp);
			logger.log(Level.INFO,"AVL pour le client "+_numClient+":"+nAvlDataTimestamp+" -> Timestamp");
			// on va convertir le timestamp en chaine de date  yyyyMMddHHmmss
			Date dDate = new Date(nAvlDataTimestamp);
			SimpleDateFormat dFormatter = new SimpleDateFormat("yyyyMMddHHmmss");
			String sDate = new String(dFormatter.format(dDate));
			logger.log(Level.INFO,"AVL pour le client "+_numClient+":"+sDate+" -> Date String");
			// on decode le 18 eme byte, priorite 0->low 1->high 2->panic 3->security 
			int nAvlPriority = (int)bufferData[18+_off];
			logger.log(Level.INFO,"AVL pour le client "+_numClient+":"+nAvlPriority+" -> Priorite");
			// on decode les 15 prochains bytes GPS Element
			// les 4 premiers bytes sont la longitude	
			byte[] bGPSLongitude = new byte[4];
			for (int j=0; j < 4;j++)
				bGPSLongitude[j]=bufferData[j+19+_off];
			hmessage = byteArrayToHexString(bGPSLongitude,4);
			logger.log(Level.INFO,"device longitude (hexa) "+_numClient+":"+hmessage);
			int nGPSLongitude = 0;
			nGPSLongitude = byteArrayToInteger(bGPSLongitude);
			logger.log(Level.INFO,"AVL pour le client "+_numClient+":"+nGPSLongitude+" -> Longitude");
			// on va determiner si negatif
			double vLongitude = 0;
			vLongitude = nGPSLongitude / 10000000d;
			if ((bGPSLongitude[0] | 0x0FFF) == 0xFFFF)
				vLongitude = -1 * vLongitude;
			// les 4 bytes suivants sont la latitude	
			byte[] bGPSLatitude = new byte[4];
			for (int j=0; j < 4;j++)
				bGPSLatitude[j]=bufferData[j+23+_off];
			hmessage = byteArrayToHexString(bGPSLatitude,4);
			logger.log(Level.INFO,"device latitude (hexa) "+_numClient+":"+hmessage);
			int nGPSLatitude = 0;
			nGPSLatitude = byteArrayToInteger(bGPSLatitude);
			logger.log(Level.INFO,"AVL pour le client "+_numClient+":"+nGPSLatitude+" -> Latitude");
			// on va determiner si negatif
			double vLatitude = 0;
			vLatitude = nGPSLatitude / 10000000d;
			if ((bGPSLatitude[0] | 0x0FFF) == 0xFFFF)
				vLatitude = -1 * vLatitude;
			// les 2 bytes suivants sont l altitude	
			byte[] bGPSAltitude = new byte[2];
			for (int j=0; j < 2;j++)
				bGPSAltitude[j]=bufferData[j+27+_off];
			hmessage = byteArrayToHexString(bGPSAltitude,2);
			logger.log(Level.INFO,"device altitude (hexa) "+_numClient+":"+hmessage);
			short nGPSAltitude = 0;
			nGPSAltitude = byteArrayToShort(bGPSAltitude);
			logger.log(Level.INFO,"AVL pour le client "+_numClient+":"+nGPSAltitude+" -> Altitude");
			double vAltitude = 0;
			vAltitude = nGPSAltitude / 1d;
			// les 2 bytes suivants sont l angle	
			byte[] bGPSAngle = new byte[2];
			for (int j=0; j < 2;j++)
				bGPSAngle[j]=bufferData[j+29+_off];
			hmessage = byteArrayToHexString(bGPSAngle,2);
			logger.log(Level.INFO,"device angle (hexa) "+_numClient+":"+hmessage);
			short nGPSAngle = 0;
			nGPSAngle = byteArrayToShort(bGPSAngle);
			logger.log(Level.INFO,"AVL pour le client "+_numClient+":"+nGPSAngle+" -> Angle");
			// le byte suivant est le nombre de satellites 
			int nGPSSatellites = (int)bufferData[31+_off];
			logger.log(Level.INFO,"AVL pour le client "+_numClient+":"+nAvlPriority+" -> Satellites");
			// les 2 bytes suivants sont la vitesse	
			byte[] bGPSSpeed = new byte[2];
			for (int j=0; j < 2;j++)
				bGPSSpeed[j]=bufferData[j+32+_off];
			hmessage = byteArrayToHexString(bGPSSpeed,2);
			logger.log(Level.INFO,"device speed (hexa) "+_numClient+":"+hmessage);
			short nGPSSpeed = 0;
			nGPSSpeed = byteArrayToShort(bGPSSpeed);
			logger.log(Level.INFO,"AVL pour le client "+_numClient+":"+nGPSSpeed+" -> Speed");
			// On passe aux IO Elements 6 bytes (attention on en a 8 si event IO
			// si on a 0 dans le 34 byte alors on a 6 bytes dans IO Element
			// sinon on en a 8
			// on va decoder le nombre AVL Data sur un byte 
			// et on pourra comparer avec la valeur en debut de AVLData
			int _ioOff = 0;
			if ((int)bufferData[34+_off] == 0) {
				// 32 + 6
				nAvlDataLength = bufferData[38+_off];
				_ioOff = 0;
			} else { 
				// 32 + 8
				nAvlDataLength = bufferData[40+_off];
				_ioOff = 2;
			}
			// on va formatter le message pour la position	
			// 356307040837709,20120607205431,4.881658,45.780070,0,270,227,4,2
			// IMEI, DateString, Longitude, Latitude, Speed, Heading,Altitude, nbSat, Event

			String st = new String(sIMEI+","+sDate+","+
				vLongitude+","+
				vLatitude+","+
				nGPSSpeed+","+nGPSAngle+","+
				vAltitude+","+
				nGPSSatellites+",0"
			);
			logger.log(Level.INFO,""+_numClient+" insere :"+
			"IMEI, DateString, Longitude, Latitude, Speed, Heading,Altitude, nbSat, Event");
			logger.log(Level.WARNING,""+_numClient+" insere :"+st);
			setMessage(st);
		/*	
			int res = n_Service.insertPosition(st);
			if (res == 0) { 
				logger.log(Level.INFO,"insert pour le client "+_numClient+" OK");
			} else {
				logger.log(Level.INFO,"insert pour le client "+_numClient+" NOK");
			}
		*/		
			// la taille du AVLData est de 30 ou 32 octets
			_off = _off + _ioOff + 30;
			logger.log(Level.INFO,""+_numClient+" AVL offset :"+_off);
		} // on a fini de traiter tous les AVL DATA
		logger.log(Level.INFO,"AVL pour le client "+_numClient+": FIN Traitement des AVLData");
		// on a un offset de 10+_off pour trouver le dernier byte de la longueur
		//nAvlDataLength = (int)bufferData[10+_off]; 
		// on controle la variable de 4 octets qui va servir d'acquittement
		byte[] bAvlDataLength = new byte[4];
		bAvlDataLength[3] = bufferData[10+_off]; 
		hmessage = byteArrayToHexString(bAvlDataLength,4);
		logger.log(Level.INFO,"device  nb AVLData (hexa) "+_numClient+":"+hmessage);
		nAvlDataLength = byteArrayToInteger(bAvlDataLength);
		logger.log(Level.INFO,"AVL pour le client "+_numClient+":"+nAvlDataLength+" elements AVL Data");
		// on envoie le nombre de AVL Data recus comme acquittement
		if (nAvlData == nAvlDataLength) {
			logger.log(Level.INFO,"AVL pour le client "+_numClient+":"+nAvlDataLength+" trame AVL Data OK");
			// il faut acquitter dans un int sur 4 bytes avec le nombre de AVLData
			logger.log(Level.INFO,"device AVL Packet ACK  "+_numClient);
			return bAvlDataLength;
		} else {
			logger.log(Level.SEVERE,"AVL pour le client "+_numClient+":"+nAvlDataLength+" trame AVL Data NOK");
			bAvlDataLength[3] = 0x00; 
			
			return bAvlDataLength;
		}
	}
}

