import * as d3 from "d3v4"
import _ from "lodash"

import showFlatMatrix from "./flatMatrix"

export default function showD2Matrix(painter, dimension, xVars, yVars, matrix, getX, getY, getValue, getD2XVars, getD2YVars, getD2Matrix, divWidth, divHeight) {

  // console.log(matrix)

  // set the dimensions and margins of the graph
  var margin = {
    top: 120,
    right: 100,
    bottom: 100,
    left: 120
  }
  let width = xVars.length * 100 - margin.left - margin.right + (dimension < 1 ? 200 : 0) + 200
  let height = yVars.length * 100 - margin.top - margin.bottom + (dimension < 1 ? 200 : 0) + 200

  // append the svg object to the body of the page
  painter.select('svg').remove()

  var root = painter
    .append("svg")
    .attr("width", divWidth)
    .attr("height", divHeight)
    .append("g")
    .attr("transform",
      "translate(" + margin.left + "," + margin.top + ")");

  const svg = root.append('g')

  // Labels of row and columns

  // Build X scales and axis:
  var x = d3.scaleBand()
    .range([0, width])
    .domain(xVars)
    .padding(0.05);
  svg.append("g")
    .attr("transform", "translate(0," + 0 + ")")
    // .attr("transform", "rotate(180)")
    .call(d3.axisTop(x))
    .selectAll("text")
    .style("text-anchor", "end")
     .attr("dx", "-1em")
     .attr("dy", "1em")
     .attr("transform", "rotate(90)");


  
  const yBands = [...yVars].reverse()

  // Build X scales and axis:
  var y = d3.scaleBand()
    .range([height, 0])
    .domain(yBands)
    .padding(0.05);
  svg.append("g")
    .call(d3.axisLeft(y));

  // Build color scale
  var myColor = d3.scaleLinear()
    .range(["white", "#69b3a2"])
    .domain([0,2])
    // .domain([_.min(matrix.map(m => getValue(m))), _.max(matrix.map(m => getValue(m)))])

  // create a tooltip
  var tooltip = painter
  .append("div")
  .style("opacity", 0)
  .attr("class", "tooltip")
  .style("background-color", "white")
  .style("border", "solid")
  .style("border-width", "2px")
  .style("border-radius", "5px")
  .style("padding", "5px")

  let selectedRect = null

  var mouseover = function(d) {
    if (tooltipStay)
      return
    
    tooltip.select("svg").remove()
    tooltip
      .style("opacity", 1)

    // add the cov cat content
    const matrix = getD2Matrix(d)
    const xVars = getD2XVars(d)
    const yVars = getD2YVars(d)

    tooltip
      .style("right", 0 + "px")
      .style("bottom", 0 + "px")


    let width = divWidth/2
    let height = divHeight/2
    
    const {root, svg} = showFlatMatrix(tooltip, d.dimension, xVars, yVars, matrix, m => m.xValue, m => m.yValue, m => m.COVAR, 80, divWidth/1.2, divHeight/2)

    root.call(d3.zoom()
      .extent([[0, 0], [width, height]])
      .scaleExtent([0.2, 8])
      .on("zoom", zoomed));

    function zoomed() {
      svg.attr("transform", d3.event.transform);
    }


    selectedRect = d3.select(this)
    selectedRect
      .style("stroke", "black")
      .style("stroke-width", 4)
      .style("opacity", 1)
  }

  var mouseleave = function(d) {
    if (tooltipStay)
      return

    
    tooltip
      .style("opacity", 0)
    tooltip.select("svg").remove()
    d3.select(this)
    .style("stroke-width", 1)
    .style("stroke", "gray")
      .style("opacity", 0.8)
  }

  let tooltipStay = false
  var mouseclick = function(d) {
    // toggle it
    tooltipStay = !tooltipStay

    if (tooltipStay) {
      mouseover(d)
    } else {
      selectedRect
      .style("stroke-width", 1)
      .style("stroke", "gray")
      .style("opacity", 0.8)
      mouseleave(d)
    }
  }

  //Read the data
  // console.log(matrix)
  svg.selectAll()
    .data(matrix, function (d) {
      return getX(d) + ':' + getY(d);
    })
    .enter()
    .append("rect")
      .attr("x", function(d) { return x(getX(d)) })
      .attr("y", function(d) { return y(getY(d))})
      .attr("rx", 4)
      .attr("ry", 4)
      .attr("width", x.bandwidth() )
      .attr("height", y.bandwidth() )
      .style("fill", function(d) { return myColor(getValue(d) + 0.2)} )
      .style("stroke-width", 1)
      .style("stroke", "gray")
      .style("opacity", 0.8)
    .on("mouseover", mouseover)
    // .on("mousemove", mousemove)
    .on("mouseleave", mouseleave)
    .on("click", mouseclick)


  return {root, svg, width, height}
}