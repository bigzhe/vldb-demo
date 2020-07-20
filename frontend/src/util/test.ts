import "./ArrayExtensions"
// import Query from "./Query"
// import Node from "./Node"
// import draw_tree from "./asciitree";
import {parse_query_text} from "./Query";
import ViewTreeNode from './ViewTreeNode';

// const Q = new Query('Q', ['A'], [R, S])
// const Q = parse_query_text("Q_5-path(E,F) = R(A,B),S(B,C),T(C,D),U(D,E),W(E,F)")
// const Q = parse_query_text("Q() = R(A,B),S(B,C),T(C,A)")
// const Q = parse_query_text("Q() = R(A,B),S(B,C),T(C,D)")
// const Q = parse_query_text("Q() = R(A,B),S(B,C),T(C,D),U(D,E),W(E,F)")
const Q = parse_query_text("Q(A,B,C,D,E,F) = R(A,B),S(B,C),T(C,D),U(D,E),W(E,F)")

// const Q = parse_query_text("Q(B,E,D) = R(A,B),S(A,C,E),T(C,D)")
// const Q = parse_query_text("Q() = R(A,B)")

const best_succinct_vo = Q.get_best_succinct_variable_order([])
console.log(best_succinct_vo[0].draw_tree(true))

// const l = Q.get_free_linked_list(Q.free_variables)
// l.forEach(vo => {
//   console.log(vo.draw_tree(true));
// })

// const top_vos = Q.get_free_top_variable_orders()
// top_vos.forEach(vo => {
  // console.log(vo.draw_tree(true));
// })



// Q.GYO(Q.atoms)
// console.log("TCL: Q.GYO(Q.atoms)", Q.GYO([
//   new ViewTreeNode("R", "", ["A", "B"], ["R"], []),
//   new ViewTreeNode("S", "", ["B", "C"], ["S"], []),
//   new ViewTreeNode("T", "", ["C", "D"], ["T"], []),
// ]))
// console.log(Q.get_best_succinct_variable_order().draw_tree(true))
// console.log(Q.dep)
const best_vo = Q.get_best_variable_order([])

console.log(best_vo.lowest_node_of_variables(["A","B"])[2].length)


console.log(best_vo.static_width(Q));

console.log(best_vo.draw_tree(true));



// console.log(best_vo.draw_tree(true))
// console.log(Q.get_best_succinct_variable_order().draw_tree(true))
// console.log(Q.get_view_tree().draw_tree())

// const b = 0;


// const widths = Q.widths()
// console.log('static width: ', widths.static_width)
// console.log('delta width: ', widths.delta_width)
// console.log(widths.variable_order)


