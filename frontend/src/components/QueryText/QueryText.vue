<template>
  <div v-if="Q">
    <p :key="atom.name" v-for="(atom,i) in Q.atoms">
      {{i === 0 ? `${Q.name}() = ` : ""}} 
      <strong>{{atom.name}}</strong>(
        <VariableText :variables="atom.variables" :Q="Q" />
      ){{i !== Q.atoms.length - 1 ? "," : ""}}
    </p>
  </div>
</template>

<script>
import Query from "../../util/Query";
import VariableText from "./VariableText.vue"

export default {
  props: ["Q"],
  data() {
    return {
      
    }
  },
  mounted: function() {
    // console.log(this.Q)
  },
  components: {
    VariableText,
  }
}
</script>

<style>
.join-vars {
  color: #3366ff;
}
</style>