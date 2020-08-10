<template>
  <div>
    <Row>
      <Col span="2"><h5>Dataset:</h5></Col>
      <Col span="20">
        <Select
          placeholder="Please select a dataset"
          v-model="selected_dataset_name"
          style="width:200px"
        >
        <Option
          v-for="(d,i) in schemaTree.datasets"
          :value="d.name"
          :key="i"
        >{{ d.name }}</Option>
        </Select>
      </Col>
    </Row>
    <Row style="margin-top: 20px">
      <Col span="2"><h5>Model:</h5></Col>
      <Col span="20">
        <Select placeholder="Please select a model" v-model="selected_model" style="width:200px">
          <Option :value="'reg'" key="reg">Linear Regression</Option>
          <Option :value="'rtree'" key="rtree">Regression Tree</Option>
          <Option :value="'kmeans'" key="kmeans">kMeans</Option>
        </Select>
      </Col>
    </Row>
    <Row style="margin-top: 20px">
    <h4>Schema</h4>
    <div style="border: 1px solid gray; padding: 5px">
      <Scroll>
      <div v-if="selected_dataset_name">
        <h5>{{selected_dataset_name}}</h5>
        <hr style="margin-top: 5px; margin-bottom: 5px;" />
        <Tree :data="schemaView"></Tree>
      </div>
      <div style="margin-left: 10px" v-else>Select a dataset to inspect its schema</div>
      </Scroll>
    </div>
    </Row>

    <!-- <div v-if="Q">
      <br />
      <QueryText :Q="Q" />
    </div> -->

    <div style="margin-top: 20px">
      <Button type="primary" @click="handleNext">Next</Button>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Watch, Vue } from "vue-property-decorator";
import { RelationInfo, QueryInfo } from "../types/Query";
import { parse_query_text } from "../util/Query";
import Query from "../util/Query";
import "../util/ArrayExtensions";

import QueryText from "./QueryText/QueryText.vue";

// import data
import { schemaTree } from "../data/schemaTree";


@Component({
  components: {
    QueryText,
  },
})

export default class Dataset extends Vue {
  // data
  Q: Query | null = null;
  selected_dataset_name: string | null = null;
  selected_model: string = "";
  query_text?: string;
  schemaTree = schemaTree;

  query: QueryInfo = {
    name: "",
    relations: [],
    free_variable_relation: { name: "Free variables", variables: [] },
  };

  // get dataset(): {
  //   name: string;
  //   category: string;
  //   relations: RelationInfo[];
  // }[] {
  //   return this.$store.state.dataset;
  // }
  // get dataset_categories() {
  //   return this.dataset.map((d) => d.category).unique();
  // }

  get schemaView() {
    const datasetList = this.schemaTree.datasets.find((d) => this.selected_dataset_name == d.name);
    if (!datasetList) return this.schemaTree.relations;

    return datasetList.relations.map((rel) => {
      return this.schemaTree.relations.find((r) => r.name == rel);
    });
    // return this.schemaTree.relations 
  }

  handleNext() {
    // this.$store.commit("SET_QUERY_INFO", this.query);
    const self = this;
    // this.$store.commit("SET_QUERY", this.Q);
    // this.$store.commit("SET_QUERY_TEXT", this.query_text);

    console.log(
      `Sending request http://localhost:8081/init/${this.selected_dataset_name.toLowerCase()},${this.selected_model}`
    );

    this.$store.dispatch("init", {
      dataset: this.selected_dataset_name,
      model: this.selected_model,
      onSuccess: function () {
        // after fetched

        self.$store.commit("SET_TAB", "viewGeneration");
      },
    });
  }

  // get_query_text(): string {
  //   if (!this.query || !this.query.free_variable_relation.selected_variables)
  //     return "";
  //   return (
  //     `Q_${
  //       this.query.name
  //     }(${this.query.free_variable_relation.selected_variables.join(", ")})` +
  //     ` = ${this.query.relations
  //       .filter((r) => r.selected)
  //       .map(
  //         (r) =>
  //           `${r.name}(${
  //             r.selected_variables != undefined
  //               ? r.selected_variables.join(", ")
  //               : ""
  //           })`
  //       )
  //       .join(", ")}`
  //   );
  // }
  // @Watch("selected_dataset_name", { immediate: true, deep: true })
  // onNameChanged(name: string) {
  //   // console.log(name)
  //   if (name == null) return;
  //   const selected_dataset = this.dataset.find((d) => d.name == name);
  //   if (!selected_dataset) return;

  //   this.query = {
  //     name: selected_dataset.name,
  //     relations: selected_dataset.relations.map((relation: RelationInfo) => {
  //       return {
  //         ...relation,
  //         selected_variables: [...relation.variables],
  //         selected: true,
  //         indeterminate: false,
  //         checkAll: true,
  //       };
  //     }),
  //     free_variable_relation: {
  //       ...this.query.free_variable_relation,
  //       variables: selected_dataset.relations
  //         .map((r: RelationInfo) => r.variables)
  //         .flat()
  //         .unique(),
  //       selected_variables: [],
  //       selected: true,
  //       indeterminate: false,
  //       checkAll: false,
  //     },
  //   };
  //   this.query_text = this.get_query_text();
  //   this.Q = parse_query_text(this.query_text);
  // }
}
</script>

