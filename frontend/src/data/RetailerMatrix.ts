import { ModelElement, ModelMatrix, ModelScalar, FlatMIElement } from "../types/Model"

import _ from 'lodash'

// import {matrix} from "./generateMatrix"

// import {vars} from "./variables"

// const variables = vars

// some fake matrix
// export const RetailerMatrix: ModelMatrix = matrix

export const getMIFlatArray = function (matrix: ModelMatrix): FlatMIElement[] {
  return matrix.flat()
}

export const getModelSelectionArray = function (matrix: ModelMatrix, variables: string[], label: string): FlatMIElement[] {
  const labelIndex = variables.findIndex(v => v == label)
  console.assert(labelIndex !== -1)
  return matrix[labelIndex].sort((a, b) => a.MI - b.MI)
}

export const getCovArray = function (matrix: ModelMatrix, features: string[]): FlatMIElement[] {
  return matrix.filter(col => features.includes(col[0].attrX)).flat().filter(x => features.includes(x.attrY))
}

export const getLinearRegressionArray = function (matrix: ModelMatrix, variables: string[], features: string[], label: string): FlatMIElement[] {
  const labelIndex = variables.findIndex(v => v == label)
  console.assert(labelIndex !== -1)
  return matrix[labelIndex].filter(x => features.includes(x.attrY))
}