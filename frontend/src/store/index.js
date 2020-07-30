import Vue from 'vue'
import Vuex from 'vuex'
import axios from 'axios'

import dataset from "../data/dataset"

Vue.use(Vuex)

export default new Vuex.Store({
  state: {
    dataset,
    selected_dataset: {},
    tN: 0,
    processing: false,
    query: {},
    query_info: {},
    query_text: "",
    step: 1, // 0: dataset, 1: model selection, 2: regression, 3: chow-liu tree
    tab: "dataset",
    threshold: 0.02,
    label: "inventoryunits",
    features: ['inventoryunits', 'price', 'subcategory', 'category', 'categoryCluster'],
    variables: [],
    matrix: [],
    paramMatrix: [],
  },
  mutations: {
    SET_PROCESSING(state, processing) {
      state.processing = processing
    },
    SET_THRESHOLD(state, threshold) {
      state.threshold = threshold
    },
    SET_LABEL(state, label) {
      state.label = label
    },
    SET_FEATURES(state, features) {
      state.features = features
    },
    SET_SELECTED_DATASET(state, selected_dataset_idx) {
      state.selected_dataset = state.dataset[selected_dataset_idx]
    },
    SET_QUERY_INFO(state, query_info) {
      state.query_info = query_info
      state.step = 1
    },
    SET_QUERY_TEXT(state, query_text) {
      state.query_text = query_text
    },
    SET_QUERY(state, query) {
      state.query = query
    },
    SET_COMPUTATIONAL_MODEL(state) {
      state.step = 2
    },
    SET_STEP(state, step) {
      state.step = step
    },
    SET_TAB(state, tab) {
      state.tab = tab
    },
    SET_MODEL_SELECTION(state) {
      state.step = 1
    },
  },
  actions: {
    regenerateViews({
      state,
      commit
    }, {rootIndicators, onSuccess}) {

      // await axios.get
      // returns a Promise
      return axios({
        method: 'get',
        url: ` http://localhost:8081/regen/[${rootIndicators.join(',')}]`
      }).then(function (response) {
          console.log(response)
          onSuccess()
      }).catch(err => {
        console.log(err);
      });
    }
  },
  modules: {}
})