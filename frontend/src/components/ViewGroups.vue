<template>
  <div>
    <Row>
      <h4>Dependency Graph</h4>
      <div style="border: 1px solid gray" id="dependencyGraph"></div>
    </Row>
    <br />
    <Row :gutter="20">
      <Col span="24">
        <h4>View Group</h4>
        <div style="border: 1px solid gray; padding: 5px; height: ${boxHeight}px; overflow-y: scroll;">
          <div v-if="selectedGroup.id">
            <!-- <h5>{{selectedGroup.group}}</h5> -->
            <h5> {{selectedGroup.id}} is computed over Relation {{ selectedGroup.base }} </h5> 
            <hr style="margin-top: 5px; margin-bottom: 5px;" />
            <Tree :data="intermediateViews"></Tree>
          </div>
          <div v-else>Click the groups to inspect the intermediate views</div>
        </div>
      </Col>
    </Row>
    <br />
    <Row style="margin-bottom: 10px;" type="flex" justify="end" :gutter="0">
        <Button @click="generateCode" type="primary">Generate Code</Button>
    </Row>
  </div>
</template>

<script lang="ts">
import { Component, Watch, Vue } from "vue-property-decorator";

// import data
// import { joinTreeD3 } from "../data/joinTree";

// import the visualization function -- d3
import showJoinTree from "../util/d3/showJoinTree";
import showDependencyGraph from "../util/d3/showDependencyGraph";

const _ = require("lodash");

const dumbEdge = {
  source: "",
  target: "",
  views: [],
};

const dumbNode = {
    id: "",
    base: "",
    views: [""],
  };

@Component({})
export default class Dataset extends Vue {
  // data
  selectedGroup: { id: string; base: string; views: string[] } = dumbNode
  selectedEdge: { source: string; target: string; views: string[] } = dumbEdge;
  joinTreeD3 = {};
  contextData: any = {};
  boxHeight:number = (window.innerHeight || document.documentElement.clientHeight || document.body.clientHeight) - 500;

  mounted() {
    this.joinTreeD3 = this.$store.state.joinTreeD3
    this.renderD3();
  }

  get intermediateViews() {
    return this.selectedGroup.views.map((view: string) => {
      return this.joinTreeD3.views.find((v) => v.name == view);
    });
  }

  get outputQueries() {
    return _.groupBy(this.joinTreeD3.queries, "root");
  }

  // http://localhost:8081/regen/[0,1,2,1,3,4,4,3]
  regenerateViews() {
    const rootIndicators = this.joinTreeD3.queries.map((query) => {
      const root = query.root;
      const idx = this.joinTreeD3.relations.findIndex((r) => r.name == root);
      return idx === -1 ? -1 : this.joinTreeD3.relations[idx].id;
    });

    console.log(
      `Sending request http://localhost:8081/regen/${rootIndicators}`
    );

    this.$store.dispatch("regenerateViews", {
      rootIndicators,
      onSuccess: function () {
        // on success
        console.log("request sent");
      },
    });
  }

  relationClicked(groupID: string) {
    console.log({ groupID }, 'clicked');
    this.selectedGroup = this.joinTreeD3.groupNodes.find((g) => g.id == groupID) || dumbNode;
  }

  transitionClicked(source: string, target: string) {
    this.selectedEdge =
      this.joinTreeD3.links.find(
        (edge) => edge.source == source && edge.target == target
      ) || dumbEdge;
    console.log(this.selectedEdge);
  }

  handleContextMenu(data: any) {
    this.contextData = data;
  }

  generateCode() {
    const self = this;
    this.$store.dispatch("generateCode", {
      onSuccess: function () {
        // on success
        // console.log("request sent");
        self.$store.commit("SET_TAB", "codeGeneration");
      },
    });
    
  }

  renderD3() {
    showDependencyGraph(
      this.joinTreeD3,
      "dependencyGraph",
      this.transitionClicked,
      this.relationClicked
    );
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