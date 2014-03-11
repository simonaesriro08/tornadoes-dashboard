function BarChart(div, years, callBack)
{
	var _div = div;
	var _years = years;
	var _activeYear = "1980";
	
	build();
	
	function build()
	{
		var ul = $("<ul></ul>");
		var li;
		var labelDiv;
		var barCanvas;
		var bar;
		$.each(_years, function(index, value){
			labelDiv = $("<div>"+value+"</div>");
			$(labelDiv).addClass("barChart labelDiv");
			barCanvas = $("<div class='barCanvas'></div>");
			bar = $("<div class='bar'></div>");
			if (value == _activeYear) $(bar).addClass("active");
			$(barCanvas).append(bar);
			li = $("<li></li>");
			$(li).append(labelDiv).append(barCanvas);
			$(ul).append(li);
		});
		$(_div).append(ul);
		
		$(".barChart li").click(function(e) {
			$(".barChart .bar").removeClass("active");
			$(e.target).addClass("active");
			_activeYear = $(e.target).parent().parent().find(".labelDiv").html();
			callBack();
        });
		
	}
	
	this.resize = function()
	{
		$(_div).height($(_div).parent().height() - 260);
		$(".barChart ul").height($(_div).innerHeight());
		$(".barChart li").height(parseInt($(".barChart ul").innerHeight() / $(".barChart li").length));
		$(".barChart .barCanvas").width($(".barChart li").width() - $(".barChart .labelDiv").width());
		$(".barChart .bar").height($(".barChart .barCanvas").height() - 4);
		$(".barChart .bar").css("top", 2);
	}
	
	this.setValues = function(hash) 
	{
		var maxCount = Math.max.apply(Math, $.map(hash, function(element,index){return element}));
		var pct;
		var val;
		$(".qtip").remove();
		$.each($(".barChart li"), function(index, value) {
			val = hash[$(value).find(".labelDiv").html()];
			$(value).find(".bar").qtip({
				content:{
					text: $(value).find(".labelDiv").html()+": <b>"+val+"</b>"
				},
				style:{
					classes: 'qtip-light qtip-rounded qtip-shadow'
				},
				position:{
					adjust:{x:0,y:0},
					my: 'left-center',
					at:'right-center'
				}				
			});
			if (!val) val = 0;
			pct = val / maxCount;
			pct = (pct * 100)+"%";
			$(value).find(".bar").animate({width: pct});
		});
	}
	
	this.getActiveYear = function()
	{
		return _activeYear;
	}
	
}