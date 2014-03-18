function DynamicServiceMapManager(map, url)
{

	this.setYearFilter = function(year)
	{
		var layerDefinitions = [];
		for (var i = 0; i < 6; i++) {
			layerDefinitions[i] = "Year = "+year+" AND F_Scale = "+(5 - i).toString();
		}
		_layer.setLayerDefinitions(layerDefinitions);
	}

	var _map = map;
	var _layer = new esri.layers.ArcGISDynamicMapServiceLayer(url);
	this.setYearFilter("1980");	
	_map.addLayer(_layer);
	
	
}