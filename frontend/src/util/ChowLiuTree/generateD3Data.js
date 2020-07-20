export default function generateD3Data (root, variables, edges) {
  const nodes = variables.map(v => {
    return v === root ? {
      id: v,
      r: 12
    } : {
      id: v
    }
  })
  return {
    "directed": true,
    "multigraph": false,
    "graph": {},
    nodes,
    links: edges.map(edge => {
      return {
        weight: edge.MI,
        source: edge.attrX,
        target: edge.attrY,
      }
    })
  }
}