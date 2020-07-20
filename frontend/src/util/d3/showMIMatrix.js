import * as d3 from "d3v4"
import showFlatMatrix from "./flatMatrix"

export default function showMIMatrix(variables, matrix) {
  const painter = d3.select("#mi_matrix_vis")

  let width = document.getElementById("mi_matrix_vis").getBoundingClientRect().width - 22
  let height = (window.innerHeight || document.documentElement.clientHeight || document.body.clientHeight) - 200

  const {root, svg} = showFlatMatrix(painter, 2, variables, variables, matrix, m => m.attrX, m => m.attrY, m => m.MI, 30, width, height, true)

  root.call(d3.zoom()
      .extent([[0, 0], [width, height]])
      .scaleExtent([0.2, 8])
      .on("zoom", zoomed));

  function zoomed() {
    svg.attr("transform", d3.event.transform);
  }
}
