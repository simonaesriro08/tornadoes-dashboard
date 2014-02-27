dojo.require("dijit.layout.BorderContainer");
dojo.require("dijit.layout.ContentPane");
dojo.require("esri.arcgis.utils");
dojo.require("esri.map");

/******************************************************
***************** begin config section ****************
*******************************************************/

var TITLE = "Tornadoes"
var BYLINE = "Let's twist again, like we did last summer."
var WEBMAP_ID = "caca75ada5f14f1dad84a560db831a50";
var GEOMETRY_SERVICE_URL = "http://tasks.arcgisonline.com/ArcGIS/rest/services/Geometry/GeometryServer";

/******************************************************
***************** end config section ******************
*******************************************************/

var _map;

var _dojoReady = false;
var _jqueryReady = false;

var _homeExtent; // set this in init() if desired; otherwise, it will 
				 // be the default extent of the web map;

var _isMobile = isMobile();

var _isEmbed = false;
var _tornadoes;
var _subset;

var _layer5;
var _layer4;
var _layer3;
var _layer2;
var _layer1;
var _layer0;

/*

might need this if you're using icons.

var _lutBallIconSpecs = {
	tiny:new IconSpecs(24,24,12,12),
	medium:new IconSpecs(30,30,15,15),
	large:new IconSpecs(30,30,15,15)
}
*/

dojo.addOnLoad(function() {_dojoReady = true;init()});
jQuery(document).ready(function() {_jqueryReady = true;init()});

function init() {
	
	if (!_jqueryReady) return;
	if (!_dojoReady) return;
	
	// determine whether we're in embed mode
	
	var queryString = esri.urlToObject(document.location.href).query;
	if (queryString) {
		if (queryString.embed) {
			if (queryString.embed.toUpperCase() == "TRUE") {
				_isEmbed = true;
			}
		}
	}
	
	// jQuery event assignment
	
	$(this).resize(handleWindowResize);
	
	$("#zoomIn").click(function(e) {
        _map.setLevel(_map.getLevel()+1);
    });
	$("#zoomOut").click(function(e) {
        _map.setLevel(_map.getLevel()-1);
    });
	$("#zoomExtent").click(function(e) {
        _map.setExtent(_homeExtent);
    });
	
	$("#title").append(TITLE);
	$("#subtitle").append(BYLINE);	

	for (var year = 1950; year < 2012; year++)
	{
		$("select").append("<option>"+year+"</option>");
	}
	
	$("select").change(function(e) {
		doYear($("select option:selected").eq(0).html().slice(2));
    });
	
	$.ajax({
	  type: 'GET',
	  url: "data/1950-2012_torn_scrubbed.csv",
	  cache: false,
	  success: function(text) {	
		  $("#waitMsg").html("Unpacking...");
		  setTimeout(function(){
			var serviceTornadoes = new CSVService();
			serviceTornadoes.process(text);
			var parser = new RecordParser();
			_tornadoes = parser.getRecs(serviceTornadoes.getLines());
			$("#whiteOut").fadeOut();
			doYear($("select option:selected").eq(0).html().slice(2));
		  }, 100);
	  }
	});	

	_map = new esri.Map("map",
						{
							basemap:"gray",
							center: [-101.37, 39.32],
  							zoom: 4,
							slider: false
						});
	
	_layer4 = new esri.layers.GraphicsLayer();
	_layer5 = new esri.layers.GraphicsLayer();
	_layer3 = new esri.layers.GraphicsLayer();
	_layer2 = new esri.layers.GraphicsLayer();
	_layer1 = new esri.layers.GraphicsLayer();
	_layer0 = new esri.layers.GraphicsLayer();
	
	_map.addLayer(_layer0);
	_map.addLayer(_layer1);
	_map.addLayer(_layer2);
	_map.addLayer(_layer3);
	_map.addLayer(_layer4);
	_map.addLayer(_layer5);

	if(_map.loaded){
		initMap();
	} else {
		dojo.connect(_map,"onLoad",function(){
			initMap();
		});
	}

}

function initMap() {
	
	// if _homeExtent hasn't been set, then default to the initial extent
	// of the web map.  On the other hand, if it HAS been set AND we're using
	// the embed option, we need to reset the extent (because the map dimensions
	// have been changed on the fly).

	if (!_homeExtent) {
		_homeExtent = _map.extent;
	} else {
		if (_isEmbed) {
			setTimeout(function(){
				_map.setExtent(_homeExtent)
			},500);
		}	
	}
	
	/*
	
	use this for layer interactivity
	
	dojo.connect(_layerOV, "onMouseOver", layerOV_onMouseOver);
	dojo.connect(_layerOV, "onMouseOut", layerOV_onMouseOut);
	dojo.connect(_layerOV, "onClick", layerOV_onClick);		
	*/
	
	handleWindowResize();
	
}

function doYear(year)
{
	_subset = $.grep(_tornadoes, function(n, i){return n.date.split("/")[2] == year});
	_layer5.clear();
	_layer4.clear();
	_layer3.clear();
	_layer2.clear();
	_layer1.clear();
	_layer0.clear();
	var sr = new esri.SpatialReference(4326);
	$.each(_subset, function(index, value){
		  var pt = new esri.geometry.Point(value.starting_long, value.starting_lat, sr);
		  var sym;
		  if (value.f_scale > 0)
		  	sym = createPictureMarkerSymbol(value.f_scale);
		  else
		  	sym = createSimpleMarkerSymbol(8, new dojo.Color([153,153,92,1]), new dojo.Color([255,255,255,1]));
		  var graphic = new esri.Graphic(pt, sym);
		  if (value.f_scale == 5) _layer5.add(graphic);		
		  else if (value.f_scale == 4) _layer4.add(graphic);		
		  else if (value.f_scale == 3) _layer3.add(graphic);		
		  else if (value.f_scale == 2) _layer2.add(graphic);		
		  else if (value.f_scale == 1) _layer1.add(graphic);		
		  else _layer0.add(graphic);
	});
}

createPictureMarkerSymbol = function(score)
{
	var specs = {1:27, 2:27, 3:27,4:32,5:40}
	return new esri.symbol.PictureMarkerSymbol(
				"resources/images/marker-X.png".replace("X", score), 
				specs[score],
				specs[score]
			);	
}

createSimpleMarkerSymbol = function(size, rgb, rgbOutline)
{
	return new esri.symbol.SimpleMarkerSymbol(
				esri.symbol.SimpleMarkerSymbol.STYLE_CIRCLE, 
				size,
				new esri.symbol.SimpleLineSymbol(esri.symbol.SimpleLineSymbol.STYLE_SOLID, rgbOutline, 1),
				rgb
			);	
}

/*

sample layer event code.

function layerOV_onMouseOver(event) 
{
	if (_isMobile) return;
	var graphic = event.graphic;
	_map.setMapCursor("pointer");
	if ($.inArray(graphic, _selected) == -1) {
		graphic.setSymbol(resizeSymbol(graphic.symbol, _lutBallIconSpecs.medium));
	}
	if (!_isIE) moveGraphicToFront(graphic);	
	$("#hoverInfo").html("<b>"+graphic.attributes.getLanguage()+"</b>"+"<p>"+graphic.attributes.getRegion());
	var pt = _map.toScreen(graphic.geometry);
	hoverInfoPos(pt.x,pt.y);	
}


function layerOV_onMouseOut(event) 
{
	var graphic = event.graphic;
	_map.setMapCursor("default");
	$("#hoverInfo").hide();
	if ($.inArray(graphic, _selected) == -1) {
		graphic.setSymbol(resizeSymbol(graphic.symbol, _lutBallIconSpecs.tiny));
	}
}


function layerOV_onClick(event) 
{
	$("#hoverInfo").hide();
	var graphic = event.graphic;
	_languageID = graphic.attributes.getLanguageID();
	$("#selectLanguage").val(_languageID);
	changeState(STATE_SELECTION_OVERVIEW);
	scrollToPage($.inArray($.grep($("#listThumbs").children("li"),function(n,i){return n.value == _languageID})[0], $("#listThumbs").children("li")));	
}

function createIconMarker(iconPath, spec) 
{
	return new esri.symbol.PictureMarkerSymbol(iconPath, spec.getWidth(), spec.getHeight()); 
}

function resizeSymbol(symbol, spec)
{
	return symbol.setWidth(spec.getWidth()).setHeight(spec.getHeight())	
}

function moveGraphicToFront(graphic)
{
	var dojoShape = graphic.getDojoShape();
	if (dojoShape) dojoShape.moveToFront();
}

function hoverInfoPos(x,y){
	if (x <= ($("#map").width())-230){
		$("#hoverInfo").css("left",x+15);
	}
	else{
		$("#hoverInfo").css("left",x-25-($("#hoverInfo").width()));
	}
	if (y >= ($("#hoverInfo").height())+50){
		$("#hoverInfo").css("top",y-35-($("#hoverInfo").height()));
	}
	else{
		$("#hoverInfo").css("top",y-15+($("#hoverInfo").height()));
	}
	$("#hoverInfo").show();
}

*/


function handleWindowResize() {
	if ((($("body").height() <= 500) || ($("body").width() <= 800)) || _isEmbed) $("#header").height(0);
	else $("#header").height(115);
	
	$("#map").height($("body").height() - $("#header").height());
	$("#map").width($("body").width());
	_map.resize();
}
