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
        <div style="border: 1px solid gray">
          {{selectedRelation}}
        </div>
      </Col>
      <Col span="12">
        <h4>Intermediate Views</h4>
        <div style="border: 1px solid gray; padding: 5px">
          <div v-if="selectedEdge.source">
            <h5>{{selectedEdge.source}} to {{selectedEdge.target}}</h5>
            <hr style="margin-top: 5px; margin-bottom: 5px;">
            <p :key="i" v-for="(view,i) in selectedEdge.views">
              {{joinTreeD3.views[view]}}
            </p>
          </div>
        </div>
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

const dumbEdge = {
    source: "",
    target: "",
    views: [],
  }

@Component({})
export default class Dataset extends Vue {
  // data
  selectedRelation: string = ""
  selectedEdge: {source: string, target: string, views: string[]} = dumbEdge
  joinTreeD3 = joinTreeD3

  mounted() {
    this.renderD3();
    console.log(joinTreeD3)
  }

  relationClicked(relationId: string) {
    console.log({relationId})
    this.selectedRelation = relationId
  }

  transitionClicked(source: string, target: string) {
    this.selectedEdge = joinTreeD3.links.find(edge => edge.source == source && edge.target == target) || dumbEdge
    console.log(this.selectedEdge)
  }

  renderD3() {
    showJoinTree(joinTreeD3, 'joinTree', this.transitionClicked, this.relationClicked)
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