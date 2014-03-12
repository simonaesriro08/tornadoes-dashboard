function SummaryInfoStrip(div)
{
	var _div = div;
	
	var _title = $("<div class='title'>Total Tornadoes</div>");
	var _total = $("<div class='superBigGreenText'></div>");
	var _captionYear = $("<div class='infoCaption'></div>");
	
	var _injuries = $("<div class='infoValue'></div>");
	
	$(_div).append(_title);
	$(_div).append(_total);
	$(_div).append("<hr/>");
	$(_div).append(_captionYear);
	
	$(_div).append(_injuries);
	$(_div).append("<hr/>");
	$(_div).append("Injuries");
	
	this.updateInfo = function(year, total, injuries)
	{
		$(_total).html(total);	
		$(_captionYear).html(year);	
		$(_injuries).html(injuries);
	}
}