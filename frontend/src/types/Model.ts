// the pairwise matrix for MI and covariance

// type QueryInfo = { name: string, relations: RelationInfo[], free_variable_relation: RelationInfo }
type ModelScalar = {
  xValue: string,
  yValue: string,
  COVAR: number
}


type ModelElement = {
  attrX: string,
  attrY: string,
  MI: number,
  dimension: number, // 0: scalar, 1: vector, 2: matrix
  matrix: ModelScalar[][],
}


type ModelMatrix = ModelElement[][]

type FlatMIElement = {
  attrX: string,
  attrY: string,
  MI: number
}


export {ModelElement, ModelMatrix, ModelScalar, FlatMIElement}
