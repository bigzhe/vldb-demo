<template>
  <div>
    <Row>
      <Col span="12">
        <div id="mutual_selection_vis"></div>
      </Col>
      <Col span="12">
        <Form :model="formItem" :label-width="80">
          <FormItem label="Threshold">
            <InputNumber :max="1" :min="0" :step="0.01" v-model="formItem.threshold"></InputNumber>
          </FormItem>
          <FormItem label="Label" prop="label">
            <Select v-model="formItem.label" placeholder="Select the label">
              <Option v-for="item in variables" :value="item" :key="item">{{ item }}</Option>
            </Select>
          </FormItem>
        </Form>
      </Col>
    </Row>
  </div>
</template>

<script lang="ts">
import { Component, Watch, Vue } from "vue-property-decorator";
import _ from "lodash"
import "../util/ArrayExtensions";
import {
  // RetailerMatrix,
  getMIFlatArray,
  getModelSelectionArray,
  // variables
} from "../data/RetailerMatrix";

import { ModelMatrix } from "../types/Model"

import showModelSelection from "../util/d3/showModelSelection";


@Component({})
export default class Dataset extends Vue {
  // data
  // variable_order?: Node = undefined;
  // variables?:
  // RetailerMatrix = RetailerMatrix;
  formItem = {
      label: this.$store.state.label,
      threshold: this.$store.state.threshold,
    }

  get variables(): string[] {
    return this.$store.state.variables
  }

  get matrix(): ModelMatrix {
    return this.$store.state.matrix
  }

  mounted() {
    this.formItem = {
      label: this.$store.state.label,
      threshold: this.$store.state.threshold,
    }
    this.renderD3();
  }

  @Watch("formItem", { immediate: true, deep: true })
  onFormChanged(formItem: { threshold: number; label: string }) {
    this.renderD3()

  }

  renderD3() {
    // console.log('render')
    // if (!this.formItem.label) return;
    // if (!this.formItem.threshold) return;

    if (!_.isNil(this.formItem.label) && !_.isNil(this.formItem.threshold)) {

      // sorted
      const array = getModelSelectionArray(this.matrix, this.variables, this.formItem.label);
      showModelSelection(array[0].attrX, array, this.formItem.threshold);

      const features = array.filter(v => v.attrY != this.formItem.label && v.MI > this.formItem.threshold).map(v => v.attrY)
      this.$store.commit('SET_LABEL', this.formItem.label)
      this.$store.commit('SET_THRESHOLD', this.formItem.threshold)
      this.$store.commit('SET_FEATURES', features)
    }
  }

  handleNext() {
    // this.$store.commit("SET_MODEL_SELECTION")
  }
}
</script>

<style>
</style>