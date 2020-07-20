import Atom from "./Atom"
import Node from "./Node"
import ViewTreeNode from './ViewTreeNode'
import draw_tree from "./asciitree"
import "./ArrayExtensions"
import IndicatorViewNode from './IndicatorViewNode'
import {VOState} from '../types/VariableOrder'

class Query {

  // inputs
  public name: string
  public free_variables: string[]
  public atoms: Atom[]

  // computed
  public variables: string[]
  public atoms_of_variables: { [key: string]: Atom[] }
  public join_variables: string[]
  public dep: { [key: string]: string[] }
  public atom_by_name: {[key: string]: Atom}


  // descendent_dep(X) is the variables in the subtree rooted at X depend
  public descendent_dep: { [key: string]: string[] } = {}


  constructor(name: string, free_variables: string[], atoms: Atom[]) {
    const self = this
    this.name = name
    this.free_variables = [...free_variables].filter(v => v != "")
    this.atoms = atoms
    this.variables = this.get_variables().filter(v => v != '')

    this.atom_by_name = {}
    atoms.forEach(atom => {
      this.atom_by_name[atom.name] = atom
    })

    this.atoms_of_variables = {}
    this.variables.forEach(v => {
      this.atoms_of_variables[v] = this.atoms.filter(atom => atom.variables.includes(v))
    })

    this.dep = {} // dependent set
    this.variables.forEach(v => {
      this.dep[v] = this.atoms_of_variables[v].flatMap(atom => atom.variables)
    })

    this.join_variables = []
    for (let i = 0; i < atoms.length; i++) {
      for (let j = i + 1; j < atoms.length; j++) {
        this.join_variables.push(...atoms[i].variables.intersection(atoms[j].variables))
      }
    }


  }



  is_valid(): boolean {
    if (this.atoms.length == 0) return false
    if (this.variables.length == 0) return false
    if (!this.variables.isSuperset(this.free_variables)) return false
    return true
  }

  to_tex(): string {
    const escaped_name = `${this.name}`.replace("_", "\\_")
    return `${escaped_name}(${[...this.free_variables].join(',')}) = ${this.atoms.map(atom => atom.toString()).join(',')}`
  }

  toString(): string {
    return `${this.name}(${[...this.free_variables].join(',')}) = ${this.atoms.map(atom => atom.toString()).join(',')}`
  }

  get_variables(): string[] {
    const variables: string[] = []
    this.atoms.forEach(atom => atom.variables.forEach(variable => {
      variables.push(variable)
    }))
    return variables.unique()
  }

  variable_order_to_view_tree(node: Node): ViewTreeNode {

    // apply the recursion to them and combine them
    let view_tree_nodes = [
      ...node.child_nodes.map(n => this.variable_order_to_view_tree(n)),
      ...node.view_tree_children
    ]

    console.assert(view_tree_nodes.length > 0, "should have child view tree nodes")

    const union_child_keys = view_tree_nodes.map(n => n.keys).reduce((keys1, keys2) => keys1.union(keys2))
    const union_child_relations = view_tree_nodes.map(n => n.relations).reduce((a, b) => a.union(b))
    const descendent_dep_vars = this.descendent_dep[node.variable]

    return new ViewTreeNode('V',
      node.variable,
      node.anc.intersection(descendent_dep_vars).union(this.free_variables.intersection(union_child_keys)),
      union_child_relations,
      view_tree_nodes)

  }

  update_descendent_dep(dynamic_relations: string[]) {
    // this.descendent_dep
    const vo = this.get_best_variable_order(dynamic_relations)

    const update_descendent_dep_helper = (node: Node): string[] => {

      const dep_vars: string[] = [...this.dep[node.variable], ...node.child_nodes.flatMap(n => update_descendent_dep_helper(n))].unique()
      this.descendent_dep[node.variable] = dep_vars
      return dep_vars
    }
    update_descendent_dep_helper(vo)
  }

  // return the delta view tree w.r.t the delta R
  get_delta_view_tree(view_tree: ViewTreeNode, deltaR: ViewTreeNode, isIndicator: boolean, indicator_id: string = ""): ViewTreeNode {
    const tree = view_tree.copy()
    const [found, path] = tree.path_to_view(n => {
      if (isIndicator) {
        return n.isIndicator() && n.get_indicator_id() == indicator_id && n.name == deltaR.name
      } 
      return !n.isIndicator() && n.name == deltaR.name
    })
    if (!found) {
      throw new Error("does not find the view")
    }
    tree.to_svg_delta_tree(this, deltaR, path)

    return tree
  }


  add_indicator_projections(root: ViewTreeNode) {
    root.post_order_apply(v => {
      this.add_indicator_projections_for(v)
    })
  }
  
  private add_indicator_projections_for(view_tree: ViewTreeNode) {
    
    // no need to add indicators if it is a relation
    if (view_tree.name != "V") {
      return 
    }


    const ind_nodes = this.atoms
      .filter(atom => !view_tree.relations.includes(atom.name)) //  R ∈ R \ rels
      .filter(atom => atom.variables.intersection(view_tree.keys).length > 0) // pk = sch(R) ∩ keys, pk != emptyset
      .map(atom => new ViewTreeNode(atom.name, "", atom.variables, [atom.name], []))

    const children = view_tree.children

    let gyo_candidates = [...children, ...ind_nodes]
    gyo_candidates = gyo_candidates.filter((e, i) => gyo_candidates.findIndex(a => (a.name + a.variable) === (e.name + e.variable)) === i); // remove dupliate

    // TODO: we need to select the incycle with least size
    // e.g. for the 4-loop-chord query, and its subquery R(A,B), S(B,C)
    // the relation W(A,C) makes the subquery a cycle
    // but relations T(C,D) U(D,A) W(A,C) also make it a cycle (subsume the previous case)
    // we should prefer the incycle with least size
    const gyo_candidates_subsets = gyo_candidates.subsets().sort((a,b) => a.length - b.length)
    let incycle: ViewTreeNode[] = []
    for (let i = 0; i < gyo_candidates_subsets.length; i++) {
      incycle = this.GYO(gyo_candidates_subsets[i])
      if (incycle.length > 0) break
    }

    const indicators = incycle.filter(indicator => !children.some(c => (c.name+c.variable) == (indicator.name+indicator.variable))) // incycle - children

    // log

    const child_indicators = indicators.map(indicator => new IndicatorViewNode(indicator.name, indicator.variable, indicator.keys, indicator.relations, []))
    child_indicators.forEach(child_indicator => {
      child_indicator.indicator_id = [child_indicator.name, ...view_tree.children.map(c => c.variable || c.name)].join("_")
    })

    view_tree.children.push(...child_indicators)

    // view_tree.children.push(...indicators.map(indicator => new IndicatorViewNode("I", indicator.name, indicator.keys, indicator.relations, [])))   
  }

  GYO(nodes: ViewTreeNode[]): ViewTreeNode[] {
    // get a copy of nodes
    nodes = nodes.map(node => node.copy())

    const is_subsumed = (node: ViewTreeNode): boolean => {
      if (node.keys.length == 0) return true
      const other_nodes = nodes.filter(a => a != node)
      return other_nodes.some(a => a.keys.isSuperset(node.keys))
    }

    const is_isolated = (v: string): boolean => {
      return nodes.filter(a => a.keys.includes(v)).length == 1
    }

    let changing = true
    let old_len = 0
    while(changing) {
      nodes.forEach(node => {
        old_len = node.keys.length
        node.keys = node.keys.filter(v => !is_isolated(v))
        changing = node.keys.length != old_len
      })

      old_len = nodes.length
      nodes = nodes.filter(a => !is_subsumed(a))
      changing = nodes.length != old_len
    }

    return nodes
  }

  // get the view tree containing the views that are necessary for the dynamic relations
  get_filtered_view_tree(dynamic_relations: string[]): ViewTreeNode {
    // const tree = original_view_tree.copy()
    const tree = this.get_view_tree(dynamic_relations)

    // pre-order check the usefulness of the views
    // and ditch the useless views
    const keep_only_useful_views_below = (root: ViewTreeNode): [ViewTreeNode[], ViewTreeNode[]] => {
      let useful_children: ViewTreeNode[] = [] 
      for (let i = 0; i < root.children.length; i++) {
        for (let j = 0; j < root.children.length; j++) {
          if (i == j) continue

          // every pair of distinct child views
          if (root.children[j].relations.intersection(dynamic_relations).length > 0
            // && root.children[i].name == "V"
            && !useful_children.includes(root.children[i])
            // && !root.children[i].keys.equals(root.keys)
            ) {
            useful_children.push(root.children[i])
          } 
        }
      }

      // filter out child views that have the same keys with their parent views
      useful_children = useful_children.filter(c => {
        if (c.children.length == 1 && c.children[0].keys.equals(c.keys)) 
          return false
        return true
      })

      const useless_children = root.children.difference(useful_children)
      const [useful_views_below_useless_children, useless_views_below_useless_children] = useless_children
        .map(c => keep_only_useful_views_below(c))
        .reduce(([useful_l, useless_l], [useful_r, useless_r]) => [useful_l.union(useful_r), useless_r.union(useless_l)], 
        [[], []])


      // prompt useful views that below useless children up
      // by linking them to the current view
      return [[...useful_children, ...useful_views_below_useless_children], [...useless_children, ...useless_views_below_useless_children]]
    }

    // pre-order apply
    const filter_children = (root: ViewTreeNode) => {
      const [useful_children, useless_views] = keep_only_useful_views_below(root)
      root.compressed_views = [...root.compressed_views, ...useless_views]
      root.children = useful_children
      root.children.forEach(c => filter_children(c))
    }
    
    
    filter_children(tree)

    this.append_relations(tree)
    this.add_indicator_projections(tree)
    tree.to_svg_tree(this)

    return tree
  }

    // traverse the view tree, for each view
  // append the view.relations - (relations in view.children)
  // i.e., append only the relations that should be in this level
  append_relations(tree: ViewTreeNode, dynamic_relations?: string[]) {

    tree.post_order_apply(view => {
      if (view.name != "V") return

      const relations_below = view.children.reduce((child_relations: string[], c: ViewTreeNode) => child_relations.union(c.relations), [])
      let relations_this_level = view.relations.difference(relations_below)
      if (dynamic_relations)
       relations_this_level = relations_this_level.intersection(dynamic_relations)

      const relation_nodes: ViewTreeNode[] = relations_this_level.map((name: string) => {
        const atom = this.atom_by_name[name]
        return new ViewTreeNode(atom.name, "", atom.variables, [atom.name], [])
      })

      view.children.push(...relation_nodes)

    })

  }

  get_view_tree(dynamic_relations: string[]): ViewTreeNode {
    const [vo, inserted] = this.get_best_succinct_variable_order(dynamic_relations.map(r_name => this.atom_by_name[r_name]))
    this.update_descendent_dep(dynamic_relations)

    // const inserted = this.free_variables.union(this.join_variables)
    // const inserted = this.join_variables
    const uninserted = this.variables.difference(inserted)

    // insert the non-join variables in each atoms to the succinct variable order
    this.atoms.forEach(atom => {
      vo.append_relation(atom, inserted, uninserted, this)
    })

    // process the variable order
    const processed_vo = this.variable_order_to_view_tree(vo)
    processed_vo.to_svg_tree(this)
    return processed_vo
  }

  // return: [variable order, variables that are in the succinct variable order]
  get_best_succinct_variable_order(dynamic_relations: Atom[]): [Node,string[]] {

    // get the variable orders with only join variables
    const join_variables = this.join_variables
    const free_variables = this.free_variables

    // console.log(join_variables, free_variables, join_variables.intersection(free_variables));
    const free_join_variables = join_variables.intersection(free_variables)
    
    // 这里的原因是，free variables 需要放在最上面
    // 所以要先把那些必须要在上面的选出来放到 variable orders 里面
    // 然后再放其他的
    // 这样保证这些选中的 variables 一定在最上面

    // 对于所有的 atoms 
    // 先看有没有 free and join
    // 如果没有 就退而求其次, 任意一个 free variable 哪怕不是 join variables
    // 如果还没有，说明没有什么 variable 应该在其他之上，所以公平竞争
    const free_top_variables = this.atoms.flatMap(atom => {
      // const atom_free 
      const atom_free_join_vars = atom.variables.intersection(free_join_variables)
      if (atom_free_join_vars.length == 0) {
        const atom_free_vars = atom.variables.intersection(free_variables)
        if (atom_free_vars.length > 0 && atom_free_vars.length > 0) 
          atom_free_join_vars.push(atom_free_vars[0])
      }
      // if (atom_free_join_vars.length == 0 &&join_variables.length > 0) {
      //   atom_free_join_vars.push(join_variables[0])
      // }
      // if (atom_free_join_vars.length == 0 && atom.variables.length > 0) {
      //   atom_free_join_vars.push(atom.variables[0])
      // }
      
      return atom_free_join_vars
    }).unique()
    // console.log({free_join_variables, free_top_variables});
    // console.log(free_top_variables)
    
    
  
    // 先把 free_top_variables 放进去
    const free_join_top_variable_orders = this.expand_variable_orders([], free_top_variables.reverse(), false)
    // 再放 其他的 variables 
    const succinct_variable_orders = this.expand_variable_orders(free_join_top_variable_orders, join_variables.difference(free_top_variables), true)

    

    // const succinct_variable_orders = this.get_free_top_variable_orders(join_variables.union(free_variables))

    const vo_width_tuples: [Node, number][] = succinct_variable_orders.map(vo => [vo, vo.static_width(this)])


    // order the variable orders by some conditions
    // 1. width
    // 2. the depth of the dynamic relations
    // 3. balance / depth
    // console.log(dynamic_relations);
    const best_vo_width_tuple = vo_width_tuples.sort(([vo1, w1], [vo2, w2]) => {
      if (w1 != w2) return w1 - w2 // width

      // dynamic relations depth
      let dynamic_depth_1 = 0
      let dynamic_depth_2 = 0
      dynamic_relations.forEach(dynamic_relation => {
        dynamic_depth_1 += vo1.lowest_node_of_variables(dynamic_relation.variables.intersection(join_variables))[2].length // length of path
        dynamic_depth_2 += vo2.lowest_node_of_variables(dynamic_relation.variables.intersection(join_variables))[2].length // length of path
      })
      if (dynamic_depth_1 != dynamic_depth_2) 
        return dynamic_depth_1 - dynamic_depth_2

      // balance
      return vo1.depth() - vo2.depth()
    })
    
    // const best_vo_width_tuple = vo_width_tuples.reduce((best_vo_width, vo_width) => {
    //   return best_vo_width[1] < vo_width[1] ? best_vo_width : vo_width
    // })

    return [best_vo_width_tuple[0][0], free_top_variables.union(join_variables)]
  }


  get_best_variable_order(dynamic_relations: string[]): Node {

    const [best_succinct_variable_order, inserted_variables] = this.get_best_succinct_variable_order(dynamic_relations.map(r_name => this.atom_by_name[r_name]))

    const free_variables = this.free_variables
    const join_variables = this.join_variables
    const free_join_variables = free_variables.intersection(join_variables)

    // append non-join free variables
    const non_join_free_variables = free_variables.difference(join_variables).difference(inserted_variables)
    this.atoms.forEach(atom => {
      best_succinct_variable_order.append_variables(atom.variables.intersection(non_join_free_variables), atom.variables.intersection(free_join_variables))
    })

    // append non-join bound variables
    const non_join_bound_variables = this.variables.difference(free_variables).difference(join_variables).difference(inserted_variables)
    this.atoms.forEach(atom => {
      best_succinct_variable_order.append_variables(atom.variables.intersection(non_join_bound_variables), atom.variables.intersection(join_variables))
    })

    this.update_key_sets(best_succinct_variable_order)

    return best_succinct_variable_order
  }

  permutator(inputArr: any[]): any[][] {
    let result:any[] = [];
  
    const permute = (arr:any[], m:any[] = []) => {
      if (arr.length === 0) {
        result.push(m)
      } else {
        for (let i = 0; i < arr.length; i++) {
          let curr = arr.slice();
          let next = curr.splice(i, 1);
          permute(curr.slice(), m.concat(next))
       }
     }
   }
  
   permute(inputArr)
  
   return result;
  }

  get_free_linked_list(free_variables:string[]): Node[] {
    
    const linked_list = free_variables.map((v, i, variables) => {
      // if (i )
      const variables_above_me = variables.slice(i+1)
      return new Node(v,
        [],
        variables_above_me,
        variables_above_me
      )
    })
    // link them together
    for (let i = 0; i < linked_list.length-1; i++) {
      linked_list[i+1].child_nodes.push(linked_list[i])
    }
    

    // lowest_node.child_nodes.push(head_node)
    return linked_list.reverse()
  }

  /**
   * starting from the input variable orders, return all possible vos after inserting variables
   * @param variable_orders 
   * @param variables 
   * @param update_key_sets 
   */
  expand_variable_orders(variable_orders: Node[], variables: string[], update_key_sets: boolean = true): Node[] {

    // console.log(variable_orders, variables);

    if (variables.length == 0) {
      return variable_orders
    }
    

    let frontier: { variable_order: Node; starting_node?: Node; remaining_variables: string[] }[] = variable_orders.map(vo => {
      return {
        variable_order: vo,
        starting_node: undefined,
        remaining_variables: variables,
      }
    })

    // put a dumb init state incase it is empty
    if (frontier.length == 0) {
      frontier.push({
        variable_order: new Node("", [], [], []),
        starting_node: undefined,
        remaining_variables: variables,
      })
    }

    const constructed_variable_orders = []
    while (frontier.length > 0) {

      const state = frontier.pop()
      if (!state) break

      if (state.remaining_variables.length == 0) {
        constructed_variable_orders.push(state.variable_order)
        continue
      }
      frontier = frontier.concat(this.expand(state))
    }

    if (update_key_sets) {
      constructed_variable_orders.forEach(vo => {
        this.update_key_sets(vo)
      })
    }

    return constructed_variable_orders

  }

  get_free_top_variable_orders(initial_variables?: string[]): Node[] {
    // DFS ..
    const remaining_variables = initial_variables || this.get_variables()

    const free_remaining_variables = remaining_variables.filter(v => this.free_variables.includes(v))
    const bound_remaining_variables = remaining_variables.filter(v => !this.free_variables.includes(v))

    const dumb_init_state = {
      variable_order: new Node("", [], [], []),
      starting_node: undefined,
      remaining_variables: initial_variables || this.get_variables(),
    }

    let frontier: { variable_order: Node; starting_node?: Node; remaining_variables: string[] }[] = [dumb_init_state]


    if (free_remaining_variables.length != 0) {
      const free_remaining_variable_permutation: string[][] = this.permutator(free_remaining_variables)
      frontier = free_remaining_variable_permutation.map(free_vars => {
        const l = this.get_free_linked_list(free_vars)
        // console.log(free_vars);

        // l.forEach(vo => {
        //   console.log(vo.draw_tree(true));
        // })
        
        return {
          variable_order: l[0],
          starting_node: l[l.length - 1], // only add starting from the tail of the head variables
          remaining_variables: bound_remaining_variables,
        }
      })
    }

    // console.log(frontier);
    


    let constructed_variable_orders = []

    while (frontier.length > 0) {

      const state = frontier.pop()
      if (!state) break

      if (state.remaining_variables.length == 0) {
        constructed_variable_orders.push(state.variable_order)
        continue
      }
      frontier = frontier.concat(this.expand(state))
    }

    // const target_free_remaining_variables = free_remaining_variables.slice(1)
    // constructed_variable_orders = 
    constructed_variable_orders.forEach(vo => {
      // const l = this.get_free_linked_list(target_free_remaining_variables)

      // new_tail.child_nodes.push(body)
      
      // this.add_anc(body, target_free_remaining_variables)
      this.update_key_sets(vo)
      // return new_head
    })

    // const A_top_vo = constructed_variable_orders
    // A_top_vo.forEach(vo => {
    //   console.log(vo.draw_tree(true))
    //   console.log(vo.static_width(this));
    // })
    return constructed_variable_orders

  }

  add_anc(root: Node, anc: string[]) {
    root.post_order_apply(n => {
      n.anc.push(...anc)
    })
  }

  update_key_sets(root: Node) {
    root.post_order_apply(node => {
      const node_dependent_variables = node.descendent_variables().flatMap(v => this.dep[v]).union(this.dep[node.variable])
      node.key_set = node_dependent_variables.intersection(node.anc)

    })
  }

  widths(): { delta_width: number; static_width: number; variable_order: string } {
    const free_top_variable_orders = this.get_free_top_variable_orders()
    const delta_widths = free_top_variable_orders.map(vo => vo.delta_width(this))
    const static_widths = free_top_variable_orders.map(vo => vo.static_width(this))

    const target_delta_width = Math.min(...delta_widths)
    const target_static_width = Math.min(...static_widths)

    for (let i = 0; i < free_top_variable_orders.length; i++) {
      if (delta_widths[i] == target_delta_width && static_widths[i] == target_static_width) {
        return {
          delta_width: delta_widths[i],
          static_width: static_widths[i],
          variable_order: draw_tree(free_top_variable_orders[i], (node: Node) => (this.free_variables.includes(node.toString()) ? `(${node})` : `${node}`), (node: Node) => node.child_nodes)
        }
      }
    }
    console.assert(false, 'Should not reach here')
    return { delta_width: -1, static_width: -1, variable_order: "" }
  }

  /*
   * expand the state
   */
  expand(state: { variable_order: Node; starting_node?: Node; remaining_variables: string[] }): { variable_order: Node; starting_node?: Node; remaining_variables: string[] }[] {
    
    const { variable_order, starting_node, remaining_variables } = state
    if (remaining_variables.length == 0) {
      return []
    }

    const free_remaining_variables = remaining_variables.filter(v => this.free_variables.includes(v))
    const target_variables = free_remaining_variables.length == 0 ? remaining_variables : free_remaining_variables

    const res = target_variables.flatMap(v => {

      const result_variable_orders = variable_order.add_node(v, starting_node ? starting_node.variable : "", false, this)
        .filter(vo => {
          // check whether the position is ok
          const { found, path } = vo.path_to_variable(v)
          for (let i = 0; i < path.length - 1; i++) {
            const node = path[i]
            const next_node = path[i + 1]
            const found_incorrect = node.child_nodes.filter(child_node => child_node.variable != next_node.variable)
              .some(child_node => child_node.contains_variables(this.dep[v]))
            if (found_incorrect)
              return false
          }
          return true
        })

      return result_variable_orders.map(vo => {
        return {
          variable_order: vo,
          starting_node,
          remaining_variables: remaining_variables.filter(_v => _v != v) // remaining_variables - v
        }
      })
    })

    return res
  }


}

export const parse_query_text = function (new_query_text: String): Query {
  let [query_part, atom_part] = new_query_text.replace(/\s/g, '').split('=')
  if (!query_part || !atom_part) {
    throw new Error("Doesn't find the = ")
  }

  if (query_part.split('(').length <= 1)
    throw new Error("cannot find the attributes")
  const query_name = query_part.split('(')[0]
  const free_variables = query_part.split('(')[1].replace(')', '').split(',')

  if (atom_part.split('),').length == 0)
    throw new Error("invalid atom part ")


  const atoms: Atom[] = atom_part.split('),').map(atom_text => {
    if (atom_text.split('(').length <= 1)
      throw new Error("some atom text is invalid")

    const atom_name = atom_text.split('(')[0]
    const variables = atom_text.split('(')[1].replace(')', '').split(',')
    return new Atom(atom_name, variables)
  })

  return new Query(query_name, free_variables, atoms)
}

// export const get_dtree_file = function ()

export default Query