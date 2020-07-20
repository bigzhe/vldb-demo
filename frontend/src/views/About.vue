<template>
  <div style="margin-top: 00px" class="container-fluid">
    <Tabs style="margin-bottom: 0;">
        <TabPane label="Input"></TabPane>
        <TabPane label="Model Selection"></TabPane>
        <TabPane label="Regression"></TabPane>
        <TabPane label="Chow-Liu Tree"></TabPane>
        <TabPane label="Maintenance Strategy"></TabPane>
    </Tabs>

    <!-- <p>Chow-Liu Tree</p> -->
    <Form style="width: 205px;" :label-width="80">
        <FormItem label="Threshold">
            <Input placeholder="Enter something..."></Input>
        </FormItem>
        <FormItem label="Label">
            <Select placeholder="" placement="bottom-end">
                <Option :key="a" v-for="a in attrs" :value="a">{{a}}</Option>
            </Select>
        </FormItem>
    </Form>

  </div>
</template>

<script>

export default {
  name: 'about',
  components: {
  },
  computed: {
    attrs: function() {
      return ["locn","dateid","ksn","inventoryunits","zip","rgn_cd","clim_zn_nbr","tot_area_sq_ft","sell_area_sq_ft","avghhi","supertargetdistance","supertargetdrivetime","targetdistance","targetdrivetime","walmartdistance","walmartdrivetime","walmartsupercenterdistance","walmartsupercenterdrivetime","population","white","asian","pacific","black","medianage","occupiedhouseunits","houseunits","families","households","husbwife","males","females","householdschildren","hispanic","subcategory","category","categoryCluster","price","rain","snow","maxtemp","mintemp","meanwind","thunder"]
    }
  }
}
</script>
