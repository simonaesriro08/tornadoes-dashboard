function CompactInfoStrip(div)
{
	var _div = div;

	var _date = $("<div class='infoValue'></div>");

	$(_div).append(_date);
	$(_div).append("<div class='dateCaption'>Tornado Date</div>");

	/*
		
	var _year = $("<div class='infoValue'></div>");
	var _total = $("<div class='superBigGreenText'></div>");
	var _injuries = $("<div class='infoValue'></div>");
	var _fatalities = $("<div class='infoValue'></div>");
	var _propertyLoss = $("<div class='infoValue'></div>");
		
	$(_div).append(_total);
	$(_div).append("<hr/>");
	$(_div).append("<div class='infoCaption'>Total tornadoes</div>");
	
	$(_div).append(_injuries);
	$(_div).append("<hr/>");
	$(_div).append("<div class='infoCaption'>Injuries</div>");
	
	$(_div).append(_fatalities);
	$(_div).append("<hr/>");
	$(_div).append("<div class='infoCaption'>Fatalities</div>");
	
	$(_div).append(_propertyLoss);
	$(_div).append("<hr/>");
	$(_div).append("<div class='infoCaption'>Property Loss ($millions)</div>");
	
	*/
		
	this.updateInfo = function(atts)
	{
		$(_date).html(atts.date);
		/*
		$("#tornadoDateValue").html(atts.date);
		$("#fujitaScaleValue").html(atts.fujitaScale);
		$("#lengthValue").html(atts.length);
		$("#injuriesValue").html(atts.injuries);
		$("#fatalitiesValue").html(atts.fatalities);
		$("#propertyLossValue").html(Math.round( atts.propertyLoss * 10 ) / 10);
		$("#tornado-info-strip").animate({scrollTop: 0}, "slow");
		*/
	}
}