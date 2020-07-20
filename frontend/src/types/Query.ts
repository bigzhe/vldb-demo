// type GreetingLike = string | (() => string) | MyGreeter;
type RelationInfo = { name: string, variables: string[], selected?: boolean, selected_variables?: string[], indeterminate?: boolean, checkAll?: boolean }
type QueryInfo = { name: string, relations: RelationInfo[], free_variable_relation: RelationInfo }
// 
type VariableInfo = { 
  [_: string]: { 
    isCategorical: boolean,
    dataType: string,
  } 
}

type Dataset = { name: string; category: string; dataPrepared: boolean, variableInfo: VariableInfo, relations: RelationInfo[] }

export {RelationInfo, QueryInfo, VariableInfo, Dataset}
