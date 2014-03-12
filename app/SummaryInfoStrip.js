function SummaryInfoStrip(div)
{
	var _div = div;
	
	var _total = $("<div class='infoValue'></div>");
	$(_div).append(_total);
	
	this.updateInfo = function(year, total)
	{
		$(_total).html(total);		
	}
}