<template>
  <div class="line-numbers">
    <Row>
      <Col span="12">
        Select File:
        <Select placeholder="Please select" v-model="selectedFile" style="width:200px">
          <Option v-for="(f,i) in files" :value="f" :key="i">{{ f }}</Option>
        </Select>
      </Col>
      <Col span="12">Highlight:</Col>
    </Row>
    <div style="border: 1px solid gray; padding: 5px; margin-top: 20px">
      <!-- code here -->
      <pre class="language-cpp line-numbers" data-line="1-2, 5, 9-20">
        <code v-html="fileHtml" class="language-cpp">
        </code>
      </pre>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Watch, Vue } from "vue-property-decorator";
// import Prism from "prismjs";


const _ = require("lodash");

@Component({})
export default class Dataset extends Vue {
  // data
  selectedFile: string = "";
  fileContent: string = "";
  fileHtml: string = "";
  files: string[] = [];

  mounted() {
    // files
    const self = this;
    this.$store.dispatch("fetchCppFiles", {
      onSuccess: (files: string[]) => {
        self.files = files;
      },
    });
  }

  @Watch("selectedFile", { immediate: true, deep: true })
  onNameChanged(name: string) {
    // console.log(this.selectedFile)
    if (!this.selectedFile) {
      return;
    }

    const self = this;
    this.$store.dispatch("fetchFileContent", {
      filename: self.selectedFile,
      onSuccess: (code:string, html:string) => {
        self.fileContent = code;
        self.fileHtml = html;

        // console.log(self.fileContent, self.fileHtml)
      },
    });
  }
}
</script>

<style >
.ivu-form-item {
  margin-bottom: 0px;
}

.links line {
  stroke: #999;
  stroke-opacity: 0.6;
}

.nodes circle {
  stroke: #fff;
  stroke-width: 1.5px;
}

text {
  font-family: sans-serif;
  font-size: 10px;
}
</style>