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
		query.where = "Starting_Lat >= "+extent.ymin+" AND Starting_Long >= "+extent.xmin+" AND Starting_Lat <= "+extent.ymax+" AND Starting_Long <= "+extent.xmax;
		query.outStatistics = [statDefCount, statDefInjuries, statDefFatalities];
		query.groupByFieldsForStatistics = ["Year"];
						
		var queryTask = new esri.tasks.QueryTask(FEATURE_SERVICE_URL);
		queryTask.execute(query, onComplete);		
	}
}