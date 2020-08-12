<style>
.ivu-table td.demo-table-info-column{
        background-color: #066b9971;
        }
.ivu-table td.normal-table-column{
        background-color: #ffff;
        }
.ivu-table td.highlight-table-column{
        background-color: #be611571;
        }
</style>
<template>
  <div>
    <!-- <Row style="margin-bottom: 20px;">
      <Col span="5"><h5>Aggregate Computation Time:</h5></Col>
      <Input width="12" :value="this.aggregateComputationTime" readonly style="width: 150px">
        <span slot="append">seconds</span>
      </Input>
    </Row>
    <Divider style="margin-bottom: 20px;" /> -->
    <!-- <Row style="margin-top: 15px; margin-bottom: 10px;" type="flex" justify="end" :gutter="0">
        <h5>Number of Clusters: </h5>
        <Button @click="clusterPoint" type="primary">Cluster Data Point</Button>
    </Row> -->

    <Row style="margin-top: 20px;">
      <Table max-height="400" border ref="currentRowTable" no-data-text="Run application for data" :columns="applicationData.columns" :data="applicationData.data">
        <template slot-scope="{ row }" slot="name">
          <strong>{{ row.attribute }}</strong>
        </template>
        <template slot-scope="{ row, index }" slot="point">
          <InputNumber
            v-model="row.attValue" 
            :step="row.attStep"
            size="large"
            style="width: 100px;"
            @on-change="handleValue(row, index)"
          />
        </template>
      </Table>
    </Row>

    <Row style="margin-top: 15px; margin-bottom: 10px;" type="flex" justify="end" :gutter="0">
        <Button @click="clusterPoint" type="primary">Cluster Data Point</Button> 
    </Row>

    <Divider style="margin-bottom: 20px;" />

    <Row style="margin-left: 40px; margin-left: 40px;">
      <Col span=6>
        <h5>Aggregate Computation Time</h5>
        <Input width="12" type="number" :value="applicationData.aggComputeTime" readonly style="margin-top: 20px; width: 150px">
         <span slot="append">ms</span>
        </Input>
      </Col>
      <Col span=6>
        <h5>kMeans Computation Time</h5>
        <Input width="12" type="number" :value="applicationData.appComputeTime" readonly style="margin-top: 20px; width: 150px">
         <span slot="append">ms</span>
        </Input>
      </Col>
      <Col span=6>
        <h5>Relative Approximation</h5>
        <Input width="12" :value="this.relativeApproximation" readonly style="margin-top: 20px; width: 150px">
         <span slot="append">%</span>
        </Input>
      </Col>
      <Col span=6>
        <h5>Relative Coreset Size</h5>
        <Input width="12" :value="applicationData.relativeCoresetSize" readonly style="margin-top: 20px; width: 150px">
         <span slot="append">%</span>
        </Input>
      </Col>
    </Row>
  </div>
</template>

<script lang="ts">
import { Component, Watch, Vue } from "vue-property-decorator";

import { applicationData }  from "../data/applicationData"
import { indexOf } from 'lodash';

const _ = require("lodash");

@Component({})
export default class Application extends Vue {

  aggregateComputationTime = "1.02"
  appComputationTime = "1.02"
  relativeApproximation = "1.02"
  coresetSize = "1.02"
  applicationData = {};

  closestCluster = 2

  mounted() {
    this.applicationData = this.$store.state.applicationOutput
  }


  handleValue(row:any, index:number) {
    this.applicationData.data[index].attValue = row.attValue
    console.log(this.applicationData.data.map((f) => f.attValue));
  }

  computeDistance()
  {
    var distances = Array(this.applicationData.columns.length - 2).fill(0);
    for (var i = 0; i < this.applicationData.data.length; i++) 
    {
      var dpoint = this.applicationData.data[i];
  
      var c = 0
      for (const property in dpoint) {
        c += 1
        if (c < 4) continue; 

        var difference = dpoint.attValue - dpoint[property]; 

        console.log(`${property}: ${dpoint[property]}`);
        distances[c-4] += difference * difference
      }
    }

    var minIndex = distances.indexOf(Math.min(...distances));
    console.log(distances, minIndex);

    return minIndex + 2
  }

  clusterPoint()
  {
    console.log("click cluster point" + this.closestCluster)
    for (var i = 2; i < this.applicationData.columns.length; i++) 
      this.applicationData.columns[i].className = "normal-table-column";
    
    this.closestCluster = this.computeDistance();

    this.applicationData.columns[this.closestCluster].className = "highlight-table-column";
  }

}
</script>
