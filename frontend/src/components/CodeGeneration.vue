<template>
  <div class="line-numbers">
    <Row>
      <Col span="12">
        Select File:
        <Select
          placeholder="Please select"
          @on-open-change="fetchFiles"
          v-model="selectedFile"
          style="width:200px"
        >
          <Option v-for="(f,i) in files" :value="f" :key="i">{{ f }}</Option>
        </Select>
      </Col>
      <Col span="12">
        Highlight:
        <Select placeholder="Please select" v-model="selectedTag" style="width:200px">
          <Option v-for="(f,i) in tags" :value="f" :key="i">{{ f }}</Option>
        </Select>
      </Col>
    </Row>
    <div style="border: 1px solid gray; padding: 5px; margin-top: 20px">
      <div v-if="selectedFile">
        <!-- code here -->
        <pre class="language-cpp" :data-line="dataLines" :tag-line="tagLines">
        <code class="language-cpp">
        {{fileContent}}
        </code>
        </pre>
      </div>
      <div v-else>Select a file to inspect the code</div>
    </div>
    <Row style="margin-top: 20px;" type="flex" justify="end" :gutter="0">
        <Button @click="executeCode" type="primary">Execute Code</Button>
    </Row>
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
  selectedTag: string = "ALL";
  fileContent: string = "";
  fileHtml: string = "";
  files: string[] = [];
  showCode: boolean = false;
  tagLines: string = "";
  dataLines: string = "";
  tags = ["ALL", "JOIN", "AGGREGATE", "RUNNING SUM", "OUTPUT"];

  mounted() {
    // files
    this.fetchFiles();
  }

  fetchFiles() {
    const self = this;
    this.$store.dispatch("fetchCppFiles", {
      onSuccess: (files: string[]) => {
        self.files = files;
      },
    });
  }

  extractCodeBlocks(code: string) {
    let TAGS =
      this.selectedTag == "ALL"
        ? ["JOIN", "AGGREGATE", "RUNNING SUM", "OUTPUT"]
        : [this.selectedTag];

    // find the code blocks in code
    const lines = code.split("\n");

    const tagLines: { [_: string]: string } = {};

    const tagStack: { tag: string; type: string; lineIdx: number }[] = [];
    // iteration
    lines.forEach((line: string, lineIdx) => {
      // looking for a START signal
      const tagIdx = TAGS.findIndex((tag) => line.includes(`${tag}`));
      if (tagIdx !== -1) {
        const tag = TAGS[tagIdx];
        const type = line.includes(`${tag} START`) ? "start" : "end";

        const lastTag = tagStack[tagStack.length - 1]; // peek the last one

        // console.log({lastTag})

        // if we can match them, pop the last one and create a new tagLine
        if (lastTag && lastTag.tag === tag && lastTag.type !== type) {
          // match
          tagStack.pop();
          tagLines[`${lastTag.lineIdx + 2}-${lineIdx + 2}`] = tag;
        } else {
          // if not match, push it to the stack
          tagStack.push({
            tag,
            type,
            lineIdx,
          });
        }
      }

      // console.log({line, line})
    });

    console.log(tagLines);
    this.tagLines = JSON.stringify(tagLines);
    this.dataLines = Object.keys(tagLines).join(",");
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
      onSuccess: (code: string, html: string) => {
        self.fileContent = code;
        self.fileHtml = html;
        self.showCode = false;

        self.extractCodeBlocks(code);

        Vue.nextTick(function () {
          // DOM updated
          self.showCode = true;
          Vue.nextTick(function () {
            Prism.highlightAll();
            window.dispatchEvent(new Event("resize"));
          });
        });

        // console.log(Prism.highlightAll())
      },
    });
  }

  executeCode() {
    const self = this;
    console.log("execute code");

    this.$store.dispatch("executeCode", {
      onSuccess: function () {
        // on success
        self.$store.commit("SET_TAB", "application");
      },
    }); 
  }

  @Watch("selectedTag", { immediate: true, deep: true })
  onTagChanged(tag: string) {
    const self = this;
    self.extractCodeBlocks(self.fileContent);
    self.showCode = false;
    Vue.nextTick(function () {
      self.showCode = true;
      Vue.nextTick(function () {
        Prism.highlightAll();
        window.dispatchEvent(new Event("resize"));
      });
    });
  }
}
</script>

