function CompactSummaryInfoStrip(div)
{
	var _div = div;
	
	var _total = $("<div class='superBigGreenText'></div>");
	
	$(_div).append(_total);
	$(_div).append("<hr/>");
	$(_div).append("<div class='infoCaption'>Total tornadoes</div>");
	
	$(_div).find(".superBigGreenText").css("font-size", 60);
		
	this.updateInfo = function(total)
	{
		$(_total).html(total);	
	}
}