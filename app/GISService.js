function GISService()
{
	
	var FEATURESERVICE_FIELDNAME_DATE= "Date";
	var FEATURESERVICE_FIELDNAME_FUJITASCALE = "F_Scale";
	var FEATURESERVICE_FIELDNAME_LENGTH = "Length_mi";
	var FEATURESERVICE_FIELDNAME_INJURIES = "Injuries";
	var FEATURESERVICE_FIELDNAME_FATALITIES = "Fatalities";
	var FEATURESERVICE_FIELDNAME_PROPERTYLOSS = "Loss";
	var FEATURESERVICE_FIELDNAME_YEAR = "Year";
	var FEATURESERVICE_FIELDNAME_X = "Starting_Long";
	var FEATURESERVICE_FIELDNAME_Y = "Starting_Lat";
	
	this.summarizeForExtent = function(extent, onComplete)
	{
		var statDefCount = new esri.tasks.StatisticDefinition();
		statDefCount.statisticType = "count";
		statDefCount.onStatisticField = "Year";
		statDefCount.outStatisticFieldName = "totalCount";
		
		var statDefInjuries = new esri.tasks.StatisticDefinition();
		statDefInjuries.statisticType = "sum";
		statDefInjuries.onStatisticField = "Injuries";
		statDefInjuries.outStatisticFieldName = "totalInjuries";
	
		var statDefFatalities = new esri.tasks.StatisticDefinition();
		statDefFatalities.statisticType = "sum";
		statDefFatalities.onStatisticField = "Fatalities";
		statDefFatalities.outStatisticFieldName = "totalFatalities";
		
		var statDefLoss = new esri.tasks.StatisticDefinition();
		statDefLoss.statisticType = "sum";
		statDefLoss.onStatisticField = "Loss";
		statDefLoss.outStatisticFieldName = "totalPropertyLoss";
	
		var extent = esri.geometry.webMercatorToGeographic(extent)
		
		var query = new esri.tasks.Query();
		query.where = "Starting_Lat >= "+extent.ymin+
					" AND Starting_Long >= "+extent.xmin+
					" AND Starting_Lat <= "+extent.ymax+
					" AND Starting_Long <= "+extent.xmax+
					" AND F_Scale > -9"+
					" AND Year in ('1980','1981','1982','1983','1984','1985','1986','1987','1988','1989','1990','1991','1992','1993','1994','1995','1996','1997','1998','1999','2000','2001','2002','2003','2004','2005','2006','2007','2008','2009','2010','2011','2012')";
		query.outStatistics = [statDefCount, statDefInjuries, statDefFatalities, statDefLoss];
		query.groupByFieldsForStatistics = ["Year"];
						
		var queryTask = new esri.tasks.QueryTask(FEATURE_SERVICE_URL);
		queryTask.execute(query, onComplete);		
	}
	
	this.identify = function(pt, tolerance, year, onComplete)
	{
		
		var searchBox = new esri.geometry.Extent(pt.x - tolerance, pt.y - tolerance, pt.x + tolerance, pt.y + tolerance, pt.spatialReference);
		searchBox = esri.geometry.webMercatorToGeographic(searchBox);
		
		var query = new esri.tasks.Query();
		query.where = "Starting_Lat >= "+searchBox.ymin+
					" AND Starting_Long >= "+searchBox.xmin+
					" AND Starting_Lat <= "+searchBox.ymax+
					" AND Starting_Long <= "+searchBox.xmax+
					" AND "+FEATURESERVICE_FIELDNAME_YEAR+" = "+year;
		query.returnGeometry = false;
		query.outFields = ["*"];
	
		var queryTask = new esri.tasks.QueryTask(FEATURE_SERVICE_URL);
		queryTask.execute(query, function(result){
			var features = result.features;
			features.sort(sortByFujita);
			var returnVal = null;
			if (features.length > 0) {
				var atts = features[0].attributes;
				returnVal = {
					date: scrubDate(atts[FEATURESERVICE_FIELDNAME_DATE]), 
					fujitaScale: atts[FEATURESERVICE_FIELDNAME_FUJITASCALE], 
					length: atts[FEATURESERVICE_FIELDNAME_LENGTH], 
					injuries: atts[FEATURESERVICE_FIELDNAME_INJURIES], 
					fatalities: atts[FEATURESERVICE_FIELDNAME_FATALITIES], 
					propertyLoss: atts[FEATURESERVICE_FIELDNAME_PROPERTYLOSS],
					x: atts[FEATURESERVICE_FIELDNAME_X],
					y: atts[FEATURESERVICE_FIELDNAME_Y]
				}				
			} 
			onComplete(returnVal);
		});			
	}
	
	function sortByFujita(a, b)
	{
		var aNumber = a.attributes[FEATURESERVICE_FIELDNAME_FUJITASCALE];
		var bNumber = b.attributes[FEATURESERVICE_FIELDNAME_FUJITASCALE]; 
		return ((aNumber > bNumber) ? -1 : ((aNumber < bNumber) ? 1 : 0));
	}
	
	function scrubDate(val)
	{
		val = new Date(val);
		val.setDate(val.getDate()+1)
		return val.toLocaleDateString();
	}
	
}