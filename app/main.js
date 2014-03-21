dojo.require("esri.arcgis.utils");
dojo.require("esri.map");
dojo.require("esri.dijit.Geocoder");

/******************************************************
***************** begin config section ****************
*******************************************************/

var TITLE = "Twister Dash: Exploring Three Decades of Violent Storms"
var BYLINE = "Although tornadoes can occur throughout the year, prime time for twisters in the U.S. is mid-March through June.  Numbers on the map represent the Fujita Scale, which measures the violence of twisters.  The highest, F5, represents 'incredible damage.'";
var FEATURE_SERVICE_URL = "http://services.arcgis.com/nzS0F0zdNLvs7nc8/ArcGIS/rest/services/Tornados_Points/FeatureServer/0";
var MAP_SERVICE_URL = "http://staging.storymaps.esri.com/arcgis/rest/services/Tornados/Tornados_fwm/MapServer";
var CSV_URL = "data/1950-2012_torn_scrubbed.csv";

var CSV_FIELDNAME_DATE = "date";
var CSV_FIELDNAME_FUJITASCALE = "f_scale";
var CSV_FIELDNAME_LENGTH = "length_mi";
var CSV_FIELDNAME_INJURIES = "injuries";
var CSV_FIELDNAME_FATALITIES = "fatalities";
var CSV_FIELDNAME_PROPERTYLOSS = "loss";

var FORCE_SERVER = false;

/******************************************************
***************** end config section ******************
*******************************************************/

var _map;
var _mapManager;
var _barChart;
var _summaryTable;
var _summaryInfoStrip;

var _spreadSheet;
var _gisService;

var _dojoReady = false;
var _jqueryReady = false;

var _isIE = (navigator.appVersion.indexOf("MSIE") > -1);

var _homeExtent; // set this in init() if desired; otherwise, it will 
				 // be the default extent of the web map;

var _isMobile = isMobile();

var _isEmbed = false;
var _subset;

var _count = 0;

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

	var arrYears = [];
	for (var year = 1980; year <= 2012; year++)
	{
		arrYears.push(year);
	}	
	_barChart = new BarChart($(".barChart").eq(0), arrYears, onBarChartSelect);

	_summaryInfoStrip = new SummaryInfoStrip($("#summary-info-strip").eq(0));
	
	// jQuery event assignment
	
	$(this).resize(handleWindowResize);
	handleWindowResize();
		
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

	_map = new esri.Map("map",
						{
							basemap:"gray",
							slider: false
						});
	_gisService = new GISService();

	if (_isMobile || FORCE_SERVER) {
		_mapManager = new DynamicServiceMapManager(
			_map, 
			MAP_SERVICE_URL, 
			function(){finishInit()}
		);
	} else {
		_spreadSheet = new Spreadsheet();
		_spreadSheet.doLoad(
			CSV_URL, 
			function(){$("#waitMsg").html("Unpacking...")}, 
			function(){	reportLoadTime();finishInit()}
			);
		_mapManager = new GraphicMapManager(_map, onTornadoClick);
	}

	dojo.connect(_map, 'onClick', function(event){
		if (_spreadSheet) {
			if (!event.graphic) {
				_map.graphics.clear();			
				retract();
			}
		} else {
			// server side identify
			_gisService.identify(event.mapPoint, _map.extent.getWidth() / 50, _barChart.getActiveYear(), function(atts){
				if (atts) {
					_map.graphics.clear();
					_map.graphics.add(new esri.Graphic(
						esri.geometry.geographicToWebMercator(new esri.geometry.Point(atts.x, atts.y)), 
						Helper.createPictureMarkerSymbol(atts.fujitaScale, "resources/images/Tornado_Xa-select.png")
					));
					presentAtts(atts);
					slideOut();			
				} else {
					_map.graphics.clear();			
					retract();
				}
			});
		}
	});
		
	if(_map.loaded){
		finishInit();
	} else {
		dojo.connect(_map,"onLoad",function(){
			finishInit();
		});
	}

}

function finishInit() {

	if (!_map) return;
	if (!_map.loaded) return;
	if (_spreadSheet) {
		if (!_spreadSheet.getRecords()) return;
	} else {
		if (!_mapManager.isFirstMapReady()) return;
	}
	
	doYear(_barChart.getActiveYear());	
	$("#year").html(_barChart.getActiveYear());

	dojo.connect(_map, "onExtentChange", function(event) {
		if (_count == 0) {
			summarizeByYear(function(){$("#whiteOut").fadeOut()});
		} else {
			summarizeByYear();
		}
		_count++;
	})
			
	_map.centerAndZoom([-98.27, 38.73], 4);
	
	setTimeout(function(){handleWindowResize()});
	setTimeout(function(){_homeExtent = _map.extent}, 1000);
	
	$(document).keydown(onKeyDown);
	

    var geocoder = new esri.dijit.Geocoder({map: _map}, "search");
    geocoder.startup();

	
}

function onKeyDown(e)
{
	if ((e.keyCode != 38) && (e.keyCode != 40)) {
		return;
	}			
	if (e.keyCode == 40) 
		_barChart.stepDown() 
	else 
		_barChart.stepUp();	
}

function onBarChartSelect()
{
	_map.graphics.clear();
	retract();
	doYear(_barChart.getActiveYear());
	$("#year").html(_barChart.getActiveYear());	
	reportYear();
}

function doYear(year)
{
	if (_spreadSheet) {
		_subset = _spreadSheet.filterByYear(year);
		_mapManager.populateGraphics(_subset);
	} else {
		_mapManager.setYearFilter(year)
	}
}

function onTornadoClick(graphic)
{
	_map.graphics.clear();
	_map.graphics.add(
		new esri.Graphic(
			graphic.geometry, 
			Helper.createPictureMarkerSymbol(
				graphic.attributes[CSV_FIELDNAME_FUJITASCALE], 
				"resources/images/Tornado_Xa-select.png"
			)
		)
	);
	
	/*
	Tornado atts should look like this:
	tornadoAtts = {date: value, fujitaScale: value, length: value, injuries: value, fatalities: value, propertyLoss: value};
	*/
	
	presentAtts({
		date: graphic.attributes[CSV_FIELDNAME_DATE], 
		fujitaScale: graphic.attributes[CSV_FIELDNAME_FUJITASCALE], 
		length: graphic.attributes[CSV_FIELDNAME_LENGTH], 
		injuries: graphic.attributes[CSV_FIELDNAME_INJURIES], 
		fatalities: graphic.attributes[CSV_FIELDNAME_FATALITIES], 
		propertyLoss: graphic.attributes[CSV_FIELDNAME_PROPERTYLOSS]
	});
	slideOut();
}

function presentAtts(atts)
{
	$("#tornadoDateValue").html(atts.date);
	$("#fujitaScaleValue").html(atts.fujitaScale);
	$("#lengthValue").html(atts.length);
	$("#injuriesValue").html(atts.injuries);
	$("#fatalitiesValue").html(atts.fatalities);
	$("#propertyLossValue").html(atts.propertyLoss);
}

function slideOut()
{
	$("#tornado-info-strip").animate({left: 20});
}

function retract()
{
	$("#tornado-info-strip").animate({left: -230});
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


function handleWindowResize() 
{

	if (($("body").height() <= 600) || _isEmbed) $("#header").css("display", "none");
	else $("#header").css("display", "block");

	$("#map").css("left", $("#side-pane").outerWidth());
	$("#map").width($("body").width() - $("#side-pane").outerWidth());
	$("#map").height($("body").height());

	if ($("#header").css("display") == "none") $("#bar-strip").height($("body").height() - 20);
	else $("#bar-strip").height($("body").height() - ($("#header").outerHeight() + 20));

	$(".barChart").height($("#bar-strip").innerHeight() - 20);	
	if (_barChart) _barChart.resize();
	if (_map) _map.resize();
	
}

function summarizeByYear(callBack)
{
	/*
	Summary table should look like this:
	_summaryTable = [
		{year: value, totalCount: value, totalInjuries: value, totalFatalities: value, totalPropertyLoss: value},
		{year: value, totalCount: value, totalInjuries: value, totalFatalities: value, totalPropertyLoss: value}
	]
	*/
	
	if (_spreadSheet) {
		_summaryTable = _spreadSheet.summarizeForExtent(_map.extent);
		_barChart.setValues(_summaryTable);
		reportYear();
		if (callBack) callBack();	
	} else {
		_gisService.summarizeForExtent(_map.extent, function(result) {
			var arr = [];
			$.each(result.features, function(index, value) {
				value.attributes.year = value.attributes.Year;
				arr.push(value.attributes);
			});
			_summaryTable = arr;				
			_barChart.setValues(_summaryTable);
			reportYear();	
			if (callBack) callBack();			
		});		
	}	
}

function reportYear()
{
	var rec = $.grep(_summaryTable, function(n, i){return n.year == _barChart.getActiveYear()});
	if (rec.length > 0) {
		rec = rec[0];
	} else {
		rec = {year: _barChart.getActiveYear(), totalCount: 0, totalInjuries: 0, totalFatalities: 0, totalPropertyLoss: 0}
	}
	_summaryInfoStrip.updateInfo(rec.year, rec.totalCount, rec.totalInjuries, rec.totalFatalities, rec.totalPropertyLoss)
}

function reportLoadTime()
{
	$("#loadTime").html("Load time: <b>"+_spreadSheet.getLoadTime()+"</b> seconds"+
	" <br/ >"+
	"- Fetch time: <b>"+_spreadSheet.getFetchTime()+"</b>"+
	" <br/ >"+
	"- Parse time: <b>"+_spreadSheet.getParseTime()+"</b>"									
	);	
}

