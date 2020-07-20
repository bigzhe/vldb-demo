<template>
  <div style="margin-top: 00px" class="container-fluid">
    <Tabs @on-click="handleClick" style="margin-bottom: 0;">
        <TabPane label="Input" name="dataset"></TabPane>
      <TabPane label="Model Selection" name="modelSelection"></TabPane>
      <TabPane label="Regression" name="regression"></TabPane>
      <TabPane label="Chow-Liu Tree" name="clt"></TabPane>
      <TabPane label="Strategy" name="strategy"></TabPane>
    </Tabs>
    <br />

    <!-- Control panel -->
    <div v-if="tab !== 'dataset' && tab !== 'strategy' && tab !== 'about'">
      <Button @click="nextBatch(true)">Process 1000 Updates</Button>
      <!-- Processing Tuples: -->
      <RadioGroup
        style="margin-left: 5px"
        @on-change="statusChange"
        v-model="processingStatus"
        type="button"
      >
        <Radio label="play">
          <Icon type="md-play" />
        </Radio>
        <Radio label="pause">
          <Icon type="md-pause" />
        </Radio>
      </RadioGroup>

      <span style="margin-left: 10px">Processed {{tN}} tuples</span>
      <br />
      <br>
    </div>

    <!-- <About ref="about" v-if="tab == 'about'"></About> -->
    <ModelSelection ref="modelSelection" v-if="tab == 'modelSelection'"></ModelSelection>
    <Regression ref="regression" v-else-if="tab == 'regression'"></Regression>
    <ChowLiuTree ref="clt" v-else-if="tab == 'clt'"></ChowLiuTree>
    <StaticStrategy ref="strategy" v-else-if="tab == 'strategy'"></StaticStrategy>
    <Dataset ref="dataset" v-else-if="tab == 'dataset'"></Dataset>

    <br />
    <br />

    <!-- <BackTop :height="0" :bottom="20" :right="20">
        <div @click="nextBatch" class="top">Process Updates</div>
    </BackTop>-->
  </div>
</template>

<script>
import Dataset from "../components/Dataset.vue";
import ChowLiuTree from "../components/ChowLiuTree";
import ComputationalModel from "../components/ComputationalModel";
import ModelSelection from "../components/ModelSelection";
import Regression from "../components/Regression";
import StaticStrategy from "../components/StaticStrategy";
import About from "../components/About";

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
    StaticStrategy,
    ModelSelection,
    ChowLiuTree,
    Regression,
  },
  mounted: function() {
    const self = this;
    this.$store.dispatch('processNextBatch', function() {
      // after fetched

      self.$store.commit("SET_TAB", "clt");    

    })
  },
  methods: {
    handleClick(newTab) {
      // console.log(newTab)
      this.$store.commit("SET_TAB", newTab);
    },
    nextBatch(force) {
      const self = this;
      this.$store.dispatch("processNextBatch", function() {
        // after fetched

        if (force || self.previousCount !== self.$store.state.count) {
          self.$refs[self.tab].renderD3();
          self.previousCount = self.$store.state.count;
          console.log(`Count: ${self.$store.state.count}`);
        }

        // self.$Message.success(`Count: ${self.$store.state.count}`)
      });
    },
    statusChange(status) {
      if (status === "play") {
        this.startProcessing();
      } else {
        this.pauseProcessing();
      }
    },
    startProcessing() {
      const self = this;
      this.interval = setInterval(() => {
        self.nextBatch();
      }, 250);
      self.$store.commit("SET_PROCESSING", true);
    },
    pauseProcessing() {
      clearInterval(this.interval);
      this.$store.commit("SET_PROCESSING", false);
    }
  },
  computed: {
    tab: function() {
      return this.$store.state.tab;
    },
    tN: function() {
      return this.$store.state.tN;
    }
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