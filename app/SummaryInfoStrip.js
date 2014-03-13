function SummaryInfoStrip(div)
{
	var _div = div;
	
	var _year = $("<div class='infoValue'></div>");
	var _total = $("<div class='superBigGreenText'></div>");
	var _injuries = $("<div class='infoValue'></div>");
	var _fatalities = $("<div class='infoValue'></div>");
	
	$(_div).append(_year);
	$(_div).append("<div class='dateCaption'>Year</div>");
	
	$(_div).append(_total);
	$(_div).append("<hr/>");
	$(_div).append("<div class='infoCaption'>Total tornadoes</div>");
	
	$(_div).append(_injuries);
	$(_div).append("<hr/>");
	$(_div).append("<div class='infoCaption'>Injuries</div>");
	
	$(_div).append(_fatalities);
	$(_div).append("<hr/>");
	$(_div).append("<div class='infoCaption'>Fatalities</div>");
		
	this.updateInfo = function(year, total, injuries, fatalities)
	{
		$(_year).html(year);	
		$(_total).html(total);	
		$(_injuries).html(injuries);
		$(_fatalities).html(fatalities);
	}
}