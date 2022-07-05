// Libraries
import {isObject} from 'lodash'

import {VariableAssignment, Expression, Property} from 'src/types/ast'

/*
  Find all nodes in a tree matching the `predicate` function. Each node in the
  tree is an object, which may contain objects or arrays of objects as children
  under any key.
*/
export const findNodes = (
  node: any,
  predicate: (node: any) => boolean,
  acc: any[] = []
) => {
  if (predicate(node)) {
    acc.push(node)
  }

  for (const value of Object.values(node)) {
    if (isObject(value)) {
      findNodes(value, predicate, acc)
    } else if (Array.isArray(value)) {
      for (const innerValue of value) {
        findNodes(innerValue, predicate, acc)
      }
    }
  }

  return acc
}

export type ScopeVariableAssignedNodeT =
  | VariableAssignment
  | Expression
  | Property

export interface AstScope {
  [variableIdentifier: string]: ScopeVariableAssignedNodeT
}
