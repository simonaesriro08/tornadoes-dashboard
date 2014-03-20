function Helper()
{
}

Helper.createPictureMarkerSymbol = function(score, root)
{
	var specs = {0:20, 1:27, 2:30, 3:36,4:42,5:48}
	return new esri.symbol.PictureMarkerSymbol(
				root.replace("X", score), 
				parseInt(specs[score] * 0.75),
				parseInt(specs[score] * 0.75)
			);	
}