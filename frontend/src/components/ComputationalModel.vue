<template>
  <div>
    Computational Model
    <Button @click="handleNext" type="primary">Next</Button>
  </div>
</template>

<script lang="ts">
  import {Component, Watch, Vue} from "vue-property-decorator";
  import "../util/ArrayExtensions"

  @Component({})
  export default class Dataset extends Vue {
    // data



    handleNext() {
      this.$store.commit("SET_COMPUTATIONAL_MODEL")
    }
  }


</script>

<style>
</style>