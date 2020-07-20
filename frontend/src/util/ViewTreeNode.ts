import draw_tree from "./asciitree";
import Query from "../util/Query";
import Atom from "../util/Atom"
import {SVG} from "@svgdotjs/svg.js";
import {tex2svg} from "../util/updateMath";
import IndicatorViewNode from './IndicatorViewNode';

export default class ViewTreeNode {
  public readonly name:string
  public readonly variable:string
  public keys:string[]
  public children:ViewTreeNode[]
  public relations: string[]

  public position: [number, number] = [0, 0]
  public view_tex: string = ""
  public view_definition_tex: string = ""

  // we might have removed some views that are unnecessary
  // we record them here
  public compressed_views: ViewTreeNode[] = []

  constructor(name:string, variable: string, keys: string[], relations: string[], children: ViewTreeNode[]) {
    this.name = name
    this.variable = variable
    this.keys = keys
    this.relations = relations
    this.children = children
  }

  public isIndicator(): boolean {
    return false
  }

  public get_indicator_id(): string {
    return ""
  }

  public to_svg_tree(query: Query) {
    this.update_position(query)
    this.update_tex(query)
  }

  public to_svg_delta_tree(query: Query, deltaR: ViewTreeNode, path: ViewTreeNode[]) {
    // this.update_position()
    this.update_delta_tex(query, deltaR, path)
  }

  update_position(query: Query, width: number = 10, height: number = 45) {
    const whitespace = ' '
    const output: {[line: number]: string} = {};
    const check_empty = function (onLine: number) {
      if (output[onLine] == undefined) {
        output[onLine] = '';
      }
    };

    var repeat = function (string: string, times: number) {
      var output = '';
      for (var i = 0; i < times; i++) {
        output += string;
      }
      return output;
    };

    const get_title = function (node: ViewTreeNode): string {
      return node.to_tex(query)
    };


    const dumbSVG = SVG()
    let longest_width = 0
    const get_longest_width_of_tex = (node: ViewTreeNode) => {

      const view_tex = node.view_tex
      
      // TODO: 改成取最长的
      const view_svg = SVG(tex2svg(view_tex))

      // get the width and height
      const local_draw = dumbSVG.nested()
      view_svg.addTo(local_draw)
      const width = local_draw.bbox().width / 10
      longest_width = Math.max(width, longest_width)

      node.children.forEach(n => {
        get_longest_width_of_tex(n)
      })
    }
    get_longest_width_of_tex(this)

    const get_width_of_tex = (title: string): number => longest_width // return the longest width

    const find_padding = function (onLine:number, position:number, _margin?: number | undefined) {
      check_empty(onLine);

      let padding = 0,
        margin = _margin != undefined ? _margin : 2.5,
        length = output[onLine].length;

      if (position < 0) {
        padding = -position;
        position = 0;
      }

      if (length >= position) {
        padding += length - position + margin;
      }

      return padding;
    };

    var insert = function (string: string, onLine: number, position: number) {
      check_empty(onLine);

      var length = output[onLine].length;

      // if (position < 0) {
      //   throw "Trying to insert \"" + string + "\" at negative position(" + position + ").";
      // }
      //
      // if (position < length) {
      //   throw "Trying to insert \"" + string + "\" at position(" + position + ") less then length(" + length + ").";
      // }

      output[onLine] += repeat(whitespace, position - length) + string;
    };

    const update_position_helper = (tree: ViewTreeNode, onLine: number, position: number): number => {

      // sort the child views here
      tree.children = tree.children.sort((c1, c2) => {

        if (c1.isIndicator() && !c2.isIndicator()) {
          return -1
        } else if (!c1.isIndicator() && c2.isIndicator()) {
          return 1
        } else if (c1.name == "V" && c2.name == "V") {
          return c1.variable < c2.variable ? -1 : 1
        } else if (c1.name != "V" && c2.name == "V") {
          return 1
        } else if (c1.name == "V" && c2.name != "V") {
          return -1
        } else {
          return c1.name < c2.name ? -1 : 1
        }
      })

      var padding = 0,
        foundedPadding = 0,
        nodePadding = 0,
        node, title,
        offset = 0,
        currentTitle = get_title(tree),
        currentTitleLength = get_width_of_tex(currentTitle),
        nodes = tree.children;

      currentTitle = repeat(whitespace, currentTitleLength)

      if (nodes.length > 0) {
        let at = position
        if (nodes.length == 1) {
          node = nodes[0]
          title = get_title(node)

          let halfOfCurrentTitle = Math.floor(currentTitleLength / 2);
          offset = Math.floor(get_width_of_tex(title) / 2) - halfOfCurrentTitle;

          foundedPadding = find_padding(onLine + 2, position - offset);

          nodePadding = update_position_helper(node, onLine + 2, position - offset + foundedPadding);
          insert('|', onLine + 1, position + halfOfCurrentTitle + foundedPadding + nodePadding);

          padding = foundedPadding + nodePadding;
        } else {
          for (var i = 0; i < nodes.length; i++) {
            node = nodes[i];
            title = get_title(node)
            let title_width = get_width_of_tex(title)

            if (i == 0) {
              offset = title_width == 1 ? 2 : Math.floor(title_width / 2) + 1;

              foundedPadding = find_padding(onLine + 2, position - offset);
              nodePadding = update_position_helper(node, onLine + 2, position - offset + foundedPadding);
              insert('/', onLine + 1, position - 1 + foundedPadding + nodePadding);
              insert(repeat(whitespace, currentTitleLength), onLine + 1, position + foundedPadding + nodePadding);
              padding = foundedPadding + nodePadding;
              at += padding + currentTitleLength;
            } else {
              offset = title_width == 1 ? -1 : Math.floor(title_width / 2) - 1;

              foundedPadding = find_padding(onLine + 2, at - offset);
              nodePadding = update_position_helper(node, onLine + 2, at - offset + foundedPadding);

              at += (foundedPadding + nodePadding);


              insert('\\', onLine + 1, at);
              currentTitle += repeat('_', foundedPadding + nodePadding);
            }

          }
        }

      }

      insert(currentTitle, onLine, position + padding);
      tree.position = [(position + padding)*width, onLine * height]
      return padding
    }


    update_position_helper(this, 0, 0)
  }

  post_order_apply(apply: (view: ViewTreeNode) => void) {
    this.children.forEach(n => {
      n.post_order_apply(apply)
    })
    apply(this)
  }

  update_tex(query: Query) {
    this.post_order_apply((view: ViewTreeNode) => {
      view.view_tex = view.to_tex(query)
      if (view.name != "V") {
        view.view_definition_tex = view.view_tex
        return
      }
      view.view_definition_tex = view.to_view_definition_tex(query)
    })
  }

  // upd

  update_delta_tex(query: Query, deltaR: ViewTreeNode, path: ViewTreeNode[]) {
    const isIndicator = path[path.length-1].isIndicator()
    const indicator_id = path[path.length-1].get_indicator_id()
    
    const used_relations = path.flatMap(n => [n.name, ...n.children.map(c => c.name)]).filter(s => s != "V").unique()
    const used_views = path.flatMap(n => [n.variable, ...n.children.map(c => c.variable)])
    const updated_views = path.map(n => n.variable)

    
    const apply_update = ((root: ViewTreeNode) => {

      if (root.name == "V") {
        // view
        if (updated_views.includes(root.variable)) {
          root.view_tex = root.to_delta_tex(query, deltaR, true)
          // updated_this_level = true

          root.children.forEach(c => apply_update(c))

        } else if (used_views.includes(root.variable)) {
          root.view_tex = root.to_delta_tex(query, deltaR)
        } else
          root.view_tex = root.to_tex(query)

      } else if (!root.isIndicator()) {
        // relation
        if (!isIndicator && root.name == deltaR.name) {
          root.view_tex = root.to_delta_tex(query, deltaR, true)
        } else if (used_relations.includes(root.name)) {
          root.view_tex = root.to_delta_tex(query, deltaR)
        } else
          root.view_tex = root.to_tex(query)

      } else {
        // indicator
        if (root.get_indicator_id() == indicator_id) {
          root.view_tex = root.to_delta_tex(query, deltaR, true)
        } else {
          root.view_tex = root.to_delta_tex(query, deltaR)
        }
      }

      root.view_definition_tex = root.to_delta_view_definition_tex(query, deltaR, path)
      
    })

    // base case
    // assumption: the root is a view and it is in the path
    apply_update(this)

  }

  // return a new copy of the view tree
  public copy(): ViewTreeNode {
    const children = this.children.map(n => n.copy())
    const new_node = new ViewTreeNode(this.name, this.variable, [...this.keys], [...this.relations], children)
    new_node.compressed_views = this.compressed_views
    new_node.position = this.position
    new_node.view_tex = this.view_tex
    new_node.view_definition_tex = this.view_definition_tex
    return new_node
  }

  path_to_view(is_view: (node: ViewTreeNode) => boolean): [boolean, ViewTreeNode[]] {
    
    if (is_view(this)) {
      return [true, [this]]
    }

    if (this.children.length == 0) return [false, []]

    for (let i = 0; i < this.children.length; i++) {
      const [found, path] = this.children[i].path_to_view(is_view)
      if (found) {
        return [true, [this, ...path]]
      }
    }
    return [false, []]
  }

  public draw_tree():string {
    return draw_tree(this,
      (node: ViewTreeNode) => `${node.name}_{${node.relations.join(";")}}^{${node.variable ? `@${node.variable}` : ""}}(${node.keys})`,
      (node:ViewTreeNode) => node.children)
  }

  /**
   * 
   * @param keys 
   * @param fixed_keys updated keys -- we need to make them red
   * @param compress 
   */
  get_keys_tex(query: Query, keys: string[], fixed_keys: string[] = [], compress: boolean = true) {
    let filtered_keys = keys.join('').length > 10 ? query.join_variables.intersection(keys) : keys // 只要 join variables，其他的用 ...

    const red_keys = filtered_keys.map(k => fixed_keys.includes(k) ? this.make_red(k) : k)
    const red_escaped_keys = red_keys.map(k => k.replace('_', '\\_'))
    

    // 只显示 join variables
    // 这里我要把 escaped keys 排序
    let result =  red_escaped_keys.join(",")
    if (filtered_keys.length < keys.length) {
      result += ",\\dots"
    }
    return result
    
    // if (escaped_keys.join('').length > 15 && compress) {
    //   // add dots if it's long
    //   return `${red_escaped_keys.slice(0,3)} ${red_escaped_keys.length > 3 ? `,\\ldots` : ""}`
    // } else {
    //   return red_escaped_keys.join(",")
    // }
  }

  get_relations_tex(relations: string[]) {
    return relations.map(r => r.length > 3 ? r.slice(0,3) : r).map(r => r.replace('_', '\\_')).sort()
  }

  get_variable_tex(variable: string) {
    const escaped_variable = variable.replace('_', '\\_')
    return escaped_variable.length > 5 ? variable.slice(0,3) : escaped_variable
  }

  make_red(tex: string): string {
    return `{\\color{red} ${tex}}`
  }

  to_tex(query: Query): string {
    const key_tex = this.get_keys_tex(query, this.keys, [], this.name == "V")
    let variable_tex = this.get_variable_tex(this.variable)
    let relation_tex = this.get_relations_tex(this.relations)
    if (this.name != "V") {
      relation_tex = []
    }

    return `${this.name}_{${relation_tex}}^{${this.variable ? `@${variable_tex}` : ""}}(${key_tex})`
  }

  to_delta_tex(query: Query, deltaR: ViewTreeNode, updated: boolean = false): string {
    
    const key_tex = this.get_keys_tex(query, this.keys, deltaR.keys)
    let variable_tex = this.get_variable_tex(this.variable)
    let relation_tex = this.get_relations_tex(this.relations)

    if (this.name != "V") {
      relation_tex = []
    }

    if (updated) {
      return this.make_red(`\\delta ${this.name}_{${relation_tex}}^{${this.variable ? `@${variable_tex}` : ""}}`) + `(${key_tex})`
    } else {
      return `${this.name}_{${relation_tex}}^{${this.variable ? `@${variable_tex}` : ""}}(${key_tex})`
    }
  }

  to_view_definition_tex(query: Query): string {
    let view_definition_tex = this.view_tex + " = "
    
    const marginalize_vars = [this.variable, ...this.compressed_views.map(view => view.variable)].filter(v => v && !query.free_variables.includes(v))
    view_definition_tex += marginalize_vars.map(v => `\\sum_{${this.get_variable_tex(v)}}`).join("")

    view_definition_tex += this.children.map(n => n.view_tex).join(" \\Join ")
    return view_definition_tex
  }

  to_delta_view_definition_tex(query: Query, deltaR: ViewTreeNode, path: ViewTreeNode[]): string {

    const path_variables = path.map(n => n.variable)
    const unaffected_children = this.children.filter(c => {
      // if (c.isIndicator()) return true
      if (c.name != "V") {
        // c is a relation
        return c.name != deltaR.name
      } else {
        // view
        return !path_variables.includes(c.variable)
      }
    })
    
    const affected_children = this.children.filter(c => {
      // if (c.isIndicator()) return false
      if (c.name != "V") {
        // c is a relation
        return c.name == deltaR.name
      } else {
        // view
        return path_variables.includes(c.variable)
      }
    })

    if (affected_children.length == 0) {
      // 吃瓜群众（没有被影响的）
      if (deltaR.name != this.name) {
        return this.view_tex
      } else 
        return this.to_delta_tex(query, deltaR, deltaR.name == this.name)
    }

    // console.log(this.variable || this.name, this.compressed_views.map(view => view.variable));
    

    // console.assert(affected_children.length == 1)
    // indicator projection and original relation

    let view_definition_tex = this.to_delta_tex(query, deltaR, true) + " = "
    const marginalize_vars = [this.variable, ...this.compressed_views.map(view => view.variable)].filter(v => v && !query.free_variables.includes(v))
    view_definition_tex += marginalize_vars.map(v => `\\sum_{${this.get_variable_tex(v)}}`).join("")

    view_definition_tex += [affected_children[0].view_tex, ...unaffected_children.map(n => n.to_delta_tex(query, deltaR))].join(" \\Join ") 

    return view_definition_tex
    
  }
}

