function GraphicMapManager(map, onClickHandler) {
	
	var _map = map;
	
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
		dojo.connect(value, "onClick", layer_onClick);		
	});
	
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
	
	function layer_onClick(event) 
	{
		_map.infoWindow.hide();
		$("#hoverInfo").hide();
		var graphic = event.graphic;
		onClickHandler(graphic);		
	}
		
	this.populateGraphics = function(records) 
	{

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
		$.each(records, function(index, value){
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
	
	function createPictureMarkerSymbol(score)
	{
		var specs = {1:27, 2:27, 3:27,4:32,5:40}
		return new esri.symbol.PictureMarkerSymbol(
					"resources/images/marker-X.png".replace("X", score), 
					specs[score],
					specs[score]
				);	
	}
	
	function createSimpleMarkerSymbol(size, rgb, rgbOutline)
	{
		return new esri.symbol.SimpleMarkerSymbol(
					esri.symbol.SimpleMarkerSymbol.STYLE_CIRCLE, 
					size,
					new esri.symbol.SimpleLineSymbol(esri.symbol.SimpleLineSymbol.STYLE_SOLID, rgbOutline, 1),
					rgb
				);	
	}
	
	function moveGraphicToFront(graphic)
	{
		var dojoShape = graphic.getDojoShape();
		if (dojoShape) dojoShape.moveToFront();
	}
	
}