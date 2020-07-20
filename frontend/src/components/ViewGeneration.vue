<template>
  <div>
    <Row>
      <h4>Join Tree</h4>
      <div style="border: 1px solid gray" id="joinTree"></div>
    </Row>
    <br />
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

// import data
import { joinTreeD3 } from "../data/joinTree";

// import the visualization function -- d3 
import showJoinTree from "../util/d3/showJoinTree"

// import { ModelMatrix } from "../types/Model";

// import showCovMatrix from "../util/d3/showCovMatrix";
// import showLinearRegression from "../util/d3/showLinearRegression";

@Component({})
export default class Dataset extends Vue {
  // data
  // predictInput: number[] = [];
  // predictResult: string = "";
  // truthResult: string = "";

  // get label(): string {
  //   return this.$store.state.label;
  // }

  mounted() {

    this.renderD3();
    console.log(joinTreeD3)
  }

  renderD3() {
    showJoinTree(joinTreeD3, 'joinTree')
    // showCovMatrix(
    //   [...this.features, this.label],
    //   getCovArray(this.matrix, [...this.features, this.label])
    // );

  }

}
</script>

<style >
.ivu-form-item {
  margin-bottom: 0px;
}

.links line {
  stroke: #999;
  stroke-opacity: 0.6;
}

.nodes circle {
  stroke: #fff;
  stroke-width: 1.5px;
}

text {
  font-family: sans-serif;
  font-size: 10px;
}

</style>