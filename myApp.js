"use strict";

var margin = {top: 20, right: 20, bottom: 50, left: 50},
    width = 960 - margin.left - margin.right,
    height = 500 - margin.top - margin.bottom;

var xCol = "date"
var yCol = "pVolume"

var formatDate1 = d3.time.format("%d-%m-%Y");
var formatDate2 = d3.time.format("%d/%m/%Y");
var date_format_tick = d3.time.format("%d %b");

var xScale = d3.time.scale()  //Change data to pixel
    .range([0, width]);  //Pixel range

var yScale = d3.scale.linear()
    .range([height, 0]);

var xAxis = d3.svg.axis()
    .scale(xScale)
    .orient("bottom")
    .tickFormat(date_format_tick);

var yAxis = d3.svg.axis()
    .scale(yScale)
    .orient("left");

var line = d3.svg.line()
    .x(function(d) { return xScale(d[xCol]); })
    .y(function(d) { return yScale(d[yCol]); });

var svg = d3.select("body").append("svg")
            .attr("width", width + margin.left + margin.right)
            .attr("height", height + margin.top + margin.bottom)

var g1= svg.append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

function render(data) {
    
    //set input data of scales
    xScale.domain(d3.extent(data, function(d) { return d[xCol]; }));  //use "extent" to generate an array of min and max
    yScale.domain(d3.extent(data, function(d) { return d[yCol]; }));
        
    //set x axis
    g1.append("g")
      .attr("class", "x axis")
      .attr("transform", "translate(0," + height + ")")
      .call(xAxis);
    
    g1.selectAll(".x .tick text")  // select all the text elements for the xaxis
        .attr("transform", function(d) {
            return "translate(" + this.getBBox().height*-2 + "," + this.getBBox().height + ")rotate(-45)";
        });

    //set y axis
    g1.append("g")
      .attr("class", "y axis")
      .call(yAxis)

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

//preprocess function for the data
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

