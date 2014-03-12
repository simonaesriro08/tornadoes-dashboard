function SummaryInfoStrip(div)
{
	var _div = div;
	this.updateInfo = function(year, total)
	{
		var text = "In <b>"+year+"</b>, the area to the right saw <b>"+total+"</b> tornadoes.";
		$(_div).html(text);		
	}
}