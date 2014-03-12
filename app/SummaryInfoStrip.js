function SummaryInfoStrip(div)
{
	var _div = div;
	
	var _title = $("<div class='title'>Total Tornadoes</div>");
	var _total = $("<div class='superBigGreenText'></div>");
	var _captionYear = $("<div class='infoCaption'></div>");
	
	$(_div).append(_title);
	$(_div).append(_total);
	$(_div).append("<hr/>");
	$(_div).append(_captionYear);
	
	this.updateInfo = function(year, total)
	{
		$(_total).html(total);	
		$(_captionYear).html(year);	
	}
}