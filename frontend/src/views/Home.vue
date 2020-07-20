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

    <Dataset ref="dataset"></Dataset>
    <!-- <ModelSelection ref="modelSelection" v-if="tab == 'modelSelection'"></ModelSelection>
    <Regression ref="regression" v-else-if="tab == 'regression'"></Regression>
    <ChowLiuTree ref="clt" v-else-if="tab == 'clt'"></ChowLiuTree>
    <StaticStrategy ref="strategy" v-else-if="tab == 'strategy'"></StaticStrategy>
    <Dataset ref="dataset" v-else-if="tab == 'dataset'"></Dataset> -->

    <br />
    <br />

    <!-- <BackTop :height="0" :bottom="20" :right="20">
        <div @click="nextBatch" class="top">Process Updates</div>
    </BackTop>-->
  </div>
</template>

<script>
import Dataset from "../components/Dataset.vue";
// import ChowLiuTree from "../components/ChowLiuTree";
// import ComputationalModel from "../components/ComputationalModel";
// import ModelSelection from "../components/ModelSelection";
// import Regression from "../components/Regression";
// import StaticStrategy from "../components/StaticStrategy";
// import About from "../components/About";

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
    // StaticStrategy,
    // ModelSelection,
    // ChowLiuTree,
    // Regression,
  },
  mounted: function() {

  },
  methods: {
    handleClick(newTab) {
      // console.log(newTab)
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