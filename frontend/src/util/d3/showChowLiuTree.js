// 
import generateD3Data from "../ChowLiuTree/generateD3Data"
import generateMST from "../ChowLiuTree/minumumSpanningTree"

import * as d3 from "d3v4"

export default function showChowLiuTree(variables, matrix, rootNode, id) {

  // compute the clt 
  const mst = generateMST(matrix)
  const graph = generateD3Data(rootNode, variables, mst)

  let width = document.getElementById(id).getBoundingClientRect().width - 22
  let height = (window.innerHeight || document.documentElement.clientHeight || document.body.clientHeight) - 270

  // height /= 2

  d3.select(`#${id}`).select('svg').remove()

  var root = d3.select(`#${id}`)
    .append("svg")
    .attr("width", width)
    .attr("height", height)

  

  var svg = root.append('g')
    
  // enable pan and zoom
  // enablePanAndZoom("chow_liu_tree_svg")
  root.call(d3.zoom()
      .extent([[0, 0], [width, height]])
      .scaleExtent([0.2, 8])
      .on("zoom", zoomed));

  function zoomed() {
    svg.attr("transform", d3.event.transform);
  }
  

  var color = d3.scaleOrdinal(d3.schemeCategory20);

  var simulation = d3.forceSimulation()
    .force("link", d3.forceLink().id(function (d) {
      return d.id;
    }))
    .force("charge", d3.forceManyBody())
    .force("center", d3.forceCenter(width / 2, height / 2));

    var link = svg.append("g")
      .attr("class", "links")
      .selectAll("line")
      .data(graph.links)
      .enter().append("line")
      .attr("stroke-width", function (d) {
        return 1;
      });

    var node = svg.append("g")
      .attr("class", "nodes")
      .selectAll("g")
      .data(graph.nodes)
      .enter().append("g")

    var circles = node.append("circle")
      .attr("r", function (d) {
        return 5
      })
      .attr("fill", function (d) {
        return d.r ? 'red' : color(d.group);
      })
      .call(d3.drag()
        .on("start", dragstarted)
        .on("drag", dragged)
        .on("end", dragended));

    var lables = node.append("text")
      .text(function (d) {
        return d.id;
      })
      .attr('x', 6)
      .attr('y', 3);

    node.append("title")
      .text(function (d) {
        return d.id;
      });

    simulation
      .nodes(graph.nodes)
      .on("tick", ticked);

    simulation.force("link")
      .links(graph.links);

    function ticked() {
      link
        .attr("x1", function (d) {
          return d.source.x;
        })
        .attr("y1", function (d) {
          return d.source.y;
        })
        .attr("x2", function (d) {
          return d.target.x;
        })
        .attr("y2", function (d) {
          return d.target.y;
        });

      node
        .attr("transform", function (d) {
          return "translate(" + d.x + "," + d.y + ")";
        })
    }

  function dragstarted(d) {
    if (!d3.event.active) simulation.alphaTarget(0.3).restart();
    d.fx = d.x;
    d.fy = d.y;
  }

  function dragged(d) {
    d.fx = d3.event.x;
    d.fy = d3.event.y;
  }

  function dragended(d) {
    if (!d3.event.active) simulation.alphaTarget(0);
    d.fx = null;
    d.fy = null;
  }

  return
}