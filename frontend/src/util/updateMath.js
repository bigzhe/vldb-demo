// const svgPanZoom = require('svg-pan-zoom')


export function enable_svg_zoom() {
  svgPanZoom('#root-svg', {
    zoomEnabled: true,
    controlIconsEnabled: true,
    fit: false,
    center: true,
    // viewportSelector: document.getElementById('demo-tiger').querySelector('#g4') // this option will make library to misbehave. Viewport should have no transform attribute
  });
}


export function updateMathContent() {
  MathJax.typeset()
}

export function tex2svg(tex) {
  const svg = MathJax.tex2svg(tex, {display: true});
  return MathJax.startup.adaptor.innerHTML(svg)
}
