import * as d3 from "d3v4"
import _ from "lodash"

export default function showModelSelection(label, MIArray, threshold) {


  // set the dimensions and margins of the graph
  var margin = {
    top: 100,
    right: 100,
    bottom: 30,
    left: 150
  }
  let width = 320 - margin.left - margin.right
  let height = 1000 - margin.top - margin.bottom

  // append the svg object to the body of the page
  d3.select("#mutual_selection_vis").select('svg').remove()
  var svg = d3.select("#mutual_selection_vis")
    .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform",
      "translate(" + margin.left + "," + margin.top + ")");

  // Labels of row and columns

  // Build X scales and axis:
  var x = d3.scaleBand()
    .range([0, width])
    .domain([label])
    .padding(0.01);
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
    .domain(MIArray.map(e => e.attrY))
    .padding(0.01);
  svg.append("g")
    .call(d3.axisLeft(y));

  // Build color scale
  var myColor = d3.scaleLinear()
    .range(["white", "#69b3a2"])
    .domain([0, 1])

  //Read the data

  const g = svg.selectAll()
    .data(MIArray, function (d) {
      return d.attrX + ':' + d.attrY;
    })
    .enter()
    .append("g")

  g.append("rect")
    .attr("x", function (d) {
      return x(d.attrX)
    })
    .attr("y", function (d) {
      return y(d.attrY)
    })
    .attr("width", x.bandwidth())
    .attr("height", y.bandwidth())
    .style("fill", function (d) {
      return myColor(d.MI)
    })
    
  g.append("text")
  .attr("text-anchor", "middle")
    .attr("x", function (d) {
      return x(d.attrX) + x.bandwidth()/2
    })
    .attr("y", function (d) {
      return y(d.attrY) + y.bandwidth() - 4
    })
    .attr("fill","black")
    .attr("font-size", "14px")
    .text(d => d.MI.toFixed(4));

    // console.log(MIArray, threshold)
  let THRIndex = _.findLastIndex(_.reverse(MIArray), e => e.MI > threshold) + 1
  // console.log(THRIndex)
  THRIndex = THRIndex == -1 ? 0 : THRIndex

  // draw THR line
  svg.append('line')
    .style("stroke", "red")
    .style("stroke-width", 1.5)
    .attr("x1", -100)
    .attr("y1", (y.bandwidth()+0.2) * THRIndex)
    .attr("x2", x.bandwidth())
    .attr("y2", (y.bandwidth()+0.2) * THRIndex); 

  svg.append('text')
  // .attr("text-anchor", "middle")
  .attr("x", x.bandwidth() + 5)
  .attr("y", (y.bandwidth()+0.2) * (THRIndex) + 3)
  .attr("stroke","red")
  .text("THR");

}