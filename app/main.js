dojo.require("esri.arcgis.utils");
dojo.require("esri.map");

/******************************************************
***************** begin config section ****************
*******************************************************/

var TITLE = "Tornadoes"
var BYLINE = "Curabitur tincidunt arcu sed nulla pretium vulputate. Quisque pretium feugiat scelerisque."
var FEATURE_SERVICE_URL = "http://services.arcgis.com/nzS0F0zdNLvs7nc8/ArcGIS/rest/services/Tornados_Points/FeatureServer/0";
var CSV_URL = "data/1950-2012_torn_scrubbed.csv";

var FIELDNAME_DATE = "Date";
var FIELDNAME_FUJITASCALE = "F_Scale";
var FIELDNAME_LENGTH = "Length_mi";
var FIELDNAME_INJURIES = "Injuries";
var FIELDNAME_FATALITIES = "Fatalities";
var FIELDNAME_PROPERTYLOSS = "Loss";

var CSV_FIELDNAME_INJURIES = "injuries";
var CSV_FIELDNAME_FATALITIES = "fatalities";

/******************************************************
***************** end config section ******************
*******************************************************/

var _map;
var _graphicMapManager;
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

	_spreadSheet = new Spreadsheet();
	_spreadSheet.doLoad(
		CSV_URL, 
		function(){$("#waitMsg").html("Unpacking...")}, 
		function(){	reportLoadTime();finishInit()}
		);
		
	_gisService = new GISService();

	_map = new esri.Map("map",
						{
							basemap:"gray",
							slider: false
						});
						
	_graphicMapManager = new GraphicMapManager(_map, onTornadoClick);
	
	dojo.connect(_map, 'onClick', function(event){
		if (!event.graphic) {
			_map.infoWindow.hide();			
			retract();
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
	if (!_spreadSheet.getRecords()) return;
	
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
	
	setTimeout(function(){_homeExtent = _map.extent}, 1000);
	
}

function onBarChartSelect()
{
	_map.infoWindow.hide();
	retract();
	doYear(_barChart.getActiveYear());
	$("#year").html(_barChart.getActiveYear());	
	reportYear();
}

function doYear(year)
{
	_subset = _spreadSheet.filterByYear(year);
	_graphicMapManager.populateGraphics(_subset);
}

function onTornadoClick(graphic)
{
	_map.infoWindow.setContent("selection");
	_map.infoWindow.show(graphic.geometry);
	
	var query = new esri.tasks.Query();
	query.where = "OBID = "+graphic.attributes.obid;
	query.returnGeometry = true;
	query.outFields = ["*"];

	var queryTask = new esri.tasks.QueryTask(FEATURE_SERVICE_URL);
	queryTask.execute(query, function(result){
		var atts = result.features[0].attributes;
		$("#tornadoDateValue").html(scrubDate(atts[FIELDNAME_DATE]));
		$("#fujitaScaleValue").html(atts[FIELDNAME_FUJITASCALE]);
		$("#lengthValue").html(atts[FIELDNAME_LENGTH]);
		$("#injuriesValue").html(atts[FIELDNAME_INJURIES]);
		$("#fatalitiesValue").html(atts[FIELDNAME_FATALITIES]);
		$("#propertyLossValue").html(atts[FIELDNAME_PROPERTYLOSS]);
		slideOut();
	});	
}

function scrubDate(val)
{
	val = new Date(val);
	val.setDate(val.getDate()+1)
	return val.toLocaleDateString();
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


function handleWindowResize() {
	
	if ((($("body").height() <= 500) || ($("body").width() <= 800)) || _isEmbed) $("#header").height(0);
	else $("#header").height(115);
	
	$("#content-container").height($("body").height() - $("#header").height());
	
	$("#map").css("left", $("#side-pane").outerWidth());
	$("#map").width($("body").width() - $("#side-pane").outerWidth());
	$("#map").height($("body").height() - $("#header").height());
	
	_barChart.resize();
	if (_map) _map.resize();
	
}

function summarizeByYear(callBack)
{
	/*
	Summary table should look like this:
	_summaryTable = [
		{year: 1980, total-count: 40, total-injuries: 3, total-fatalities: 0}
		{year: 1981, total-count: 31, total-injuries: 5, total-fatalities: 0}, 
	]
	*/
	
	if (!_isMobile) {
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
	var rec = $.grep(_summaryTable, function(n, i){return n.year == _barChart.getActiveYear()})[0];
	_summaryInfoStrip.updateInfo(rec.year, rec.totalCount, rec.totalInjuries, rec.totalFatalities)
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

