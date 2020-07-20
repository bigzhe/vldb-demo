<template>
  <div>
    <Row>
      <h4>Join Tree</h4>
      <div style="border: 1px solid gray" id="joinTree"></div>
    </Row>
    <br>
    <Row :gutter="20">
      <Col span="12">
        <h4>Output Queries</h4>
        <div style="border: 1px solid gray" id="outputQueries"></div>
      </Col>
      <Col span="12">
        <h4>Intermediate Views</h4>
        <div style="border: 1px solid gray" id="intermediateViews"></div>
      </Col>
    </Row>
  </div>
</template>

<script lang="ts">
import { Component, Watch, Vue } from "vue-property-decorator";
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