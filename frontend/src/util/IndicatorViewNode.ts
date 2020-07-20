import ViewTreeNode from "./ViewTreeNode"
import Query from './Query'

export default class IndicatorViewNode extends ViewTreeNode {

  public indicator_id: string = ""

  public isIndicator(): boolean {
    return true
  }

  public get_indicator_id(): string {
    return this.indicator_id
  }

  // return a new copy of the view tree
  public copy(): IndicatorViewNode {
    const children = this.children.map(n => n.copy())
    const new_node = new IndicatorViewNode(this.name, this.variable, [...this.keys], [...this.relations], children)
    new_node.position = this.position
    new_node.view_tex = this.view_tex
    new_node.view_definition_tex = this.view_definition_tex
    new_node.indicator_id = this.indicator_id
    return new_node
  }

  to_tex(query: Query): string {
    const key_tex = super.get_keys_tex(query, this.keys, [], false)
    return `\\exists_{${key_tex}}` + super.to_tex(query)
  }

  to_delta_tex(query: Query, deltaR: ViewTreeNode, updated: boolean = false): string {
    
    const red_key_tex = this.get_keys_tex(query, this.keys, deltaR.keys)
    const black_key_tex = this.get_keys_tex(query, this.keys)
    let variable_tex = this.get_variable_tex(this.variable)
    let relation_tex = ""

    if (updated) {
      return this.make_red(`\\delta` + `\\exists_{${black_key_tex}}` + `${this.name}_{${relation_tex}}^{${this.variable ? `@${variable_tex}` : ""}}`) + `(${red_key_tex})`
    } else {
      return `\\exists_{${black_key_tex}}` + `${this.name}_{${relation_tex}}^{${this.variable ? `@${variable_tex}` : ""}}(${red_key_tex})`
    }
    
  }

  to_view_definition_tex(query: Query): string {
    return this.view_tex
  }

  to_delta_view_definition_tex(query: Query, deltaR: ViewTreeNode, path: ViewTreeNode[]): string {
    return this.view_tex
  }
}