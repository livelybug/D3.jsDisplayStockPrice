"use strict";

var sourceFileName = "QUALCOMM.csv";

var margin = {top: 20, right: 20, bottom: 70, left: 90},
    width = 960 - margin.left - margin.right,
    height = 500 - margin.top - margin.bottom;

var xCol = "date"
var yCol = "pEma_3"

var formatDate1 = d3.time.format("%d-%m-%Y");
var formatDate2 = d3.time.format("%d/%m/%Y");

var xScale = d3.time.scale()  //Change data to pixel
    .range([0, width]);  //Pixel range

var yScale = d3.scale.linear()
    .range([height, 0]);

var xAxis = d3.svg.axis()
    .scale(xScale)
    .orient("bottom")
    .tickFormat(formatDate2);

var yAxis = d3.svg.axis()
    .scale(yScale)
    .orient("left");


var tooltip = d3.select("#SvgChart").append("div")
                .style("position", "absolute").style("padding", "0 10px").style("background", "white").style("opacity", .7);

var svg = d3.select("body").append("svg")
            .attr("width", width + margin.left + margin.right)
            .attr("height", height + margin.top + margin.bottom);

var g1= svg.append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

function render(data) {
    //set input data of scales
    var minmaxDate = d3.extent(data, function(d) {return d[xCol]; });   //use "extent" to generate an array of min and max
    xScale.domain(minmaxDate);  
    var minmaxVal = d3.extent(data, function(d) {return d[yCol]; });
    yScale.domain(minmaxVal);
                    
    //set x axis
    g1.append("g")
      .attr("class", "x axis").attr("transform", "translate(0," + height + ")")
      .call(xAxis);
    // rotate the label of xaxis
    g1.selectAll(".x .tick text")  
        .attr("transform", function(d) {
            return "translate(" + this.getBBox().height*-2 + "," + (this.getBBox().height + 10) + ")rotate(-45)";
        });

    //set y axis
    g1.append("g")
      .attr("class", "y axis")
      .call(yAxis)

    //create indication bar by invisible rectangles
    var rect1 =  g1.selectAll("rect").data(data).enter().append("rect")
        .style("fill", "white" )
        .style("opacity", .1)
        .attr("width", function(d, i) { return ( width/ (data.length) ) ; })
        .attr("height", height)
        .attr("x", function(d, i) { return (xScale(d[xCol]) -  width/ (data.length)/2) ; })
        .attr("y", 0)
    
    // Make the indication bar visible, display price and date according to the mouse position
    rect1.on("mouseover", function(d) {
           tooltip.html(d[yCol] + "<br>" + formatDate2(d[xCol])  )  //set the indication bar to the center of the xaxis tick
               .style("left",(d3.event.pageX + 8) + "px")
               .style("top", yScale(d[yCol]) + "px"); 
           d3.select(this).style("opacity", 0.5).style("fill", "yellow"); 
    })
    
    rect1.on("mouseout", function() { 
           d3.select(this).style("opacity", 0.1).style("fill", "white"); });

    var line = d3.svg.line()
        .x(function(d) { return xScale(d[xCol]); })
        .y(function(d) { return yScale(d[yCol]); });
    
    //draw the price line    
    var path1 = g1.append("path").attr("class", "pricePath");
    path1.attr("d", line(data));

    path1.transition()
        .duration(1000)  
        .attrTween("d", function()  {
            var interpol = d3.scale.quantile()
                    .domain([0,1])
                    .range(d3.range(1, data.length + 1));
            return function(t) { return line(data.slice(0, interpol(t))); };
        });
}

//preprocess the data
function type(d) {
    if(formatDate1.parse(d[xCol]) != null)
        d[xCol] = formatDate1.parse(d[xCol]);
    else if(formatDate2.parse(d[xCol]) != null)
        d[xCol] = formatDate2.parse(d[xCol]);
    else
        throw new Error("Date formate error!");;

    d[yCol] = +d[yCol];
    
    return d;
}

// main starts here
d3.csv(sourceFileName, type, function(error, data) {
  if (error) throw error;    
  render(data);
});

//select all the reloading buttons
var bts = document.querySelectorAll(".pEma")

//add event functions to all the reloading buttons
for(var i = 0; i<bts.length; i++) {
    bts[i].addEventListener("click", reloadData);
}

function reloadData() {
    console.log(this.innerHTML);
    yCol = this.innerHTML;
    
    d3.csv(sourceFileName, type, function(error, data) {
        if (error) throw error;    
        
        //re-set input data of y-scale
        var minmaxVal = d3.extent(data, function(d) {return d[yCol]; });
        yScale.domain(minmaxVal);
        
        //re-set y axis
        g1.select("g.y.axis").call(yAxis);

        var line = d3.svg.line()
            .x(function(d) { return xScale(d[xCol]); })
            .y(function(d) { return yScale(d[yCol]); });

        //re-draw the line    
        var path1 = d3.select(".pricePath")
        path1.attr("d", line(data));
    });
}
