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

Helper.isMobile = function() 
{
	var android = navigator.userAgent.match(/Android/i) ? true : false;
	var blackberry = navigator.userAgent.match(/BlackBerry/i) ? true : false;
	var ios = navigator.userAgent.match(/iPhone|iPad|iPod/i) ? true : false;
	var windows = navigator.userAgent.match(/IEMobile/i) ? true : false;
	return (android || blackberry || ios || windows);
}