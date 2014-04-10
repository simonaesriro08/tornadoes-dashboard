function CompactSummaryInfoStrip(div)
{
	var _div = div;
	var _mid;
	var _self = this;
	
	var _total = $("<div class='superBigGreenText'></div>");
	var _injuries = $("<div class='infoValue'></div>");
	var _fatalities = $("<div class='infoValue'></div>");
	var _loss = $("<div class='infoValue'></div>");
	
	$(_div).append(_total);
	$(_div).append("<div class='infoCaption'>Total tornadoes</div>");
	
	_mid = $("<div></div>");
	$(_mid).append(_injuries);
	$(_mid).append("<div class='infoCaption'>Injuries</div>");

	$(_mid).append(_fatalities);
	$(_mid).append("<div class='infoCaption'>Fatalities</div>");
	
	$(_mid).append(_loss);
	$(_mid).append("<div class='infoCaption'>Loss</div>");
	
	$(_div).append(_mid);
	
	$(_div).append("<div id='arrowDiv' style='padding-top:5px;padding-left:50px'>&#x25BC</div");
	
	$(_div).find(".superBigGreenText").css("font-size", 60);
	$(_div).find(".infoValue").css("font-size", 40);
	
	$(_mid).slideUp();
	
	$(_div).click(function(e){
		if ($(_mid).css("display") == "none") {
			$(_mid).slideDown();
			$("#arrowDiv").html("&#x25B2");			
		} else {
			_self.retract();
		}
	});
		
	this.updateInfo = function(total, injuries, fatalities, loss)
	{
		$(_total).html(total);	
		$(_injuries).html(injuries);
		$(_fatalities).html(fatalities);
		$(_loss).html(loss);
	}
	
	this.retract = function()
	{
		$(_mid).slideUp();
		$("#arrowDiv").html("&#x25BC");			
	}
	
}