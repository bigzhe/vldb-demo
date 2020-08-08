<template>
  <div>
    <Row style="margin-bottom: 20px;">
      <Col span="6">
        <h5>Aggregate Computation Time:</h5>
      </Col>
      <Col span="12">Aggregate Computation Time:</Col>
    </Row>
    <Divider style="margin-bottom: 20px;" />
    <Row style="margin-top: 20px;">
      <Table highlight-row border ref="currentRowTable" :columns="columns1" :data="data1">
        <template slot-scope="{ row }" slot="name">
          <strong>{{ row.name }}</strong>
        </template>
        <template slot-scope="{ row }" slot="point">
          <Input
            type="text"
            v-model="row.attValue"
            size="small"
            style="margin-right: 5px"
            @on-change="handleValue(row)"
          />
        </template>
      </Table>
    </Row>

    <Divider style="margin-bottom: 20px;" />

    <Row>
      <InputNumber :max="10" :min="1" v-model="value1"></InputNumber>
      <Input
        type="text"
        v-model="editValue1"
        size="small"
        style="margin-right: 5px"
        v-on:keyup.enter="handleValue(row)"
      />
      <Button @click="handleValue(3)">Set</Button>
    </Row>
  </div>
</template>

<script lang="ts">
import { Component, Watch, Vue } from "vue-property-decorator";

const _ = require("lodash");

@Component({})
export default class Application extends Vue {
  // data

  value1 = 1;
  editValue: string = "";
  editValue1: string = "";

  // data () {
  //           return {
  //               value1: 1,
  //               editValue: ""
  //           }
  //       }

  data1 = [
    {
      name: "John Brown",
      age: 18,
      address: "New York No. 1 Lake Park",
      date: "2016-10-03",
      attValue: "test1",
    },
    {
      name: "Jim Green",
      age: 24,
      address: "London No. 1 Lake Park",
      date: "2016-10-01",
      attValue: "test2",
    },
    {
      name: "Joe Black",
      age: 30,
      address: "Sydney No. 1 Lake Park",
      date: "2016-10-02",
      attValue: "test3",
    },
    {
      name: "Jon Snow",
      age: 26,
      address: "Ottawa No. 2 Lake Park",
      date: "2016-10-04",
      attValue: "test4",
    },
  ];

  columns1 = [
    {
      title: "Attribute",
      key: "name",
      slot: "name",
      fixed: "left",
    },
    {
      title: "Data Point",
      key: "point",
      slot: "point",
      fixed: "left",
      width: 125,
      align: "center",
      // render: (h, params) => {
      //                   return h('Input', {
      //                           props: {
      //                               type: 'primary',
      //                               size: 'small',
      //                               placeholder: 'Enter value'
      //                           },
      //                           // style: {
      //                           //     marginRight: '1px'
      //                           // },
      //                           on: {
      //                               click: () => {
      //                                   this.show(params.index)
      //                               }
      //                           }
      //                       }, 'View');
      //               }
    },
    {
      title: "Cluster 1",
      key: "c1",
    },
    {
      title: "Cluster 2",
      key: "c2",
    },
    {
      title: "Cluster 3",
      key: "c3",
    },
    {
      title: "Cluster 4",
      key: "c4",
    },
    {
      title: "Cluster 4",
      key: "c4",
    },
    {
      title: "Cluster 4",
      key: "c4",
    },
    {
      title: "Cluster 4",
      key: "c4",
    },
    {
      title: "Cluster 4",
      key: "c4",
    },
  ];

  handleValue(row: String) {
    console.log(row)
    // console.log("value entered");
    // console.log(this.editValue1);
    // console.log(this.value1);

    // update the data1 by hand
    this.data1 = this.data1.map((r, i) => {
      if (i == row._index) {
        return row
      }
      return r
    })

    console.log(this.data1.map((f) => f.attValue));
    // console.log(index);
    // this.data1[index].attValue = this.editValue;
  }
}
</script>
