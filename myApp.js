"use strict";

//var bts = document.querySelectorAll(".pEma")
//
//for(var i = 0; i<elems.length; i++) {
//    elems[i].click();
//}

var margin = {top: 20, right: 20, bottom: 70, left: 90},
    width = 960 - margin.left - margin.right,
    height = 500 - margin.top - margin.bottom;

var xCol = "date"
var yCol = "pEma_w"

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

var line = d3.svg.line()
    .x(function(d) { return xScale(d[xCol]); })
    .y(function(d) { return yScale(d[yCol]); });

var tooltip = d3.select('#SvgChart').append('div').style('position', 'absolute').style('padding', '0 10px').style('background', 'white').style('opacity', 0)

var svg = d3.select("body").append("svg")
            .attr("width", width + margin.left + margin.right)
            .attr("height", height + margin.top + margin.bottom)

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
      .attr("class", "x axis")
      .attr("transform", "translate(0," + height + ")")
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

    var rect1 =  g1.selectAll('rect').data(data).enter().append('rect')
        .style('fill', "white" )
        .style('opacity', .1)
        .attr('width', function(d, i) { return ( width/ (data.length) ) ; })
        .attr('height', height)
        .attr('x', function(d, i) { return (xScale(d[xCol]) -  width/ (data.length)/2) ; })
        .attr('y', 0)
    
    rect1.on('mouseover', function(d) {
           d3.select(this).style('opacity', 1).style('fill', "yellow");
           tooltip.transition().style('opacity', .9); 
           tooltip.html(d[yCol] + "<br>" + formatDate2(d[xCol])  )  //set the indication bar to the center of the xaxis tick
               .style('left',(d3.event.pageX + 8) + 'px')
               .style('top', (d3.event.pageY + 8) + 'px'); 
           d3.select(this).style('opacity', 0.5).style('fill', 'yellow'); 
            console.log("mouseover")
    })
    
    rect1.on('mouseout', function() { 
           d3.select(this).style('opacity', 0.1).style('fill', "white"); });

    
    
    //draw the line    
    var path1 = g1.append("path");
    path1.attr("d", line(data))     
        .transition()
        .duration(1000)  //implement transition
        .attrTween("d", function()  {
            var interpol = d3.scale.quantile()
                    .domain([0,1])
                    .range(d3.range(1, data.length + 1));
            return function(t) {
                return line(data.slice(0, interpol(t)));
            };
        });
}

//preprocess the data
function type(d) {
    if(formatDate1.parse(d[xCol]) != null)
        d[xCol] = formatDate1.parse(d[xCol]);
    else if(formatDate2.parse(d[xCol]) != null)
        d[xCol] = formatDate2.parse(d[xCol]);
    else
        throw new Error('Date formate error!');;

    d[yCol] = +d[yCol];
    if(d[yCol] == 0)
        return null;
    
        return d;
}

d3.csv("QUALCOMM.csv", type, function(error, data) {
  if (error) throw error;    
  render(data);
});

