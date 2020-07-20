import { ModelElement, ModelMatrix, ModelScalar, FlatMIElement } from "../types/Model"
import fp from 'lodash/fp'
import _ from 'lodash'

// import { res } from "./parseResponse"
import { parseResponse, parseResult, parseMIResponse } from './parseResponse'

import dataset from './dataset'

import { vars } from './variables'

function norm(v: number, max: number, min: number):number {
  return (v-min) / (max - min)
}

export function generateMatrix(features: string[], label: string, response: string, responseMI: string): [number, number, string[], ModelMatrix, ModelMatrix] {

  const res = parseResponse(response)
  const resMI = parseMIResponse(responseMI)

  // console.log({res, resMI})

  const variables = vars

  const RetailerDatset = dataset.find(d => d.name == "Retailer")

  const variableInfo = fp.isNil(RetailerDatset) ? {} : RetailerDatset.variableInfo


  // 1) cont_sum2/cat_sum2 contains X^2 of continuous/categorical variables on the main diagonal; 
  // cont_degree2/cat_degree2 contains products X*Y of two continuous/categorical variables, these are values above the main diagonal, row by row;
  // cont_cat_degree2 contains products X*Y where X is cont and Y is cat, row by row;

  const contSum2Iter = res.cont_sum2[Symbol.iterator]();
  const catSum2Iter = res.cat_sum2[Symbol.iterator]();

  const contDegree2Iter = res.cont_degree2[Symbol.iterator]();
  const catDegree2Iter = res.cat_degree2[Symbol.iterator]();

  const contCatDegree2Iter = res.cont_cat_degree2[Symbol.iterator]();


  const MICatDegree2Iter = resMI.cat_degree2[Symbol.iterator]();
  const MICount = resMI.count

  // for normalization
  let maxMI = 0
  let minMI = 100

  const generateMatrixScalar = function (xValue: string, yValue: string, cov: number): ModelScalar {
    return {
      xValue,
      yValue,
      COVAR: cov
    }
  }

  const getModelElement = function (attrX: string, attrY: string): ModelElement {

    let dimension = [variableInfo[attrX].isCategorical, variableInfo[attrY].isCategorical].filter(x => x).length

    // let dimension = fp.random(0, 2);

    let MI = 0
    if (attrX === attrY) {
      const Cx = resMI.cat_sum1[variables.findIndex(v => v == attrX)]
      const Cy = resMI.cat_sum1[variables.findIndex(v => v == attrY)]

      // Object.entries(Cx).forEach(([k1, cx]) => {
      //   Object.entries(Cy).forEach(([k2,cy]) => {
      //     MI += (cx / MICount) * Math.log2(MICount * cx/(cx * cy))  
      //   })
      // })
      
      MI += 1
    } else {
      const Cxy = MICatDegree2Iter.next().value
      // res.cat_sum1.findIndex
      const Cx = resMI.cat_sum1[variables.findIndex(v => v == attrX)]
      const Cy = resMI.cat_sum1[variables.findIndex(v => v == attrY)]

      // const Cx = MICatSum1Iter.next().value
      // console.log(Cx)
      // const Cy = MICatSum1Iter.next().value
      Cxy.forEach((item: {x:string,y:string,val:number}) => {
        let {x,y,val} = item

        const cx = Cx[parseInt(x)] || 0
        const cy = Cy[parseInt(y)] || 0
        if (cx && cy) {
          MI += (val / MICount) * Math.log2(MICount * val/(cx * cy))  
        }
   
      })
    }

    if (attrX == 'inventoryunits' || attrY == 'inventoryunits') {
      // MI *= 10
      // MI = MI * (Math.pow(10, 2 - dimension))
    }
    // MI = MI * (Math.pow(10, 2 - dimension))

    minMI = Math.min(minMI, MI)
    maxMI = Math.max(maxMI, MI)

    
    // console.log({attrX, attrY, MI})

    // const MI = attrX == attrY ? 1 : fp.random(0.7, true)
    // resMI



    if (dimension == 0) {
      const cov = attrX == attrY ? contSum2Iter.next() : contDegree2Iter.next()
      return {
        attrX,
        attrY,
        MI,
        dimension,
        // cont + cont => 
        matrix: [[generateMatrixScalar(attrX, attrY, cov.value)]]
      }
    } else if (dimension == 1) {
      // cont_cat_degree2 contains products X*Y where X is cont and Y is cat, row by row;
      let covMatrix = []
      const list = contCatDegree2Iter.next().value
      if (variableInfo[attrY].isCategorical) {
        // x is continuous, y is categorical
        covMatrix = [list.map((e: { x: string, val: number }) => {
          return generateMatrixScalar(attrX, `${attrY}: ${e.x}`, e.val)
        })]
      } else {
        // x is categorical, y is continuous
        covMatrix = [list.map((e: { x: string, val: number }) => {
          return generateMatrixScalar(`${attrX}: ${e.x}`, attrY, e.val)
        })]
      }

      return {
        attrX,
        attrY,
        MI,
        dimension,
        matrix: covMatrix
      }
    } else {
      // dimension == 2
      let covMatrix = []
      // const cov = attrX == attrY ? catSum2Iter.next() : catDegree2Iter.next()
      if (attrX == attrY) {
        const list = catSum2Iter.next().value
        // covMatrix = [list.map((e: { x: string, val: number }) => {
        //   return generateMatrixScalar(e.x, e.x, e.val)
        // })]
        dimension = 1
        covMatrix = [list.map((e: { x: string, val: number }) => {
          return generateMatrixScalar(`${attrX}: ${e.x}`, `${attrX} x ${attrX}`, e.val)
        })]
      } else {
        const list = catDegree2Iter.next().value
        covMatrix = [list.map((e: { x: string, y: string, val: number }) => {
          return generateMatrixScalar(`${attrX}: ${e.x}`, `${attrY}: ${e.y}`, e.val)
        })]
      }

      return {
        attrX,
        attrY,
        MI,
        dimension,
        matrix: covMatrix
      }
    }
  }


  const visitedEdges: { [_: string]: { [_: string]: ModelElement } } = {}
  variables.forEach((v: string) => {
    visitedEdges[v] = {}
  })

  // make it row by row
  // iterate the upper triangle
  const l = []
  for (let i = 0; i < variables.length; i++) {
    for (let j = i; j < variables.length; j++) {
      const v1 = variables[i]
      const v2 = variables[j]

      // console.log({v1, v2})

      const elem = getModelElement(v1, v2)
      visitedEdges[v1][v2] = elem

      if (v1 !== v2) {
        visitedEdges[v2][v1] = {
          ...elem,
          attrX: elem.attrY,
          attrY: elem.attrX,
        }
      }
    }
  }

  const matrix: ModelMatrix = variables.map((varX: string) => {
    return variables.map((varY: string) => {
      // console.log({varX, varY, elem: visitedEdges[varX][varY]})

      const elem = visitedEdges[varX][varY]

      
      elem.MI = varX === varY ? 1 : norm(elem.MI, maxMI, minMI) 
      return elem
    })
  })

  // generate the param matrix
  // let features: string[] = ["inventoryunits",
  // "prize",
  // "categoryCluster",]
  // const label: string = "inventoryunits"

  const contParamsIter = res.cont_params[Symbol.iterator]();
  const catParamsIter = res.cat_params[Symbol.iterator]();

  // remove label from features and add theta 0
  features = ["Bias", ...features.filter(f => f !== label)]

  // const paramMatrix = [features.map(feature => {
  //   let dimension = (feature == "Bias" || !variableInfo[feature].isCategorical) ? 0 : 1;

  //   if (dimension == 0) {
  //     const cov = contParamsIter.next();
  //     return {
  //       attrX: label,
  //       attrY: feature,
  //       MI: 0,
  //       dimension,
  //       // cont + cont => 
  //       matrix: [[generateMatrixScalar(label, feature, cov.value)]]
  //     }
  //   } else {
      
  //     let covMatrix = []
  //     const list = catParamsIter.next().value
  //     console.log({list, dimension})

  //     covMatrix = [list.map((e: { x: string, val: number }) => {
  //       return generateMatrixScalar(label, e.x, e.val)
  //     })]

  //     return {
  //       attrX: label,
  //       attrY: feature,
  //       MI: 0,
  //       dimension,
  //       matrix: covMatrix
  //     }
  //   }
  // })]
  const paramMatrix:[] = []

  console.log({paramMatrix})


  return [ res.tN, resMI.count, variables, matrix, paramMatrix,]

}




