dojo.require("esri.arcgis.utils");
dojo.require("esri.map");

/******************************************************
***************** begin config section ****************
*******************************************************/

var TITLE = "Tornadoes"
var BYLINE = "Curabitur tincidunt arcu sed nulla pretium vulputate. Quisque pretium feugiat scelerisque."
var FEATURE_SERVICE_URL = "http://services.arcgis.com/nzS0F0zdNLvs7nc8/ArcGIS/rest/services/Tornados_Points/FeatureServer/0";

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
var _hash;
var _summaryInfoStrip;

var _dojoReady = false;
var _jqueryReady = false;

var _isIE = (navigator.appVersion.indexOf("MSIE") > -1);

var _homeExtent; // set this in init() if desired; otherwise, it will 
				 // be the default extent of the web map;

var _isMobile = isMobile();

var _isEmbed = false;
var _tornadoes;
var _subset;

var _loadTime;

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
	
	var time1 = new Date();
	
	$.ajax({
	  type: 'GET',
	  url: "data/1950-2012_torn_scrubbed.csv",
	  cache: false,
	  success: function(text) {	
	  	  $("#loader").slideUp(function(){
			  $("#waitMsg").html("Unpacking...");
			  setTimeout(function(){
				var fetchTime = (new Date() - time1) / 1000;
				var before = new Date();
				var serviceTornadoes = new CSVService();
				serviceTornadoes.process(text);
				_tornadoes = new RecordParser().getRecs(serviceTornadoes.getLines());
				var loopTime = (new Date() - before) / 1000;
				_loadTime = (new Date() - time1) / 1000;
				$("#loadTime").html("Load time: <b>"+_loadTime+"</b> seconds"+
									" <br/ >"+
									"- Fetch time: <b>"+fetchTime+"</b>"+
									" <br/ >"+
									"- Loop time: <b>"+loopTime+"</b>"									
									);
				$("#whiteOut").fadeOut();
				finishInit();
			  }, 100);
		  });
	  }
	});	

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
	
	dojo.connect(_map, "onExtentChange", function(event) {
		updateCountByYear();
	})

		
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
	if (!_tornadoes) return;
	
	doYear(_barChart.getActiveYear());	
	$("#year").html(_barChart.getActiveYear());
	
	_map.centerAndZoom([-98.27, 38.73], 4);
	
	setTimeout(function(){_homeExtent = _map.extent}, 1000);
	
}

function onBarChartSelect()
{
	_map.infoWindow.hide();
	retract();
	doYear(_barChart.getActiveYear());
	$("#year").html(_barChart.getActiveYear());	
	summarizeYear();
}

function doYear(year)
{
	year = year.toString().slice(2);
	_subset = $.grep(_tornadoes, function(n, i){return n.date.split("/")[2] == year});
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

function updateCountByYear()
{
	var time1 = new Date();
	var extent = _map.extent;
	/*
	_hash = [
		{year: 1980, total-count: 40, total-injuries: 3}
		{year: 1981, total-count: 31, total-injuries: 5}, 
	]
	*/
	_hash = [];
	var year;
	var recs;
	$.each(_tornadoes, function(index, value){
		if (extent.contains(new esri.geometry.Point(value.starting_long, value.starting_lat))) {
			year = value.date.split("/")[2];
			year = (year >= 50 ? "19" : "20") + year;
			recs = $.grep(_hash, function(n, i){return n.year == year});
			if (recs.length == 0) {
				// must create entry
				_hash.push({year:year, totalCount:1, totalInjuries:parseInt(value[CSV_FIELDNAME_INJURIES]), totalFatalities:parseInt(value[CSV_FIELDNAME_FATALITIES])});
			} else {
				// entry already exists; just add in values
				var rec = recs[0];
				rec.totalCount = rec.totalCount + 1;
				rec.totalInjuries = parseInt(rec.totalInjuries) + parseInt(value[CSV_FIELDNAME_INJURIES]);
				rec.totalFatalities = parseInt(rec.totalFatalities) + parseInt(value[CSV_FIELDNAME_FATALITIES]);
			}
		}
	});
	_barChart.setValues(_hash);
	summarizeYear();	
}

function summarizeYear()
{
	var rec = $.grep(_hash, function(n, i){return n.year == _barChart.getActiveYear()})[0];
	_summaryInfoStrip.updateInfo(rec.year, rec.totalCount, rec.totalInjuries, rec.totalFatalities)
}

