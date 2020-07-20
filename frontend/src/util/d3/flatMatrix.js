import * as d3 from "d3v4"
import _ from "lodash"

/**
 * 
 * @param {the svg container} painter 
 * @param {*} xVars 
 * @param {*} yVars 
 * @param {*} matrix 
 * @param {*} getX 
 * @param {*} getY 
 * @param {*} getValue 
 */
export default function showFlatMatrix(painter, dimension, xVars, yVars, matrix, getX, getY, getValue, rectWidth, divWidth, divHeight, MIColorSchema) {

  // sort xVars and yVars based on the values


  // set the dimension and margins of the graph
  var margin = {
    top: 120,
    right: 100,
    bottom: 100,
    left: 120
  }
  rectWidth = rectWidth || 80
  // make it xVars dependent
  let width = Math.max(80, xVars.length * rectWidth - margin.left - margin.right + (dimension < 1 ? 200 : 0))
  let height = yVars.length * rectWidth - margin.top - margin.bottom + (dimension < 2 ? 200 : 0)

  // remove
  painter.select('svg').remove()
  // append the svg object to the body of the page
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

  // Build X scales and axis:
  var y = d3.scaleBand()
    .range([height, 0])
    .domain([...yVars].reverse())
    .padding(0.05);
  svg.append("g")
    .call(d3.axisLeft(y));

  // Build color scale
  var myColor = d3
    // .scaleLog() 
    // .scaleImplicit()
    .scaleLinear()
    .range(["#ffe0e0", "#b00000"])
  
  if (MIColorSchema) {
    myColor = myColor.domain([0,1])
  } else {
    myColor = myColor.domain([_.min(matrix.map(m => getValue(m))), _.max(matrix.map(m => getValue(m)))+1])
  }
    // .domain([0,1])
    


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

  var mouseover = function(d) {
    tooltip.select("svg").remove()
    tooltip
      .style("opacity", 1)

    function getTranslation(transform) {
      // console.log(transform)
      if (!transform) {
        return [0,0]
      }
      // Create a dummy g for calculation purposes only. This will never
      // be appended to the DOM and will be discarded once this function 
      // returns.
      var g = document.createElementNS("http://www.w3.org/2000/svg", "g");
      
      // Set the transform attribute to the provided string value.
      g.setAttributeNS(null, "transform", transform);
      
      // consolidate the SVGTransformList containing all transformations
      // to a single SVGTransform of type SVG_TRANSFORM_MATRIX and get
      // its SVGMatrix. 
      var matrix = g.transform.baseVal.consolidate().matrix;
      
      // As per definition values e and f are the ones for the translation.
      return [matrix.e, matrix.f];
    }
    // console.log(d3.mouse(this))
    let translate = getTranslation(svg.attr("transform"))
    translate = [0,0]

    tooltip
      .html(`<h2>${getValue(d)}</h2>`)
      .style("right", 0 + "px")
      .style("bottom", 0 + "px")

    d3.select(this)
      .style("stroke", "black")
      .style("opacity", 1)
  }

  var mousemove = function(d) {
    // console.log(d3.mouse(this))
    // tooltip.select("svg").remove()
    tooltip
      .html(getValue(d))
      .style("left", (d3.mouse(this)[0]+70) + "px")
      .style("top", (d3.mouse(this)[1]+150) + "px")
  }

  var mouseleave = function(d) {
    // tooltip.select("svg").remove()
    tooltip.html("")
    tooltip
      .style("opacity", 0)
    d3.select(this)
      .style("stroke", "none")
      .style("opacity", 0.8)
  }

  //Read the data

  svg.selectAll()
    .data(matrix, function (d) {
      return getX(d) + ':' + getY(d);
    })
    .enter()
    .append("rect")
    .attr("x", function (d) {
      return x(getX(d))
    })
    .attr("y", function (d) {
      return y(getY(d))
    })
    .attr("rx", 4)
    .attr("ry", 4)
    .attr("width", x.bandwidth())
    .attr("height", y.bandwidth())
    .style("fill", function (d) {
      if (MIColorSchema && d.attrX == d.attrY) {
        return d3.color('lightgray')
      } else if (MIColorSchema && getValue(d) == 0) {
        return d3.color('white')
      } else if (MIColorSchema && getValue(d) == 1) {
        return d3.color('#521010')
      }

      return myColor(getValue(d))
    })
    .style("stroke-width", 4)
    .style("stroke", "none")
    .style("opacity", 0.8)
    .on("mouseover", mouseover)
    // .on("mousemove", mousemove)
    .on("mouseleave", mouseleave)

  return {root, svg, width, height}
}