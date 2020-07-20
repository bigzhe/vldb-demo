<template>
  <div>
    <Row>
      <p>Features: {{features.join(', ')}}</p>
      <p>Label: {{label}}</p>
    </Row>
    <br>
    <Row :gutter="20">
      <Col span="10">
        <h4>Covariance Matrix</h4>
        <p></p>
        <div style="border: 1px solid gray" id="cov_matrix_vis"></div>
      </Col>
      <Col span="6">
        <h4>Params</h4>
        <div style="border: 1px solid gray" id="lr_vis"></div>
      </Col>
      <Col span="5">
        <h4>Input</h4>
        <Form label-position="left" :label-width="120">
          <FormItem :key="param.attrY" v-for="(param,i) in paramMatrix[0]" :label="param.attrY">
            <InputNumber v-if="param.dimension == 0" :min="0" :step="0.1" v-model="predictInput[i]" :disabled="i == 0"></InputNumber>
            <Select v-else v-model="predictInput[i]" placeholder="Please select the value">
                <Option :key="j" v-for="(o,j) in param.matrix[0]" :value="parseInt(o.yValue)">{{o.yValue}}</Option>
            </Select>
          </FormItem>
          <FormItem>
              <Button @click="predict" type="primary">Predict</Button>
              <Button style="margin-left: 5px" @click="test">Fill tuple</Button>
          </FormItem>
      </Form>
      </Col>
      <Col span="3">
        <h4>Prediction</h4>
        <div>{{predictResult}}</div>
        <br>
        <h4>Ground Truth</h4>
        <div>{{truthResult}}</div>
      </Col>
    </Row>
  </div>
</template>

<script lang="ts">
import { Component, Watch, Vue } from "vue-property-decorator";
import "../util/ArrayExtensions";
import {
  // RetailerMatrix,
  getCovArray,
  getMIFlatArray,
  getLinearRegressionArray,
  // variables
} from "../data/RetailerMatrix";

import { ModelMatrix } from "../types/Model"

import showCovMatrix from "../util/d3/showCovMatrix";
import showLinearRegression from "../util/d3/showLinearRegression"

@Component({})
export default class Dataset extends Vue {
  // data
  // features: string[] = ["ksn", "price", "subcategory", "category", "categoryCluster"];
  // label: string = "inventoryunits"

  // variables: string[] = variables;
  predictInput: number[] = [];
  predictResult: string = "";
  truthResult: string = "";

  get variables(): string[] {
    return this.$store.state.variables
  }

  get matrix(): ModelMatrix {
    return this.$store.state.matrix
  }

  get paramMatrix(): ModelMatrix {
    return this.$store.state.paramMatrix
  }
  
  get features() : string[] {
    return this.$store.state.features
  }

  get label() : string {
    return this.$store.state.label
  }

  mounted() {
    // console.log(this.matrix)
    if (this.matrix.length === 0) {
      return
    }
    this.renderD3();

    // console.log(RetailerMatrix)
    // console.log(variables)
  }

  predict() {
    let result = 0;
    const params = this.paramMatrix[0] || []
    params.forEach((param, i) => {
      if (param.dimension == 0) {
        result += this.predictInput[i] * param.matrix[0][0].COVAR
      } else {
        const COVAR = param.matrix[0].find(v => parseInt(v.yValue) == this.predictInput[i]).COVAR
        result += COVAR
      }
    })
    // console.log(result)
    this.predictResult = `${result}`
    this.truthResult = `${21}`
  }

  renderD3() {
    showCovMatrix([...this.features, this.label], getCovArray(this.matrix, [...this.features, this.label]))

    showLinearRegression(['Bias', ...this.features], this.label, getMIFlatArray(this.paramMatrix))

    // prepare the predict input
    this.predictInput = this.paramMatrix[0].map(x => 0)
    this.predictInput[0] = 1

    console.log(this.paramMatrix)
    // showLinearRegression(this.features, this.label, getLinearRegressionArray(this.matrix, this.variables, this.features, this.label))

  }

  test() {
    
    this.predictInput[1] = 2.99
    this.predictInput[2] = 14
    this.predictInput[3] = 15
    this.predictInput[4] = 106
    this.predictInput = [...this.predictInput]
    console.log("hello", this.predictInput)
  }


}
</script>

<style >
.ivu-form-item {
  margin-bottom: 0px;
}
</style>