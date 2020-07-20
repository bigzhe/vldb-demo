import Query from "./Query"
import Atom from "./Atom"
import draw_tree from "./asciitree";
import "./ArrayExtensions"
import ViewTreeNode from "./ViewTreeNode";


class Node {

  public readonly variable:string
  public child_nodes:Node[]
  public key_set:string[]
  public anc: string[]
  public view_tree_children: ViewTreeNode[]


  constructor(variable:string, child_nodes:Node[] = [], key_set:string[] = [], anc:string[] = [], view_tree_children: ViewTreeNode[] = []) {
    this.variable = variable
    this.child_nodes = child_nodes
    this.key_set = key_set
    this.anc = anc
    this.view_tree_children = view_tree_children
  }

  draw_tree(show_key_set :boolean = false):string {
    if (show_key_set)
      return draw_tree(this, (node: Node) => `${node.variable} {${[...node.key_set]}} {${[...node.anc]}}`, (node:Node) => node.child_nodes)
    else
      return draw_tree(this, (node: Node) => `${node.variable}`, (node:Node) => node.child_nodes)
  }

  pre_order_apply(apply: (view: Node) => void) {
    apply(this)
    this.child_nodes.forEach(n => {
      n.pre_order_apply(apply)
    })
  }

  post_order_apply(apply: (view: Node) => void) {
    this.child_nodes.forEach(n => {
      n.post_order_apply(apply)
    })
    apply(this)
  }

  descendent_variables(): string[] {
    const descendent_variables_helper = (node: Node): string[] => [node.variable, ...node.child_nodes.flatMap(n => descendent_variables_helper(n))]

    return descendent_variables_helper(this).difference([this.variable])
  }

  append_relation(atom: Atom, inserted_variables: string[], uninserted_variables: string[], query: Query) {

    // we care only the variables in the atom
    uninserted_variables = atom.variables.intersection(uninserted_variables)
    inserted_variables = inserted_variables.intersection(atom.variables)

    const [found, lowest_node] = this.lowest_node_of_variables(inserted_variables)
    if (!found)
      throw new Error("Don't find the atom_lowest node")

    // append the relation to this lowest_node
    const relation_node: ViewTreeNode = new ViewTreeNode(atom.name, "", atom.variables, [atom.name], [])

    if (uninserted_variables.length == 0) {
      //  append only the relation
      lowest_node.view_tree_children.push(relation_node)
      return
    }

    // append also the view that aggregates away everything
    const boundary_variable = uninserted_variables[0]
    const boundary_variable_key_set = inserted_variables.union(query.free_variables.intersection(atom.variables))

    const boundary_node = new ViewTreeNode("V",
      boundary_variable,
      boundary_variable_key_set,
      [relation_node.name],
      [relation_node])
      
    // TODO: add compressed nodes
    boundary_node.compressed_views = relation_node.keys.difference(boundary_variable_key_set).difference([boundary_variable]).map(v => new ViewTreeNode("V", v, [],[], []))

    lowest_node.view_tree_children.push(boundary_node)

  }

  get_linked_list(variables:string[], anc_vars: string[] = []): Node[] {
    
    const linked_list = variables.map((v, i, variables) => {
      // if (i )
      const variables_above_me = variables.slice(i+1)
      return new Node(v,
        [],
        [...anc_vars, ...variables_above_me],
        [...anc_vars, ...variables_above_me],
      )
    })
    // link them together
    for (let i = 0; i < linked_list.length-1; i++) {
      linked_list[i+1].child_nodes.push(linked_list[i])
    }
    

    // lowest_node.child_nodes.push(head_node)
    return linked_list.reverse()
  }

  /*
    1. find the lowest node that covers prefix_variables in its ancestors
    2. add the variables below this lowest_node as a linked list
    3. if variable_permutation is enabled, we need to append linked lists with different orders to the lowest_node
    4. otherwise we append it with any order
  */
  append_variables(variables_to_be_inserted: string[], prefix_variables: string[]) {
    
    if (variables_to_be_inserted.length == 0) {
      return
    }

    const [found, lowest_node] = this.lowest_node_of_variables(prefix_variables)
    if (!found)
      throw new Error("did not find the lowest node")
    
    const linked_list = this.get_linked_list(variables_to_be_inserted, [lowest_node.variable, ...lowest_node.anc])

    lowest_node.child_nodes.push(linked_list[0])
  }


  /*
   * return a list of variable orders
   * create a new copy of the node as long as itself or its decedents are modified
   */
  add_node(variable:string, boundary_variable: string, below_boundary: boolean, query:Query): Node[] {

    // 如果没有 boundary_variable, 就都可以搞
    if (!boundary_variable) {
      below_boundary = true
    }
    
    // if the current node is empty, add to the current node
    if (!this.variable) {
      // root node
      return [new Node(variable, this.child_nodes, this.key_set, this.anc)]
    }

    if (this.variable == boundary_variable) {
      below_boundary = true
    }

    let resulted_variable_orders:Node[] = []

    // add to child nodes
    const res = this.child_nodes.flatMap((child_node, i) => {
      const other_child_nodes = this.child_nodes.filter(n => n.variable != child_node.variable)

      return child_node.add_node(variable, boundary_variable, below_boundary, query).map(new_child_node => {
        const self = new Node(
          this.variable,
          [...other_child_nodes, new_child_node],
          this.key_set,
          this.anc,
        ) // a copy of the current node with out the changed new_child_node
        // self.child_nodes.push(new_child_node)
        return self
      })
    })
    resulted_variable_orders = resulted_variable_orders.concat(res)


    // if it is not below or at the boundary, we would not go down
    if (below_boundary) {
      // add as the child node of the current node
      resulted_variable_orders.push(
        new Node(this.variable,
          [...this.child_nodes, new Node(variable, [], [...this.anc, this.variable].intersection(query.dep[variable]), [...this.anc, this.variable])],
          this.key_set, this.anc)
      )
    }

    return resulted_variable_orders

  }

  append_variables2(atom: Atom, inserted_variables: string[], uninserted_variables: string[], query: Query) {

    // we care only the variables in the atom
    uninserted_variables = atom.variables.intersection(uninserted_variables).reverse()
    inserted_variables = inserted_variables.intersection(atom.variables)
    
    if (uninserted_variables.length == 0)
      return

    const [found, lowest_node] = this.lowest_node_of_variables(inserted_variables.union(query.free_variables))
    if (!found)
      throw new Error("Don't find the atom_lowest node")

    // append the variables to this lowest_node
    // key set is the inserted_variables: anc \cap atom.variables
    const tail_node = new Node(uninserted_variables[0], [], inserted_variables, [...lowest_node.anc,  lowest_node.variable])

    const head_node = uninserted_variables.slice(1).reduce((current_node: Node, parent_variable: string, idx, variables) => {
      // build a node for parent_variable, and in the current_node in the child_nodes
      const variables_above_me = variables.slice(idx+1) // the variables from this node to the lowest_node
      return new Node(parent_variable,
        [current_node],
        [...inserted_variables, ...variables_above_me],
        [...lowest_node.anc, lowest_node.variable, ...variables_above_me]
      )
    }, tail_node)

    lowest_node.child_nodes.push(head_node)
  }

  lowest_node_of_variables(target_variables: string[]): [boolean, Node, Node[]] {

    // only search the remaining variables
    if (target_variables.includes(this.variable)) {
      target_variables = target_variables.filter(v => v !== this.variable) // remove this variable
    }

    if (target_variables.length == 0)
      return [true, this, [this]]

    for (let i = 0; i < this.child_nodes.length; i++) {
      const [found, lowest_node, path] = this.child_nodes[i].lowest_node_of_variables(target_variables)
      if (found) {
        return [true, lowest_node, [this, ...path]]
      }
    }

    // throw new Error("cannot find the path that covers the target variables " + target_variables)
    return [false, this, []]
  }

  depth(): number {
    const depth_helper = (node: Node): number => {
      if (node.child_nodes.length == 0) return 0
      return Math.max(...node.child_nodes.map(c => depth_helper(c))) + 1
    }
    return depth_helper(this)
  }

  /*
   * return a list of variable orders
   * create a new copy of the node as long as itself or its decedents are modified
   */
  add_node2(variable:string, boundary_variable: string, below_boundary: boolean, query:Query): Node[] {

    // 如果没有 boundary_variable, 就都可以搞
    if (!boundary_variable) {
      below_boundary = true
    }
    
    // if the current node is empty, add to the current node
    if (!this.variable) {
      // root node
      return [new Node(variable, this.child_nodes, this.key_set, this.anc)]
    }

    if (this.variable == boundary_variable) {
      below_boundary = true
    }

    let resulted_variable_orders:Node[] = []

    // add to child nodes
    const res = this.child_nodes.flatMap((child_node, i) => {
      const other_child_nodes = this.child_nodes.filter(n => n.variable != child_node.variable)

      return child_node.add_node(variable, boundary_variable, below_boundary, query).map(new_child_node => {
        const self = new Node(
          this.variable,
          [...other_child_nodes, new_child_node],
          this.key_set,
          this.anc,
        ) // a copy of the current node with out the changed new_child_node
        // self.child_nodes.push(new_child_node)
        return self
      })
    })
    resulted_variable_orders = resulted_variable_orders.concat(res)


    // if it is not below or at the boundary, we would not go down
    if (below_boundary) {
      // add as the child node of the current node
      resulted_variable_orders.push(
        new Node(this.variable,
          [...this.child_nodes, new Node(variable, [], [...this.anc, this.variable].intersection(query.dep[variable]), [...this.anc, this.variable])],
          this.key_set, this.anc)
      )
    }

    return resulted_variable_orders

  }

  path_to_variable(target_variable:string): { found: boolean; path: Node[]; } {
    if (this.variable == target_variable)
      return {
        found: true,
        path: [this]
      }
    if (this.child_nodes.length == 0)
      return {
        found: false,
        path: []
      }

    for (let i = 0; i < this.child_nodes.length; i++) {
      const {found, path} = this.child_nodes[i].path_to_variable(target_variable)
      if (found)
        return {
          found: true,
          path: [this, ...path],
        }
    }

    return {
      found: false,
      path: []
    }
  }

  contains_variables(variables:string[]): boolean {
    if (variables.includes(this.variable))
      return true

    return this.child_nodes.some(child_node => child_node.contains_variables(variables))
  }

  rho(atoms: Atom[], key_set:string[]):number {

    const cover_sets = atoms.map(atom => atom.variables).subsets()
    const valid_cover_sets = cover_sets.filter(cover_set => cover_set.flat().isSuperset(key_set))
    console.assert(valid_cover_sets.length >= 0)
    return Math.min(...valid_cover_sets.map(s => s.length))
  }

  static_width(query:Query):number {
    // const query_over_keys = query.atoms.filter(atom => atom.variables.intersection([this.variable, ...this.key_set]).length > 0).flatMap(atom => atom.variables).unique()
    // console.log(this.toString(), query_over_keys);
    

    return Math.max(this.rho(query.atoms, [this.variable, ...this.key_set]), ...this.child_nodes.map(child_node => child_node.static_width(query)))
  }

  delta_width(query:Query) {
    const res = Math.max(this.delta_width_of_this_node(query), ...this.child_nodes.map(child_node => child_node.delta_width(query)))
    return res
  }

  delta_width_of_this_node(query:Query) {
    const res = Math.max(...query.atoms_of_variables[this.variable].map(atom => this.rho(query.atoms, this.key_set.difference(atom.variables))))
    // console.log(this._variable, res)
    return res
  }

  toString() {
    return `${this.variable}`
  }
}

export default Node