function BarChart(div, years, callBack)
{
	var _div = div;
	var _years = years;
	var _activeYear = "1980";
	var _minHeight = 450;
	
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
		$(_div).append("<div class='x-axis'></div>");
		
		var scaleNumbers = $("<div class='scaleLabels'></div>");
		var xmin = $("<div id='xmin'>0</div>");
		var xmax = $("<div id='xmax'></div>");
		
		$(scaleNumbers).append(xmin);
		$(scaleNumbers).append(xmax);
		
		$(_div).append(scaleNumbers);
		
		$(".barChart li").click(function(e) {
			$(".barChart .bar").removeClass("active");
			$(e.target).addClass("active");
			_activeYear = $(e.target).parent().parent().find(".labelDiv").html();
			callBack();
        });
		
	}
	
	this.resize = function()
	{
		$(_div).height($(_div).parent().height() - 180);
		$(".barChart ul").height($(_div).innerHeight()-35);
		$(".barChart li").height(parseInt($(".barChart ul").innerHeight() / $(".barChart li").length));
		$(".barChart .barCanvas").width($(".barChart li").width() - $(".barChart .labelDiv").width());
		$(".barChart .bar").height($(".barChart .barCanvas").height() - 4);
		$(".barChart .bar").css("top", 2);
		if ($(_div).height() < _minHeight) {
			// only show labels that are multiples of 5
			$.each($(".barChart .labelDiv"), function(index, value){
				if (parseInt($(value).html()) % 5) $(value).css("display", "none");
				else $(value).css("display", "block");
			});
		} else {
			$(".barChart .labelDiv").css("display", "block");
		}
	}
	
	this.setValues = function(hash) 
	{
		var maxCount = Math.max.apply(Math, $.map(hash, function(element,index){return element.totalCount}));
		$(".barChart #xmax").html(maxCount);
		var pct;
		var val;
		$(".qtip").remove();
		var recs;
		$.each($(".barChart li"), function(index, value) {
			recs = $.grep(hash, function(n, i){return n.year == $(value).find(".labelDiv").html()});
			if (recs.length == 0) val = 0;
			else val = recs[0].totalCount;
			$(value).find(".bar").qtip({
				content:{
					text: $(value).find(".labelDiv").html()+": <b>"+val+"</b> tornadoes"
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