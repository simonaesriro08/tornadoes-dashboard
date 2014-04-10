function CompactInfoStrip(div)
{
	var _div = div;
	
	var ul = $("<ul></ul>");

	var _date = $("<div class='infoValue'></div>");
	var _scale = $("<div class='superBigGreenText'></div>");

	var li = $("<li></li>");
	$(li).append(_date)
	$(li).append("<div class='dateCaption'>Tornado Date</div>");
	$(ul).append(li);
	
	var li = $("<li></li>");
	$(li).append(_scale);
	$(li).append("<div class='infoCaption'>Enhanced Fujita Scale</div>");
	$(ul).append(li);
	
	$(ul).find(".infoValue").css("font-size", 40);
	$(ul).find(".superBigGreenText").css("font-size", 60);
	$(ul).children("li").css("float", "left");
	$(ul).children("li").css("padding-left", 20);
	$(ul).children("li").height(90);
	$(ul).children("li").width(150);
	$(ul).children("li").css("position", "relative");

	$(ul).find(".dateCaption").css("position", "absolute");
	$(ul).find(".dateCaption").css("bottom", 0);

	$(ul).find(".infoCaption").css("position", "absolute");
	$(ul).find(".infoCaption").css("bottom", 0);
	
	var scroller = $("<div></div>");
	$(scroller).append(ul);
	$(scroller).width(1000);
	$(scroller).height(100);
	$(scroller).css("position", "absolute");
	
	$(_div).append(scroller);

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
		$(_scale).html(atts.fujitaScale);
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