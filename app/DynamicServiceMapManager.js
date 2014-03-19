function DynamicServiceMapManager(map, url, initCallBack)
{
	var _map = map;
	var _firstMapReady = false;

	this.setYearFilter = function(year)
	{
		var layerDefinitions = [];
		for (var i = 0; i < 13; i++) {
			layerDefinitions[i] = "Year = "+year;
		}
		_layer.setLayerDefinitions(layerDefinitions);
	}
	
	this.isFirstMapReady = function()
	{
		return _firstMapReady;
	}

	var _layer = new esri.layers.ArcGISDynamicMapServiceLayer(url);
	var handle = dojo.connect(_layer, 'onUpdateEnd', function(event) {
		_firstMapReady = true;
		initCallBack();
		dojo.disconnect(handle);
	});
	_map.addLayer(_layer);

	this.setYearFilter("1980");	
		
}