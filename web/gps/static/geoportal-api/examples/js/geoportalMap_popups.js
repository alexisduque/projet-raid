/*
 * Copyright (c) 2008-2013 Institut National de l'information Geographique et forestiere France, released under the
 * BSD license.
 */
/**
 * Property: viewer
 * {<Geoportal.Viewer>} the viewer global instance.
 */
viewer= null;

/**
 * Function: initMap
 * Load the application. Called when all information have been loaded by
 * <loadAPI>().
 */
function initMap() {
    //The api is loaded at this step
    //L'api est chargée à cette étape

/**
 * Class: Geoportal.Popup.Anchored.Css
 * Display Css driven popups.
 * @author : Jean-Marc Viglino (ign.fr)
 *
 *    Blocks position (see CSS) :
 *    | tl | tr |
 *    | bl | br |
 *     c
 *
 * Inherits from:
 * - {<Geoportal.Popup.Anchored>}
 */
Geoportal.Popup.Anchored.Css= OpenLayers.Class( Geoportal.Popup.Anchored, {

    /**
     * APIProperty: dOverlap
     * Vertical overlapping for the grip
     *  Defaults to *0*
     */
    dOverlap: 0,

    /**
     * APIProperty: dOffset
     * Horizontal overlapping for the grip
     *  Defaults to *20*
     */
    dOffset: 20,

    /**
     * APIProperty: cWidth
     * Grip width in pixels
     *  Defaults to *0*
     */
    cWidth: 0,

    /**
     * APIProperty: cHeight
     * Grip height in pixels
     *  Defaults to *5*
     */
    cHeight: 5,

    /**
     * APIProperty: displayClass
     * {String} The CSS class of the popup's background images.
     *  Defaults Geoportal.Popup.Anchored.prototype.displayClass+*Css*
     */
    displayClass: Geoportal.Popup.Anchored.prototype.displayClass+"Css",

    /**
     * Property: blocks
     * {Array[Object]} Array of objects, each of which is one "block" of the
     *     popup. Each block has a 'div' and an 'image' property, both of
     *     which are DOMElements, and the latter of which is appended to the
     *     former. These are reused as the popup goes changing positions for
     *     great economy and elegance.
     */
    blocks: null,

    /**
     * Constructor: Geoportal.Popup.Anchored
     * Build a popup linked with a feature.
     *
     * Parameters:
     * id - {String}
     * lonlat - {<OpenLayers.LonLat at http://dev.openlayers.org/docs/files/OpenLayers/LonLat-js.html>}
     * contentSize - {<OpenLayers.Size at http://dev.openlayers.org/docs/files/OpenLayers/Size-js.html>}
     * contentHTML - {String}
     * anchor - {Object} Object to which we'll anchor the popup. Must expose
     *     a 'size' (<OpenLayers.Size at http://dev.openlayers.org/docs/files/OpenLayers/Size-js.html>)
     *     and 'offset' (<OpenLayers.Pixel at http://dev/openlayers/org/docs/files/OpenLayers/Pixel-js.html>)
     *     (Note that this is generally an <OpenLayers.Icon at http://dev.openlayers.org/docs/files/OpenLayers/Icon-js.html>).
     * closeBox - {Boolean}
     * closeBoxCallback - {Function} Function to be called on closeBox click.
     * feature - {<OpenLayers.Feature at http://dev.openlayers.org/docs/files/OpenLayers/Feature-js.html>} the feature linked with this popup.
     */
    initialize:function(id, lonlat, contentSize, contentHTML, anchor, closeBox, closeBoxCallback, feature) {
        var newArguments= [id, lonlat, contentSize, contentHTML, anchor, closeBox, undefined, undefined, closeBoxCallback, feature];
        Geoportal.Popup.Anchored.prototype.initialize.apply(this, newArguments);

        OpenLayers.Element.addClass(this.div, this.displayClass);
        OpenLayers.Element.addClass(this.groupDiv, this.displayClass+"Group");
        OpenLayers.Element.addClass(this.contentDiv, this.displayClass+"Content");

        // Grip size:
        this.csize= new OpenLayers.Size (this.cWidth, this.cHeight -this.dOverlap );
    },

    /**
     * APIMethod: destroy
     */
    destroy:function() {
        //remove our blocks
        if (this.blocks) {
            for (var i= 0, l= this.blocks.length; i<l; i++) {
                var block= this.blocks[i];
                if (block.div) {
                    this.groupDiv.removeChild(block.div);
                    block.div= null;
                }
            }
            this.blocks= null;
        }
        this.csize= null;

        Geoportal.Popup.Anchored.prototype.destroy.apply(this, arguments);
    },

    /**
     * Method: setBackgroundColor
     * Sets the background color of the popup.
     *      Does nothing.
     *
     * Parameters:
     * color - {String} the background color.  eg "#FFBBBB"
     */
    setBackgroundColor:function(color) {
        //does nothing since the popup's entire scheme is based on a
        // an image -- changing the background color makes no sense.
    },

    /**
     * Method: setOpacity
     * Sets the opacity of the popup.
     *      Does nothing.
     *
     * Parameters:
     * opacity - {float} A value between 0.0 (transparent) and 1.0 (solid).
     */
    setOpacity:function(opacity) {
        //does nothing since we suppose that we'll never apply an opacity
        // to a popup
    },

    /**
     * Method: setBorder
     * Sets the border style of the popup.
     *      Does nothing.
     *
     * Parameters:
     * border - {String} The border style value. eg 2px
     */
    setBorder:function() {
        //does nothing since the popup's entire scheme is based on a
        // an image -- changing the popup's border makes no sense.
    },

    /**
     * Method: calculateGripPosition
     * Compute the position of the grip.
     */
    calculateGripPosition:function() {
        var pos;
        switch (this.relativePosition) {
        case 'bl' :
            pos= new OpenLayers.Pixel(this.size.w-this.csize.w-this.dOffset, -this.csize.h);
            break;
        case 'br' :
            pos= new OpenLayers.Pixel(this.dOffset, -this.csize.h);
            break;
        case 'tl' :
            pos= new OpenLayers.Pixel(this.size.w-this.csize.w-this.dOffset, this.size.h-this.dOverlap);
            break;
        case 'tr' :
            pos= new OpenLayers.Pixel(this.dOffset, this.size.h-this.dOverlap);
            break;
        }
        return pos;
    },

    /**
     * Method: createBlocks
     */
    createBlocks:function () {
        if (!this.blocks) {
            this.blocks= [];

            var block= {};
            this.blocks.push(block);

            var tblock= [ "tl", "tr", "bl", "br" ];
            var tpos= [
                new OpenLayers.Pixel(0,0),
                new OpenLayers.Pixel(Math.round(this.size.w/2), 0),
                new OpenLayers.Pixel(0, Math.round(this.size.h/2)),
                new OpenLayers.Pixel(Math.round(this.size.w/2), Math.round(this.size.h/2))
            ];
            var tsize= [
                new OpenLayers.Size(Math.round(this.size.w/2), Math.round(this.size.h/2)),
                new OpenLayers.Size(this.size.w-Math.round(this.size.w/2), Math.round(this.size.h/2)),
                new OpenLayers.Size(Math.round(this.size.w/2), this.size.h-Math.round(this.size.h/2)),
                new OpenLayers.Size(this.size.w-Math.round(this.size.w/2), this.size.h-Math.round(this.size.h/2))
            ];

            var id= this.id+'_back';
            for (var i= 0; i<4; i++) {
                block.div= OpenLayers.Util.createDiv(id+tblock[i], tpos[i], tsize[i], null, "absolute", null, "hidden", null );
                OpenLayers.Element.addClass(block.div, this.displayClass+"Back");
                OpenLayers.Element.addClass(block.div, this.displayClass+tblock[i]);
                this.groupDiv.appendChild(block.div);
            }

            block.div= OpenLayers.Util.createDiv(id+'c', this.calculateGripPosition(), null, null, "absolute", null, "hidden", null );
            OpenLayers.Element.addClass(block.div, this.displayClass+"c");
            OpenLayers.Element.addClass(block.div, this.displayClass+"c"+this.relativePosition);
            this.groupDiv.appendChild(block.div);
        }
    },

    /**
     * APIMethod: setSize
     * Overridden here, because we need to update the blocks whenever the size
     *     of the popup has changed.
     *
     * Parameters:
     * contentSize - {<OpenLayers.Size>} the new size for the popup's
     *     contents div (in pixels).
     */
    setSize:function(contentSize) {
        Geoportal.Popup.Anchored.prototype.setSize.apply(this, arguments);
        this.createBlocks();
    },

    /**
     * Method: updateRelativePosition
     * When the relative position changes, we need to set the new padding
     *     BBOX on the popup, reposition the close div, and update the blocks.
     */
    updateRelativePosition:function() {
        if (this.blocks && this.size && this.relativePosition) {
            var grip= OpenLayers.Element.getElementsByClassName(this.displayClass+"c");
            if (grip.length>0) {
                grip= grip[0];
                OpenLayers.Element.removeClass(grip, this.displayClass+"ctl");
                OpenLayers.Element.removeClass(grip, this.displayClass+"ctr");
                OpenLayers.Element.removeClass(grip, this.displayClass+"cbl");
                OpenLayers.Element.removeClass(grip, this.displayClass+"cbr");
                OpenLayers.Element.addClass(grip, this.displayClass+"c"+this.relativePosition);
                var pos= this.calculateGripPosition();
                OpenLayers.Util.modifyDOMElement(grip, null, this.calculateGripPosition());
            }
        }
    },

    /**
     * Method: calculateNewPx
     *
     * Parameters:
     * px - {<OpenLayers.Pixel at http://dev.openlayers.org/docs/files/OpenLayers/Pixel-js.html>}
     *
     * Returns:
     * {<OpenLayers.Pixel at http://dev.openlayers.org/docs/files/OpenLayers/Pixel-js.html>} The the new px position of the popup on the screen
     *     relative to the passed-in px.
     */
    calculateNewPx:function(px) {
       var newPx= Geoportal.Popup.Anchored.prototype.calculateNewPx.apply(this, arguments);

        var top= (this.relativePosition && this.relativePosition.charAt(0) == 't');
        newPx.y += (top? -this.csize.h : this.csize.h);

        var left= (this.relativePosition && this.relativePosition.charAt(1) == 'l');
        newPx.x += (left? this.csize.w/2+this.dOffset : -this.csize.w/2-this.dOffset);

        return newPx;
    },

    /**
     * Constant: CLASS_NAME
     * {String} *"Geoportal.Popup.Anchored.Css"*
     */
    CLASS_NAME: "Geoportal.Popup.Anchored.Css"
});

    // Sub-classes :

    /**
     * Class: Geoportal.Popup.Anchored.Css.Bubble
     *
     * Inherits from:
     * - {<Geoportal.Popup.Anchored.Css>}
     */
    Geoportal.Popup.Anchored.Css.Bubble= OpenLayers.Class(Geoportal.Popup.Anchored.Css, {
        displayClass:Geoportal.Popup.Anchored.Css.prototype.displayClass+'Bubble',
        dOverlap:5,
        cWidth:13,
        cHeight:11
    });

    /**
     * Class: Geoportal.Popup.Anchored.Css.Tip
     *
     * Inherits from:
     * - {<Geoportal.Popup.Anchored.Css>}
     */
    Geoportal.Popup.Anchored.Css.Tip= OpenLayers.Class(Geoportal.Popup.Anchored.Css, {
        displayClass:Geoportal.Popup.Anchored.Css.prototype.displayClass+'Tip',
        dOverlap:5,
        dOffset:-8,
        cWidth:36,
        cHeight:30
    });

    /**
     * Class: Geoportal.Popup.Anchored.Css.Classic
     *
     * Inherits from:
     * - {<Geoportal.Popup.Anchored.Css>}
     */
    Geoportal.Popup.Anchored.Css.Classic= OpenLayers.Class(Geoportal.Popup.Anchored.Css, {
        displayClass:Geoportal.Popup.Anchored.Css.prototype.displayClass+'Classic',
        dOverlap:8,
        cWidth:30,
        cHeight:32
    });

    /**
     * Class: Geoportal.Popup.Anchored.Css.Shadow
     *
     * Inherits from:
     * - {<Geoportal.Popup.Anchored.Css>}
     */
    Geoportal.Popup.Anchored.Css.Shadow= OpenLayers.Class(Geoportal.Popup.Anchored.Css, {
        displayClass:Geoportal.Popup.Anchored.Css.prototype.displayClass+'Shadow',
        dOverlap:11,
        cWidth:42,
        cHeight:35
    });

    /**
     * Class: Geoportal.Popup.Anchored.Css.Think
     *
     * Inherits from:
     * - {<Geoportal.Popup.Anchored.Css>}
     */
    Geoportal.Popup.Anchored.Css.Think= OpenLayers.Class(Geoportal.Popup.Anchored.Css, {
        displayClass:Geoportal.Popup.Anchored.Css.prototype.displayClass+'Think',
        dOverlap:18,
        dOffset:15,
        cWidth:40,
        cHeight:42
    });

    /**
     * Class: Geoportal.Popup.Anchored.Css.Black
     *
     * Inherits from:
     * - {<Geoportal.Popup.Anchored.Css>}
     */
    Geoportal.Popup.Anchored.Css.Black= OpenLayers.Class(Geoportal.Popup.Anchored.Css, {
        displayClass:Geoportal.Popup.Anchored.Css.prototype.displayClass+'Black',
        dOverlap:0,
        cWidth:28,
        cHeight:20
    });

    // add translations
    translate();

    var slct= OpenLayers.Util.getElement('gpChoosePopup');
    if (slct) {
        slct.onchange= function() {
            viewer.setVariable('popupClassName', this.options[this.selectedIndex].value);
            (viewer.getVariable('popupControler')).unselectAll();
            this.blur();
        };
        var re= new RegExp("^Geoportal\.Popup\.Anchored$");
        for (var i= 0; i<slct.options.length; i++) {
            if (slct.options[i].value.match(re)) {
                slct.options[i].selected= true;
            }
        }
    }

    //options for creating viewer:
    var options= {
        // default value
        // valeur par défaut
        //mode:'normal',
        // default value
        // valeur par défaut
        //territory:'FXX',
        // default value
        // valeur par défaut
        //displayProjection:'IGNF:RGF93G'
        // only usefull when loading external resources
        // utile uniquement pour charger des resources externes
        //proxy:'/geoportail/api/xmlproxy'+'?url='
    };

    // viewer creation of type <Geoportal.Viewer>
    // création du visualiseur du type <Geoportal.Viewer>
    //                                   HTML div id, options
    viewer= new Geoportal.Viewer.Simple('viewerDiv', OpenLayers.Util.extend(
        options,
        // API keys configuration variable set by
        // <Geoportal.GeoRMHandler.getConfig>
        // variable contenant la configuration des clefs API remplie par
        // <Geoportal.GeoRMHandler.getConfig>
        window.gGEOPORTALRIGHTSMANAGEMENT===undefined? {'apiKey':'nhf8wztv3m9wglcda6n6cbuf'} : gGEOPORTALRIGHTSMANAGEMENT)
    );
    if (!viewer) {
        // problem ...
        OpenLayers.Console.error(OpenLayers.i18n('new.instance.failed'));
        return;
    }

    //Loading of data layers
    //Chargement des couches de données
    viewer.addGeoportalLayers([
        'ORTHOIMAGERY.ORTHOPHOTOS'
    ], {});

    var popupClassName= 'Geoportal.Popup.Anchored';
    viewer.setVariable('popupClassName', popupClassName);

    //Create features
    //Création des pictos
    var n= 20, fs= new Array(n);
    for (var i= 0; i<n; i++) {
        // Calculate a random x/y. Subtract half the diameter to make some
        // features negative.
        var x= (Math.random() * 10000) - (10000 / 2);
        var y= (Math.random() * 10000) - (10000 / 2);

        var pt= new OpenLayers.Geometry.Point(viewer.viewerOptions.defaultCenter.lon + x, viewer.viewerOptions.defaultCenter.lat + y);

        fs.push(new OpenLayers.Feature.Vector(pt));
    }

    //Create a style map: the graphicName property is evaluated against the
    //type attribute
    //Créé une symbolisation cartographique: la propriété graphicName est
    //évaluée au travers de l'attribut type
    var styles= new OpenLayers.StyleMap({
        graphicName:"blazon",
        fillOpacity:0.5,
        cursor:"pointer",
        pointRadius:10
    });
    //Create new layer
    //Création de la couche vectorielle
    var popups= new OpenLayers.Layer.Vector("Popups", {
        styleMap:styles,
        opacity:1.0,
        visibility:true
    });
    popups.addFeatures(fs);
    viewer.getMap().addLayer(popups);

    //Create a hover selector to display symbol's name
    //Création d'un sélecteur par survol pour afficher le nom du symbole
    var unPopupFunc= function(f) {
        Geoportal.Control.unselectFeature(f);
    };
    var clickCtrl= new OpenLayers.Control.SelectFeature(popups, {
        autoActivate: true,
        clickout:true,
        toggle:false,
        multiple:false,
        hover: false,
        onSelect: function(f) {
            var popupClass= eval(viewer.getVariable('popupClassName'));
            // As we receive an array, arguments is an array of the array ...
            var popupCreator= (function() {
                function F() { return popupClass.prototype.initialize.apply(this,arguments[0]); }
                F.prototype= popupClass.prototype;
                return function() {
                    return new F(arguments[0]);
                }
            })();
            var newArguments= [
                "popup",
                f.geometry.getBounds().getCenterLonLat(),
                new OpenLayers.Size(200,200),
                "<b>Lorem ipsum</b><br/>Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
                null,
                true,
                function(evt) {
                    if (this.feature) {
                        clickCtrl.unselect(this.feature);
                    }
                },
                f
            ];
            if (popupClass===Geoportal.Popup.Anchored) {
                newArguments.splice(6,0,undefined,undefined);
            }
            var popup= popupCreator(newArguments);
            if (popupClass===OpenLayers.Popup.FramedCloud) {
                //mimic Geoportal.Popup
                popup.feature= f;
            }
            f.popup= popup;
            f.layer.map.addPopup(popup);
        },
        onUnselect: unPopupFunc
    });
    viewer.getMap().addControl(clickCtrl);
    viewer.setVariable('popupControler', clickCtrl);

    viewer.getMap().zoomToExtent(popups.getDataExtent(), true);

    // cache la patience - hide loading image
    viewer.div.style[OpenLayers.String.camelize('background-image')]= 'none';
}

/**
 * Function: loadAPI
 * Load the configuration related with the API keys.
 * Called on "onload" event.
 * Call <initMap>() function to load the interface.
 */
function loadAPI() {
    // wait for all classes to be loaded
    // on attend que les classes soient chargées
    if (checkApiLoading('loadAPI();',['OpenLayers','Geoportal','Geoportal.Viewer','Geoportal.Viewer.Simple'])===false) {
        return;
    }

    // load API keys configuration, then load the interface
    // on charge la configuration de la clef API, puis on charge l'application
    Geoportal.GeoRMHandler.getConfig(['nhf8wztv3m9wglcda6n6cbuf'], null,null, {
        onContractsComplete: initMap
    });
}

// assign callback when "onload" event is fired
// assignation de la fonction à appeler lors de la levée de l'évènement
// "onload"
window.onload= loadAPI;
