<template>
  <div>
    <Row :gutter="20">
      <Col span="12">
        <h4>Mutual Information</h4>
        <div width="100%" height="100%" style="border: 1px solid gray; width: 100%; height: 100%;" id="mi_matrix_vis"></div>
      </Col>
      <Col span="12">
        <h4>Current Chow-Liu Tree</h4>
        <div width="100%" height="100%" style="border: 1px solid gray; width: 100%; height: 100%;" id="chow_liu_tree_vis"></div>
        <!-- <br>
        <h4>Previous Chow-Liu Tree</h4>
        <div width="100%" height="50%" style="border: 1px solid gray; width: 100%; height: 50%;" id="chow_liu_tree_vis2"></div> -->
      </Col>
    </Row>
  </div>
</template>

<script lang="ts">
import { Component, Watch, Vue } from "vue-property-decorator";
import "../util/ArrayExtensions";
import {
  // RetailerMatrix,
  getMIFlatArray,
  // variables
} from "../data/RetailerMatrix";

import {
  updateMathContent,
  tex2svg,
  enable_svg_zoom
} from "../util/updateMath";
import Node from "../util/Node";

import showMIMatrix from "../util/d3/showMIMatrix"
import showChowLiuTree from "../util/d3/showChowLiuTree"

import { ModelMatrix } from "../types/Model"

@Component({})
export default class Dataset extends Vue {
  // data
  // variables: string[] = variables;
  // root: string = "inventoryunits"

  previousMatrix?: ModelMatrix = undefined

  get variables(): string[] {
    return this.$store.state.variables
  }

  get matrix(): ModelMatrix {
    return this.$store.state.matrix
  }

  get root(): string {
    return this.$store.state.label
  }

  mounted() {
    updateMathContent();
    this.renderD3();
  }

  renderD3() {
    showMIMatrix(this.variables, getMIFlatArray(this.matrix))
    if (!this.previousMatrix) {
      showChowLiuTree(this.variables, this.matrix, this.root, 'chow_liu_tree_vis')
    } else {
      showChowLiuTree(this.variables, this.matrix, this.root, 'chow_liu_tree_vis')
      // showChowLiuTree(this.variables, this.previousMatrix, this.root, 'chow_liu_tree_vis2')
    }

    this.previousMatrix = JSON.parse(JSON.stringify(this.matrix));


    // showChowLiuTree(this.variables, this.matrix, this.root, 'chow_liu_tree_vis')
    // showChowLiuTree(this.variables, this.matrix, this.root, 'chow_liu_tree_vis2')
  }


}
</script>

<style>

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