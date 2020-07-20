// https://en.wikipedia.org/wiki/Minimum_spanning_tree
// Kruskal's algorithm
// import from 
import {ModelMatrix, ModelElement} from "../../types/Model"
import _ from "lodash"
// import { variables } from "../../data/RetailerMatrix"


function buildUndirectedGraph(matrix: ModelMatrix, variables: string[]): ModelElement[] {
    // we need to make the graph undirected
  // the assumption is that MI symmetric
  let graph: ModelElement[] = []
  const visitedEdges: {[_: string]: {[_:string]: boolean} } = {}
  variables.forEach(v => {
    visitedEdges[v] = {}
  })
  variables.forEach(v1 => {
    variables.forEach(v2 => {
      visitedEdges[v1][v2] = false
    })
  })
  
  // console.log(visitedEdges)

  // console.log(matrix.flat())
  matrix.flat().forEach(edge => {
    // filter out same node
    if (edge.attrX == edge.attrY) 
      return
    
    if (!visitedEdges[edge.attrX][edge.attrY] && !visitedEdges[edge.attrX][edge.attrY]) {
      graph.push(edge)

      visitedEdges[edge.attrX][edge.attrY] = true
      visitedEdges[edge.attrY][edge.attrX] = true
    }
  })

  return graph
}

export default function generateMST(matrix: ModelMatrix): ModelElement[] {

  const variables = _.uniq(matrix.flat().map(a => a.attrX))
  let sortedEdges = buildUndirectedGraph(matrix, variables)
  
  sortedEdges = sortedEdges.sort((a,b) => b.MI - a.MI) // DESC order

  // make disjoint set for each variable
  let disjointSet: Array<Array<string>> = []
  variables.forEach(v => disjointSet.push([v]))

  const maxSpanningTree: ModelElement[] = []

  // Go through all edges started from the minimum one and try to add them
  // to minimum spanning tree. The criteria of adding the edge would be whether
  // it is forms the cycle or not (if it connects two vertices from one disjoint
  // set or not).
  for (let edgeIndex = 0; edgeIndex < sortedEdges.length; edgeIndex += 1) {
    /** @var {GraphEdge} currentEdge */
    const currentEdge = sortedEdges[edgeIndex];

    // Check if edge forms the cycle. If it does then skip it.
    const xSetIdx = disjointSet.findIndex(s => s.includes(currentEdge.attrX))
    const ySetIdx = disjointSet.findIndex(s => s.includes(currentEdge.attrY))


    console.assert(xSetIdx !== -1)
    console.assert(ySetIdx !== -1)

    if (xSetIdx !== ySetIdx) {
      // Unite two subsets into one.
      const unionSet = _.union(disjointSet[xSetIdx], disjointSet[ySetIdx])

      disjointSet = disjointSet.filter((v, i) => i !== xSetIdx && i !== ySetIdx)
      disjointSet.push(unionSet)

      // Add this edge to spanning tree.
      maxSpanningTree.push(currentEdge);

    }

  }

  return maxSpanningTree

}



