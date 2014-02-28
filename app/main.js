dojo.require("esri.arcgis.utils");
dojo.require("esri.map");

/******************************************************
***************** begin config section ****************
*******************************************************/

var TITLE = "Tornadoes"
var BYLINE = "Let's twist again, like we did last summer."

/******************************************************
***************** end config section ******************
*******************************************************/

var _map;

var _dojoReady = false;
var _jqueryReady = false;

var _isIE = (navigator.appVersion.indexOf("MSIE") > -1);

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

var _layerPath5;
var _layerPath4;
var _layerPath3;
var _layerPath2;
var _layerPath1;
var _layerPath0;

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

	var time1 = new Date();
	
	$.ajax({
	  type: 'GET',
	  url: "data/1950-2012_torn_scrubbed.csv",
	  cache: false,
	  success: function(text) {	
	  	  $("#loader").slideUp(function(){
			  $("#waitMsg").html("Unpacking (like, 3 seconds, tops)...");
			  setTimeout(function(){
				var serviceTornadoes = new CSVService();
				serviceTornadoes.process(text);
				_tornadoes = new RecordParser().getRecs(serviceTornadoes.getLines());
				var diff = (new Date() - time1) / 1000;
				$("#loadTime").html("Load time: <b>"+diff+"</b> seconds");
				$("#whiteOut").fadeOut();
				doYear($("select option:selected").eq(0).html().slice(2));
			  }, 100);
		  });
	  }
	});	

	_map = new esri.Map("map",
						{
							basemap:"gray",
							center: [-96.19, 34.5],
  							zoom: 4,
							slider: false
						});
						
	_layer4 = new esri.layers.GraphicsLayer();
	_layer5 = new esri.layers.GraphicsLayer();
	_layer3 = new esri.layers.GraphicsLayer();
	_layer2 = new esri.layers.GraphicsLayer();
	_layer1 = new esri.layers.GraphicsLayer();
	_layer0 = new esri.layers.GraphicsLayer();
	
	_layerPath5 = new esri.layers.GraphicsLayer();
	_layerPath4 = new esri.layers.GraphicsLayer();
	_layerPath3 = new esri.layers.GraphicsLayer();
	_layerPath2 = new esri.layers.GraphicsLayer();
	_layerPath1 = new esri.layers.GraphicsLayer();
	_layerPath0 = new esri.layers.GraphicsLayer();
	
	_layerPath5.setMinScale(5000000);
	_layerPath4.setMinScale(5000000);
	_layerPath3.setMinScale(5000000);
	_layerPath2.setMinScale(5000000);
	_layerPath1.setMinScale(5000000);
	_layerPath0.setMinScale(5000000);

	_map.addLayer(_layerPath0);	
	_map.addLayer(_layer0);
	_map.addLayer(_layerPath1);
	_map.addLayer(_layer1);
	_map.addLayer(_layerPath2);
	_map.addLayer(_layer2);
	_map.addLayer(_layerPath3);
	_map.addLayer(_layer3);
	_map.addLayer(_layerPath4);
	_map.addLayer(_layer4);
	_map.addLayer(_layerPath5);
	_map.addLayer(_layer5);


	$.each([_layer0, _layer1, _layer2, _layer3, _layer4, _layer5], function(index, value){
		dojo.connect(value, "onMouseOver", layer_onMouseOver);
		dojo.connect(value, "onMouseOut", layer_onMouseOut);
		//dojo.connect(value, "onClick", layer_onClick);		
	});
	

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
	
	_layerPath5.clear();
	_layerPath4.clear();
	_layerPath3.clear();
	_layerPath2.clear();
	_layerPath1.clear();
	_layerPath0.clear();
			
	var sr = new esri.SpatialReference(4326);
	$.each(_subset, function(index, value){
		  var pt = new esri.geometry.Point(value.starting_long, value.starting_lat, sr);
		  var sym;
		  if (value.f_scale > 0)
		  	sym = createPictureMarkerSymbol(value.f_scale);
		  else
		  	sym = createSimpleMarkerSymbol(8, new dojo.Color([153,153,92,1]), new dojo.Color([255,255,255,1]));
		  var graphic = new esri.Graphic(pt, sym, value);
		  if (value.f_scale == 5) {
			  _layer5.add(graphic);		
			  _layerPath5.add(createPath(value));
		  }
		  else if (value.f_scale == 4) {
			  _layer4.add(graphic);		
			  _layerPath4.add(createPath(value));
		  }
		  else if (value.f_scale == 3) {
			  _layer3.add(graphic);
			  _layerPath3.add(createPath(value));
		  }
		  else if (value.f_scale == 2) {
			  _layer2.add(graphic);
			  _layerPath2.add(createPath(value));
		  }
		  else if (value.f_scale == 1) {
			  _layer1.add(graphic);		
			  _layerPath1.add(createPath(value));
		  }
		  else {
			  _layer0.add(graphic);
			  _layerPath0.add(createPath(value));
		  }
	});
}

function createPath(value)
{
	var pLine = new esri.geometry.Polyline([[value.starting_long, value.starting_lat], [value.end_long, value.end_lat]]);
	var sym = new esri.symbol.SimpleLineSymbol(esri.symbol.SimpleLineSymbol.STYLE_SOLID, new dojo.Color([0,0,0,1]), 1);
	var graphic = new esri.Graphic(pLine, sym)
	return graphic;
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

function layer_onMouseOver(event) 
{
	if (_isMobile) return;
	var graphic = event.graphic;
	_map.setMapCursor("pointer");
	if (graphic.symbol.url)
		graphic.setSymbol(graphic.symbol.setWidth(graphic.symbol.width+4).setHeight(graphic.symbol.height+4));
	else 
		graphic.setSymbol(graphic.symbol.setSize(graphic.symbol.size+4));
	if (!_isIE) moveGraphicToFront(graphic);	
	$("#hoverInfo").html(graphic.attributes.date);
	var pt = _map.toScreen(graphic.geometry);
	hoverInfoPos(pt.x,pt.y);	
}


function layer_onMouseOut(event) 
{
	var graphic = event.graphic;
	_map.setMapCursor("default");
	$("#hoverInfo").hide();
	if (graphic.symbol.url)
		graphic.setSymbol(graphic.symbol.setWidth(graphic.symbol.width-4).setHeight(graphic.symbol.height-4));
	else 
		graphic.setSymbol(graphic.symbol.setSize(graphic.symbol.size-4));
}

/*


function layerOV_onClick(event) 
{
	$("#hoverInfo").hide();
	var graphic = event.graphic;
	_languageID = graphic.attributes.getLanguageID();
	$("#selectLanguage").val(_languageID);
	changeState(STATE_SELECTION_OVERVIEW);
	scrollToPage($.inArray($.grep($("#listThumbs").children("li"),function(n,i){return n.value == _languageID})[0], $("#listThumbs").children("li")));	
}

*/


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
		$("#hoverInfo").css("top",y-20-($("#hoverInfo").height()));
	}
	else{
		$("#hoverInfo").css("top",y-15+($("#hoverInfo").height()));
	}
	$("#hoverInfo").show();
}


function handleWindowResize() {
	if ((($("body").height() <= 500) || ($("body").width() <= 800)) || _isEmbed) $("#header").height(0);
	else $("#header").height(115);
	
	$("#map").height($("body").height() - $("#header").height());
	$("#map").width($("body").width());
	_map.resize();
}
