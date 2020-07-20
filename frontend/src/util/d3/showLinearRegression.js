import * as d3 from "d3v4"
import _ from "lodash"
import showD2Matrix from "./d2Matrix"

export default function showLinearRegression(features, label, matrix) {
  const painter = d3.select("#lr_vis")

  let width = document.getElementById("lr_vis").getBoundingClientRect().width - 22
  let height = (window.innerHeight || document.documentElement.clientHeight || document.body.clientHeight) - 200



  const {root, svg} = showD2Matrix(painter, 1, [label], features, matrix, m => m.attrX, m => m.attrY, m => m.dimension, m2 => _.union(m2.matrix.flat().map(e => e.xValue)),
  m2 => _.union(m2.matrix.flat().map(e => e.yValue)),
  m2 => m2.matrix.flat(), width, height  )

  root.call(d3.zoom()
      .extent([[0, 0], [width, height]])
      .scaleExtent([0.2, 8])
      .on("zoom", zoomed));

  function zoomed() {
    svg.attr("transform", d3.event.transform);
  }
}