import * as d3 from "d3v4"

const LINK_WIDTH = 20;

export default function showJoinTree(graph, id) {

  // compute the clt 
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
    .extent([
      [0, 0],
      [width, height]
    ])
    .scaleExtent([0.2, 8])
    .on("zoom", zoomed));

  function zoomed() {
    svg.attr("transform", d3.event.transform);
  }

  // build the arrow.
  svg.append("svg:defs").selectAll("marker")
    .data(["end"]) // Different link/path types can be defined here
    .enter().append("svg:marker") // This section adds in the arrows
    .attr("id", String)
    .attr("viewBox", "0 -5 10 10")
    .attr("refX", 15)
    .attr("refY", 0)
    .attr("markerWidth", 8)
    .attr("markerHeight", 8)
    .attr("orient", "auto")
    .append("svg:path")
    .attr("d", "M0,-5L10,0L0,5");
    
    // .attr("viewBox", "0 -5 10 10")
    // .attr("refX", 15)
    // .attr("refY", -1.5)
    // .attr("markerWidth", 6)
    // .attr("markerHeight", 6)
    // .attr("orient", "auto")
    // .append("svg:path")
    // .attr("d", "M0,-5L10,0L0,5");

  var color = d3.scaleOrdinal(d3.schemeCategory20);

  var simulation = d3.forceSimulation()
    .force("link", d3.forceLink().id(function (d) {
      return d.id;
    }))
    .force("charge", d3.forceManyBody().strength(-1500))
    .force("center", d3.forceCenter(width / 2, height / 2));

  prepareLinks()

  var link = svg.append("g")
    .attr("class", "links")
    .selectAll("line")
    .data(graph.links)
    .enter().append("line")
    .attr("stroke-width", function (d) {
      return 1;
    })
    .attr("marker-end", "url(#end)");



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
    .attr('x', 8)
    .attr('y', 4);

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
      })
      .attr('transform', function (d) {

        var rightwardSign = d.target.x > d.source.x ? 1 : -1;
        var translation = calcTranslationExact(rightwardSign * 4, d.source, d.target);
        // console.log({translation})
        return `translate (${translation.dx}, ${translation.dy})`;
      });

    node
      .attr("transform", function (d) {
        return "translate(" + d.x + "," + d.y + ")";
      })
  }

  function calcTranslationExact(targetDistance, point0, point1) {
    var x1_x0 = point1.x - point0.x,
      y1_y0 = point1.y - point0.y,
      x2_x0, y2_y0;
    if (y1_y0 === 0) {
      x2_x0 = 0;
      y2_y0 = targetDistance;
    } else {
      var angle = Math.atan((x1_x0) / (y1_y0));
      x2_x0 = -targetDistance * Math.cos(angle);
      y2_y0 = targetDistance * Math.sin(angle);
    }
    return {
      dx: x2_x0,
      dy: y2_y0
    };
  }

  function prepareLinks() {
    var linksFromNodes = {};
    graph.links.forEach(function (val, idx) {
      var sid = val.source,
        tid = val.targetID,
        key = (sid < tid ? sid + "," + tid : tid + "," + sid);
      if (linksFromNodes[key] === undefined) {
        linksFromNodes[key] = [idx];
        val.multiIdx = 1;
      } else {
        val.multiIdx = linksFromNodes[key].push(idx);
      }
      // Calculate target link distance, from the index in the multiple-links array:
      // 1 -> 0, 2 -> 2, 3-> -2, 4 -> 4, 5 -> -4, ...
      val.targetDistance = (val.multiIdx % 2 === 0 ? val.multiIdx * LINK_WIDTH : (-val.multiIdx + 1) * LINK_WIDTH);
    });
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