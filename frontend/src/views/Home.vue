<template>
  <div style="margin-top: 00px" class="container-fluid">
    <Tabs @on-click="handleClick" style="margin-bottom: 0;">
      <TabPane label="Input" name="dataset"></TabPane>
      <TabPane label="View Generation" name="viewGeneration"></TabPane>
      <TabPane label="View Groups" name="viewGroups"></TabPane>
      <TabPane label="Code Generation" name="codeGeneration"></TabPane>
      <TabPane label="Application" name="application"></TabPane>
    </Tabs>
    <br />

    <ViewGeneration ref="viewGeneration" v-if="tab == 'viewGeneration'"></ViewGeneration>
    <Dataset ref="dataset" v-else-if="tab == 'dataset'"></Dataset>
    <ViewGroups ref="viewGroups" v-else-if="tab == 'viewGroups'"></ViewGroups>
    <CodeGeneration ref="codeGeneration" v-else-if="tab == 'codeGeneration'"></CodeGeneration>
    <Application ref="application" v-else-if="tab == 'application'"></Application>

  </div>
</template>

<script>
import Dataset from "../components/Dataset.vue";
import ViewGeneration from "../components/ViewGeneration";
import ViewGroups from "../components/ViewGroups";
import CodeGeneration from "../components/CodeGeneration";
import Application from "../components/Application";

export default {
  name: "home",
  data() {
    return {
      // tab: "dataset"
      interval: null,
      processingStatus: "pause",
      previousCount: 0
    };
  },
  components: {
    Dataset,
    ViewGeneration,
    ViewGroups,
    CodeGeneration,
    Application,
  },
  mounted: function() {

  },
  methods: {
    handleClick(newTab) {
      this.$store.commit("SET_TAB", newTab);
    },
  },
  computed: {
    tab: function() {
      return this.$store.state.tab;
    },
  }
};
</script>
<style scoped>
.top {
  padding: 10px;
  background: rgba(0, 153, 229, 0.7);
  color: #fff;
  text-align: center;
  border-radius: 2px;
}
</style>

<style>
.ivu-tabs-bar {
  /* border-bottom: 1px solid #dcdee2; */
  margin-bottom: 0px;
}
</style>