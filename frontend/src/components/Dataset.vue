<template>
  <div>
    <Row>
      Dataset:
      <Select
        placeholder="Please select a dataset"
        v-model="selected_dataset_name"
        style="width:200px"
      >
        <OptionGroup :key="i" v-for="(category, i) in dataset_categories" :label="category">
          <Option
            v-for="(d,i) in dataset.filter(d => d.category == category)"
            :value="d.name"
            :key="i"
          >{{ d.name }}</Option>
        </OptionGroup>
      </Select>
    </Row>
    <!-- <br> -->

    <Divider></Divider>

    <QueryText :Q="Q" />

    <img v-if="Q" width="50%" src="../assets/retailerER.jpg" alt="">

    <!-- <div style="margin-top: 5px;">{{query_text}}</div> -->

    <!-- <Row
      style="margin-top: 5px; margin-bottom: 5px; border-bottom: 1px solid #e9e9e9;"
      :key="relation.name"
      v-for="relation in
    query.relations"
    >
      <div>
        <Checkbox
          :indeterminate="relation.indeterminate"
          :value="relation.checkAll"
          @click.prevent.native="handleCheckAll(relation)"
        >
          <strong>{{relation.name}}</strong>
        </Checkbox>
      </div>
      <CheckboxGroup
        v-model="relation.selected_variables"
        @on-change="checkAllGroupChange(relation)"
      >
        <Checkbox :key="variable" v-for="variable in relation.variables" :label="variable"></Checkbox>
      </CheckboxGroup>
    </Row> -->

    <div style="margin-top: 10px">
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

import QueryText from "./QueryText/QueryText.vue"

@Component({
  components: {
    QueryText
  }
})
export default class Dataset extends Vue {
  // data
  Q: Query | null = null
  selected_dataset_name: string | null = null;
  query_text?: string;
  query: QueryInfo = {
    name: "",
    relations: [],
    free_variable_relation: { name: "Free variables", variables: [] }
  };
  

  get dataset(): {
    name: string;
    category: string;
    relations: RelationInfo[];
  }[] {
    return this.$store.state.dataset;
  }

  get dataset_categories() {
    return this.dataset.map(d => d.category).unique();
  }

  get_query_text(): string {
    if (!this.query || !this.query.free_variable_relation.selected_variables)
      return "";
    
    return (
      `Q_${
        this.query.name
      }(${this.query.free_variable_relation.selected_variables.join(", ")})` +
      ` = ${this.query.relations
        .filter(r => r.selected)
        .map(
          r =>
            `${r.name}(${
              r.selected_variables != undefined
                ? r.selected_variables.join(", ")
                : ""
            })`
        )
        .join(", ")}`
    );
  }

  @Watch("selected_dataset_name", { immediate: true, deep: true })
  onNameChanged(name: string) {
    // console.log(name)
    if (name == null) return;
    const selected_dataset = this.dataset.find(d => d.name == name);
    if (!selected_dataset) return;

    this.query = {
      name: selected_dataset.name,
      relations: selected_dataset.relations.map((relation: RelationInfo) => {
        return {
          ...relation,
          selected_variables: [...relation.variables],
          selected: true,
          indeterminate: false,
          checkAll: true
        };
      }),
      free_variable_relation: {
        ...this.query.free_variable_relation,
        variables: selected_dataset.relations
          .map((r: RelationInfo) => r.variables)
          .flat()
          .unique(),
        selected_variables: [],
        selected: true,
        indeterminate: false,
        checkAll: false
      }
    };

    this.query_text = this.get_query_text()
    this.Q = parse_query_text(this.query_text)

  }

  handleNext() {
    // this.$store.commit("SET_QUERY_INFO", this.query);
    const self = this
    this.$store.commit("SET_QUERY", this.Q);
    this.$store.commit("SET_QUERY_TEXT", this.query_text);

    this.$store.dispatch('processNextBatch', function() {
      // after fetched

      self.$store.commit("SET_TAB", "modelSelection");    

    })

    


  }
}
</script>

