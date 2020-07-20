<template>
  <span>
    <span :key="v" v-for="(v,j) in variables">
      <span :class="Q.join_variables.includes(v) ? 'join-vars' : ''">{{v}}</span>{{j !== variables.length - 1 ? "," : ""}}
      
    </span>
  </span>
</template>

<script>
import Query from "../../util/Query";
export default {
  props: ["variables", "Q"],
  data() {
    return {
      
    }
  },
  mounted: function() {
    // console.log(this.Q)
  }
}
</script>

<style>
.join-vars {
  color: #3366ff;
}
</style>