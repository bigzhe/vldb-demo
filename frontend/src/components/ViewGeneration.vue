<template>
  <div>
    <Row>
      <h4>Join Tree</h4>
      <div style="border: 1px solid gray" id="joinTree"></div>
    </Row>
    <br />
    <Row :gutter="20">
      <Col span="12">
        <h4 style="display: inline-block;">Output Queries</h4> 
        <span style="float:right; margin-right: 20px; margin-top: 7px">(Right-click the queries to change their root)</span>
        <div :style="`border: 1px solid gray; padding: 5px; height: ${boxHeight}px; overflow-y: scroll;`">
          <div style="margin-top: 5px" :key="relation.id" v-for="relation in joinTreeD3.relations">
            <h5>{{relation.name}}</h5>
            <hr style="margin-top: 5px; margin-bottom: 5px;" />
            <Tree empty-text="No Queries" :data="outputQueries[relation.name]" @on-contextmenu="handleContextMenu">
              <template slot="contextMenu">
                <DropdownItem
                  :key="relation.id"
                  v-for="relation in joinTreeD3.relations"
                  @click.native="changeRoot(relation.name)"
                >{{relation.name}}</DropdownItem>
              </template>
            </Tree>
          </div>
        </div>
      </Col>
      <Col span="12">
        <h4>Intermediate Views</h4>
        <div style="border: 1px solid gray; padding: 5px; height: ${boxHeight}px; overflow-y: scroll;">
          <div v-if="selectedEdge.source">
            <h5>{{selectedEdge.source}} to {{selectedEdge.target}}</h5>
            <hr style="margin-top: 5px; margin-bottom: 5px;" />
            <Tree :data="intermediateViews"></Tree>
          </div>
          <div v-else>Click the arrows to inspect the intermediate views</div>
        </div>
      </Col>
    </Row>
    <br />
    <Row style="margin-bottom: 10px;"  >
      <Col span="12" justify="end">
        <Row type="flex" justify="end" style="margin-right: 40px;">
        <Button @click="regenerateViews" type="primary">Regenerate Views</Button>
        </Row>
      </Col>
      <Col span="12">
        <Row type="flex" justify="end" style="margin-right: 40px;">
        <Button @click="groupViews" type="primary">Group Views</Button>
        </Row>
      </Col>
    </Row>
  </div>
</template>

<script lang="ts">
import { Component, Watch, Vue } from "vue-property-decorator";

// import data
// import { joinTreeD3 } from "../data/joinTree";

// import the visualization function -- d3
import showJoinTree from "../util/d3/showJoinTree";

const _ = require("lodash");

const dumbEdge = {
  source: "",
  target: "",
  views: [],
};

@Component({})
export default class Dataset extends Vue {
  // data
  selectedRelation: string = "";
  selectedEdge: { source: string; target: string; views: string[] } = dumbEdge;
  joinTreeD3 = {};
  contextData: any = {};
  boxHeight:number = (window.innerHeight || document.documentElement.clientHeight || document.body.clientHeight) - 500;

  mounted() {
    this.joinTreeD3 = this.$store.state.joinTreeD3
    this.renderD3();
  }

  get intermediateViews() {
    return this.selectedEdge.views.map((view) => {
      return this.joinTreeD3.views.find((v) => v.name == view);
    });
  }

  get outputQueries() {
    return _.groupBy(this.joinTreeD3.queries, "root");
  }

  // http://localhost:8081/regen/[0,1,2,1,3,4,4,3]
  regenerateViews() {
    const self = this;
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
        // console.log("request sent");
        self.joinTreeD3 = self.$store.state.joinTreeD3
        self.renderD3();
      },
    });
  }

  relationClicked(relationId: string) {
    console.log({ relationId });
    this.selectedRelation = relationId;
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

  changeRoot(root: string) {
    const changedQuery = this.contextData;
    console.log(root);

    this.joinTreeD3.queries = this.joinTreeD3.queries.map((query) => {
      if (query.name === changedQuery.name) {
        return {
          ...changedQuery,
          root,
        };
      } else {
        return query;
      }
    });

    // console.log(joinTreeD3)
  }

  groupViews() {
    this.$store.commit("SET_TAB", "viewGroups");
  }

  renderD3() {
    showJoinTree(
      this.joinTreeD3,
      "joinTree",
      this.transitionClicked,
      this.relationClicked
    );
  }
}
</script>

<style>
.ivu-form-item {
  margin-bottom: 0px;
}

.links line {
  stroke: #999;
  stroke-opacity: 0.6;
}

#joinTree .links line {
  cursor: pointer;
}

.nodes circle {
  stroke: #fff;
  stroke-width: 1.5px;
}

#dependencyGraph .nodes circle {
  cursor: pointer;
}

text {
  font-family: sans-serif;
  font-size: 10px;
}
</style>