function Spreadsheet() {
	
	var _recs;

	var _fetchTime;
	var _parseTime;
	var _loadTime;
	
	this.doLoad= function(url, onFetch, onParse) 
	{
		var time1 = new Date();
			
		$.ajax({
		  type: 'GET',
		  url: url,
		  cache: false,
		  success: function(text) {	
			  onFetch();
			  setTimeout(function(){
				_fetchTime = (new Date() - time1) / 1000;
				var before = new Date();
				var serviceTornadoes = new CSVService();
				serviceTornadoes.process(text);
				_recs = new RecordParser().getRecs(serviceTornadoes.getLines());
				_parseTime = (new Date() - before) / 1000;
				_loadTime = (new Date() - time1) / 1000;
				onParse();
			  }, 100);
		  }
		});	
	}	

	this.getFetchTime = function()
	{
		return _fetchTime;
	}
	
	this.getParseTime = function()
	{
		return _parseTime;
	}
	
	this.getLoadTime = function()
	{
		return _loadTime;
	}
	
	this.getRecords = function()
	{
		return _recs;
	}
	
	this.filterByYear = function(year)
	{
		year = year.toString().slice(2);	
		return $.grep(_spreadSheet.getRecords(), function(n, i){return n.date.split("/")[2] == year})		
	}
	
	this.summarizeForExtent = function(extent)
	{
		var result = [];
		var year;
		var recs;
		$.each(_recs, function(index, value){
			if (extent.contains(new esri.geometry.Point(value.starting_long, value.starting_lat))) {
				year = value.date.split("/")[2];
				year = (year >= 50 ? "19" : "20") + year;
				recs = $.grep(result, function(n, i){return n.year == year});
				if (recs.length == 0) {
					// must create entry
					result.push({
						year:year, 
						totalCount:1, 
						totalInjuries:parseInt(value[CSV_FIELDNAME_INJURIES]), 
						totalFatalities:parseInt(value[CSV_FIELDNAME_FATALITIES]),
						totalPropertyLoss:parseInt(value[CSV_FIELDNAME_PROPERTYLOSS])
						});
				} else {
					// entry already exists; just add in values
					var rec = recs[0];
					rec.totalCount = rec.totalCount + 1;
					rec.totalInjuries = parseInt(rec.totalInjuries) + parseInt(value[CSV_FIELDNAME_INJURIES]);
					rec.totalFatalities = parseInt(rec.totalFatalities) + parseInt(value[CSV_FIELDNAME_FATALITIES]);
					rec.totalPropertyLoss = parseInt(rec.totalPropertyLoss) + parseInt(value[CSV_FIELDNAME_PROPERTYLOSS]);
				}
			}
		});
		return result;
	}
	
	
}