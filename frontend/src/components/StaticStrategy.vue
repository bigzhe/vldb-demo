<template>
  <div>
    <Row>
      <Col :span="24">
        <Row>
          <Col :span="2">
            <p>Query</p>
          </Col>
          <Col :span="22">
            <QueryText :Q="Q" />
          </Col>
        </Row>
        <!-- <Row style="margin-top: 5px">
          <Col :span="4">
            <p>Free variables:</p>
          </Col>
          <Col :span="16">
            <CheckboxGroup v-model="query_info.free_variable_relation.selected_variables">
              <Checkbox
                :key="variable"
                v-for="variable in query_info.free_variable_relation.variables"
                :label="variable"
                border
              ></Checkbox>
            </CheckboxGroup>
          </Col>
        </Row>-->
      </Col>
      <!-- <Col :span="24">
        <Row>
          <Col :span="3">
            <p>Dynamic relations:</p>
          </Col>
          <Col :span="21">
            <CheckboxGroup v-model="dynamic_relations">
              <Checkbox
                :key="relation"
                v-for="relation in Q.atoms.map(a => a.name)"
                :label="relation"
                border
              ></Checkbox>
            </CheckboxGroup>
          </Col>
        </Row>
      </Col>-->
    </Row>
    <br />
    <Row>
      <Col :span="2">Instructions</Col>
      <Col :span="22">
        <p>Click the base relations to see the maintenance strategy when there are updates. Click again to restore.</p>
      </Col>
    </Row>
    <br />

    <div style="border: 1px solid gainsboro" id="view-tree"></div>
    <!-- <Button @click="handleNext" type="primary">Next</Button> -->
    <!-- <Button style="margin-top: 10px;" @click="handlePrev" type="primary">Prev</Button> -->
  </div>
</template>

<script lang="ts">
import { Component, Watch, Vue } from "vue-property-decorator";
import "../util/ArrayExtensions";
import { parse_query_text } from "../util/Query";
import Query from "../util/Query";
import {
  updateMathContent,
  tex2svg,
  enable_svg_zoom
} from "../util/updateMath";
import Node from "../util/Node";

import { Element, SVG, Svg, Rect, Line } from "@svgdotjs/svg.js";
import logger from "vuex/dist/logger";
import ViewTreeNode from "../util/ViewTreeNode";
import IndicatorViewNode from "../util/IndicatorViewNode";
import { QueryInfo } from "../types/Query";

import QueryText from "./QueryText/QueryText.vue";

@Component({
  components: {
    QueryText
  }
})
export default class Dataset extends Vue {
  // data
  variable_order?: Node = undefined;
  global_draw?: Svg = undefined;
  query_info: QueryInfo = this.$store.state.query_info;
  query_text: string = this.$store.state.query_text;
  Q: Query = this.$store.state.query;
  dynamic_relations: string[] = this.Q.atoms.map(a => a.name);
  shown_delta_R: string = "";

  mounted() {
    updateMathContent();
    this.show_view_tree();

    // console.log(this.Q.get_best_succinct_variable_order().draw_tree())
    // console.log(this.Q.get_view_tree().draw_tree());
  }

  // filtered_view_tree?: ViewTreeNode = undefined
  get filtered_view_tree() {
    if (!this.Q) return undefined;

    const best_vo = this.Q.get_best_variable_order(this.dynamic_relations);
    console.log(best_vo.draw_tree(true));
    // console.log("Width: ", best_vo.static_width(this.Q))
    return this.Q.get_filtered_view_tree(this.dynamic_relations);
    // return this.static_view_tree
  }

  @Watch("dynamic_relations")
  onDynamicRelationsChanged() {
    if (!this.Q || !this.filtered_view_tree) return;

    this.show_view_tree();
  }

  @Watch("query_info", { deep: true })
  onQueryInfoChanged(new_query_info: QueryInfo) {
    this.query_text = this.compute_query_text(new_query_info);
    this.Q = parse_query_text(this.query_text);
    this.show_view_tree();
  }

  compute_query_text(query_info: QueryInfo): string {
    if (!query_info || !query_info.free_variable_relation.selected_variables)
      return "";
    return (
      `Q_${
        query_info.name
      }(${query_info.free_variable_relation.selected_variables.join(", ")})` +
      ` = ${query_info.relations
        .filter(r => r.selected)
        .map(
          r =>
            `${r.name}(${
              r.selected_variables != undefined
                ? r.selected_variables.join(", ")
                : ""
            })`
        )
        .join(", ")}`
    );
  }

  show_view_tree(
    deltaR: ViewTreeNode | undefined = undefined,
    isIndicator: boolean = false,
    indicator_id: string = ""
  ) {
    if (!this.Q || !this.filtered_view_tree) return;
    if (deltaR) {
      this.show_svg(
        this.Q.get_delta_view_tree(
          this.filtered_view_tree,
          deltaR,
          isIndicator,
          indicator_id
        ),
        this.Q
      );
      this.shown_delta_R = isIndicator ? indicator_id : deltaR.name;
    } else {
      this.filtered_view_tree.to_svg_tree(this.Q);

      this.show_svg(this.filtered_view_tree, this.Q);
      this.shown_delta_R = "";
    }
    enable_svg_zoom();
  }

  // UI components
  view_constructor(
    draw: Svg,
    node: ViewTreeNode,
    padding: number = 8
  ): Element {
    // get properties
    const location: [number, number] = node.position;
    const view_tex = node.view_tex;
    const definition_tex = node.view_definition_tex;

    // get the svg of the view tex
    const view_svg = SVG(tex2svg(view_tex));

    // get the width and height
    const local_draw = draw.nested().attr({ color: "black" });
    view_svg.addTo(local_draw);
    const w = local_draw.bbox().width;
    const h = local_draw.bbox().height;

    const rect = new Rect()
      .size(w + 2 * padding, h + 2 * padding)
      .attr({
        // 'stroke': '#000',
        // 'stroke-width': 1,
        "fill-opacity": 0
      })
      .addTo(local_draw);

    view_svg.attr({
      x: rect.x() + padding,
      y: rect.y() + padding
    });

    local_draw.center(location[0] - w / 2, location[1] - h / 2);

    const definition_draw = SVG().nested();

    const definition_svg = SVG(tex2svg(definition_tex));
    definition_svg.addTo(definition_draw);

    new Rect()
      .size(definition_draw.bbox().w, definition_draw.bbox().h)
      .attr({
        fill: "#fff",
        "fill-opacity": 1
        // 'stroke': '#000',
        // 'stroke-width': 1,
      })
      .addTo(definition_draw)
      .back();

    // definition_draw.attr({
    //   x: rect.x() + padding,
    //   y: rect.y() + 3 * padding + h
    // });

    definition_draw.attr({
      x: padding,
      y: padding
    });

    const self = this;
    const global_draw = this.global_draw

    local_draw.on("mouseover", function() {
      local_draw.attr({ color: "#01579B" });
      // definition_draw.addTo(local_draw);
      definition_draw.addTo(global_draw);
    });

    local_draw.on("mouseout", function() {
      local_draw.attr({ color: "black" });
      definition_draw.remove();
    });

    local_draw.on("click", function() {
      if (!self.Q || !self.filtered_view_tree) return;
      // if (node instanceof IndicatorViewNode) return;

      // console.log(self.shown_delta_R, node.get_indicator_id())
      if (node.isIndicator()) {
        if (
          self.shown_delta_R &&
          self.shown_delta_R == node.get_indicator_id()
        ) {
          self.show_view_tree();
        } else {
          self.show_view_tree(
            node,
            node.isIndicator(),
            node.get_indicator_id()
          );
        }
      } else if (node.name != "V") {
        if (!self.shown_delta_R || self.shown_delta_R != node.name) {
          // console.log(node.get_indicator_id())
          self.show_view_tree(
            node,
            node.isIndicator(),
            node.get_indicator_id()
          );
        } else {
          self.show_view_tree();
        }
      }
    });

    return local_draw;
  }

  show_svg(view_tree: ViewTreeNode, query: Query) {
    if (this.global_draw) {
      this.global_draw.remove();
    }

    this.global_draw = SVG()
      .addTo("#view-tree")
      .size("100%", 600);
    this.global_draw.attr({ id: "root-svg" });

    const global_draw: Svg = this.global_draw;

    const iterator = (node: ViewTreeNode): Element => {
      const viewElem = this.view_constructor(global_draw, node);

      // draw view
      viewElem.addTo(global_draw);

      // line padding
      const line_padding = 20;
      node.children.forEach(n => {
        const elem = iterator(n);

        // draw line
        const line = global_draw
          .line(
            viewElem.cx() + viewElem.bbox().w / 2,
            viewElem.cy() + viewElem.bbox().h / 2 + line_padding,
            elem.cx() + elem.bbox().w / 2,
            elem.cy() + elem.bbox().h / 2 - line_padding
          )
          .stroke({ width: 1, color: "black" });
        line.back();
      });

      return viewElem;
    };

    iterator(view_tree);
  }

  handleNext() {
    // this.$store.commit("SET_COMPUTATIONAL_MODEL")
    console.log("next");
  }

  handlePrev() {
    this.$store.commit("SET_STEP", 0);
  }
}
</script>

