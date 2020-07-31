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
        <div style="border: 1px solid gray; padding: 5px">
          <div v-if="selectedGroup.group">
            <h5>{{selectedGroup.group}}</h5>
            <hr style="margin-top: 5px; margin-bottom: 5px;" />
            <Tree :data="intermediateViews"></Tree>
          </div>
          <div v-else>Click the groups to inspect the intermediate views</div>
        </div>
      </Col>
    </Row>
    <br />
    <Row style="margin-bottom: 10px;" :gutter="20">
      <Col span="12">
      </Col>
      <Col span="12">
        <Button @click="generateCode" type="primary">Generate Code</Button>
      </Col>
    </Row>
  </div>
</template>

<script lang="ts">
import { Component, Watch, Vue } from "vue-property-decorator";

// import data
import { joinTreeD3 } from "../data/joinTree";

// import the visualization function -- d3
import showJoinTree from "../util/d3/showJoinTree";
import showDependencyGraph from "../util/d3/showDependencyGraph";

const _ = require("lodash");

const dumbEdge = {
  source: "",
  target: "",
  views: [],
};

@Component({})
export default class Dataset extends Vue {
  // data
  selectedGroup: any = {
    group: "",
    views: []
  }
  selectedEdge: { source: string; target: string; views: string[] } = dumbEdge;
  joinTreeD3 = joinTreeD3;
  contextData: any = {};

  mounted() {
    this.renderD3();
  }

  get intermediateViews() {
    return this.selectedGroup.views.map((view) => {
      return this.joinTreeD3.views.find((v) => v.name == view);
    });
  }

  get outputQueries() {
    return _.groupBy(joinTreeD3.queries, "root");
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

  relationClicked(group: string, views: any[]) {
    console.log({ group, views }, 'clicked');
    this.selectedGroup = {
      group,
      views,
    }
  }

  transitionClicked(source: string, target: string) {
    this.selectedEdge =
      joinTreeD3.links.find(
        (edge) => edge.source == source && edge.target == target
      ) || dumbEdge;
    console.log(this.selectedEdge);
  }

  handleContextMenu(data: any) {
    this.contextData = data;
  }

  generateCode() {
    this.$store.commit("SET_TAB", "generateCode");
  }

  renderD3() {
    showDependencyGraph(
      joinTreeD3,
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