function GISService()
{
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
	
		var extent = esri.geometry.webMercatorToGeographic(_map.extent)
		
		var query = new esri.tasks.Query();
		query.where = "Starting_Lat >= "+extent.ymin+
					" AND Starting_Long >= "+extent.xmin+
					" AND Starting_Lat <= "+extent.ymax+
					" AND Starting_Long <= "+extent.xmax+
					" AND Year in ('1980','1981','1982','1983','1984','1985','1986','1987','1988','1989','1990','1991','1992','1993','1994','1995','1996','1997','1998','1999','2000','2001','2002','2003','2004','2005','2006','2007','2008','2009','2010','2011','2012')";
		query.outStatistics = [statDefCount, statDefInjuries, statDefFatalities];
		query.groupByFieldsForStatistics = ["Year"];
						
		var queryTask = new esri.tasks.QueryTask(FEATURE_SERVICE_URL);
		queryTask.execute(query, onComplete);		
	}
}