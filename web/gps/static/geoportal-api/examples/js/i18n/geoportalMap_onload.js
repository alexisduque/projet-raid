/*
 * Copyright (c) 2008-2013 Institut National de l'information Geographique et forestiere France, released
 * under the
 * BSD license.
 */
OpenLayers.Util.extend(Geoportal$translations, {
    'new.instance.already.called':
    {
        'de':"Karte bereits ?!",
        'en':"Map already created ?!",
        'es':"Mapa ya creado ?!",
        'fr':"Carte déjà créée ?!",
        'it':"Mappa già creato ?!"
    },
    'callback':
    {
        'de':"aufruf $"+"{name}",
        'en':"calling $"+"{name}",
        'es':"llamando $"+"{name}",
        'fr':"appel à $"+"{name}",
        'it':"chiamando $"+"{name}"
    },
    'example_title':
    {
        'de':"onload ereignis",
        'en':"onload event",
        'es':"evento onload",
        'fr':"Évènement onload",
        'it':"evento onload"
    },
    'example_explain':
    {
        'de':"Diese karte zeigt die 'onload' veranstaltung callbacks stack. Das Geoportal des onload rückruf wird immer aufgerufen, nachdem alle anderen rückrufe.",
        'en':"This map shows the 'onload' event's callbacks stack. The Geoportal's onload callback is always called after all other callbacks.",
        'es':"Este mapa muestra la 'onload' del evento callbacks pila. El Geoportal del onload de devolución de llamada es siempre el nombre de todas las demás llamadas.",
        'fr':"Cette carte montre l'ordre de chargement des fonctions liées à l'évènement 'onload'. La fonction liée à l'API du Géoportail est toujours exécutée en dernière position.",
        'it':"Questa mappa mostra la 'onload' evento di callback pila. Il Geoportal's onload richiamata è sempre chiamato, dopo tutti gli altri richiamate."
    }
});
