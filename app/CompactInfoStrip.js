function CompactInfoStrip(div)
{
	
	var _div = div;
	var _scroll;
	
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
	_scroll = new IScroll(_div[0] ,{ scrollX: true, scrollY: false, mouseWheel: true , snap:'li', momentum:true});
		
	this.updateInfo = function(atts)
	{
		$(_date).html(atts.date);
		$(_scale).html(atts.fujitaScale);
		_scroll.scrollTo(0,0,1000, IScroll.utils.ease.quadratic);
		/*
		$("#tornadoDateValue").html(atts.date);
		$("#fujitaScaleValue").html(atts.fujitaScale);
		$("#lengthValue").html(atts.length);
		$("#injuriesValue").html(atts.injuries);
		$("#fatalitiesValue").html(atts.fatalities);
		$("#propertyLossValue").html(Math.round( atts.propertyLoss * 10 ) / 10);
		*/
	}
}