import {isObject} from 'lodash'
import {
  Node,
  CallExpression,
  VariableAssignment,
  ObjectExpression,
  Identifier,
  StringLiteral,
} from 'src/types/ast'
import {WINDOW_PERIOD} from 'src/variables/constants'
import {isRangeNode} from 'src/shared/utils/ast/nodes'
import {constructWindowVarAssignmentFromRange} from 'src/shared/utils/ast/constructWindowVar'

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
      findNodes(value as Node, predicate, acc)
    } else if (Array.isArray(value)) {
      for (const innerValue of value) {
        findNodes(innerValue, predicate, acc)
      }
    }
  }

  return acc
}

export interface Scope {
  [variableIdentifier: string]: Node
}
const SCOPED_WINDOW_PERIOD = `v.${WINDOW_PERIOD}`

/*
  Find the first node matching the halt `predicate` function.
  Return the variable scope for this node.
  Follow flux scoping rules.
*/
export const findNodeScope = (
  node: Node,
  halt: (node: any) => boolean,
  whenFound: (node, acc) => {halted: boolean; scope: Scope},
  acc = {halted: false, scope: {} as Scope}
): {halted: boolean; scope: Scope} => {
  if (acc.halted) {
    return acc
  }
  if (halt(node)) {
    return whenFound(node, {...acc, halted: true})
  }
  // have seen this with range subtrees, and lambda expr
  if (!node.type) {
    let fn = recurseWithoutSharingSiblingScope
    if (isRangeNode(node)) {
      const windowVar = constructWindowVarAssignmentFromRange(
        node as any,
        node as CallExpression
      )
      acc.scope = {...acc.scope, [SCOPED_WINDOW_PERIOD]: windowVar}
      fn = recurseWITHSharingSiblingScope
    }
    if (node.hasOwnProperty('arguments')) {
      return fn((node as any).arguments, halt, whenFound, acc)
    }
    return acc
  }

  switch (node.type) {
    // Package scope
    case 'Package':
      return recurseWITHSharingSiblingScope(node.files, halt, whenFound, acc)

    // File block scope.
    // Block scope.
    // each case is an array of Statements, with shared upper/global scope.
    case 'File':
    case 'Block':
      return recurseWITHSharingSiblingScope(node.body, halt, whenFound, acc)

    // Package block scope. special-cased Statement.)
    case 'OptionStatement':
      return recurseWITHSharingSiblingScope(
        [node.assignment],
        halt,
        whenFound,
        acc
      ) // Assignment on recursive call

    // STATEMENTS.
    // Global scope per File. Do not return nested scope, unless node fnd.
    case 'ExpressionStatement':
      return recurseWithoutSharingSiblingScope(
        [node.expression],
        halt,
        whenFound,
        acc
      )

    // Statement which sets scope.
    case 'VariableAssignment':
      // v = {bar: 'foo', windowPeriod: int}
      const hasObjProps =
        node.init.hasOwnProperty('properties') ||
        node.init.type == 'ObjectExpression'
      if (hasObjProps) {
        const declarations = extractVariableSubtrees(node, node.id.name)
        // Assume siblings can consume.
        // v = {windowPeriod: time, myVar: expr(v.windowPeriod)}
        acc.scope = {...acc.scope, ...declarations}
        // to not pass along any nested declarations
        // v = {rangeStartTime: time, myVar: expr({v = {rangeStartTime: time}})}
        // in which case the inner rangeStartTime should not be overwritten
        return recurseWithoutSharingSiblingScope(
          (node.init as ObjectExpression).properties,
          halt,
          whenFound,
          acc
        )
      }
      // v = 'foo'
      acc.scope = {...acc.scope, [node.id.name]: node.init}
      return recurseWithoutSharingSiblingScope(
        [node.init],
        halt,
        whenFound,
        acc
      )


    // Member assignment is equivalent to setting an array index value.
    // Not the use case for our scope map.
    // But can still consume the halt node
    case 'MemberAssignment':
      // obj[kProperty] = Expr
      // obj can be an expr
      return recurseWithoutSharingSiblingScope(
        [node.member.object, node.init],
        halt,
        whenFound,
        acc
      )

    // EXPRESSIONS.
    // These should only set scope, if they have halt node.
    case 'ArrayExpression':
      return recurseWithoutSharingSiblingScope(
        node.elements,
        halt,
        whenFound,
        acc
      )
    case 'BinaryExpression':
    case 'LogicalExpression':
      return recurseWithoutSharingSiblingScope(
        [node.left, node.right],
        halt,
        whenFound,
        acc
      )
    case 'ConditionalExpression':
      return recurseWithoutSharingSiblingScope(
        [node.consequent],
        halt,
        whenFound,
        acc
      )
    case 'UnaryExpression':
    case 'ReturnStatement':
      return recurseWithoutSharingSiblingScope(
        [node.argument],
        halt,
        whenFound,
        acc
      )
    case 'FunctionExpression':
      return recurseWithoutSharingSiblingScope(
        [node.body],
        halt,
        whenFound,
        acc
      )
    case 'CallExpression':
      if (!node.arguments) {
        return acc
      }
      // technically the arguments are expressions which can be evaled
      return recurseWithoutSharingSiblingScope(
        node.arguments,
        halt,
        whenFound,
        acc
      )
    case 'ObjectExpression':
      return recurseWithoutSharingSiblingScope(
        node.properties,
        halt,
        whenFound,
        acc
      )
    case 'MemberExpression':
      return recurseWithoutSharingSiblingScope(
        [node.object],
        halt,
        whenFound,
        acc
      )
    case 'Property':
      // technically the value is an expr which can be evaled
      return recurseWithoutSharingSiblingScope(
        [node.value],
        halt,
        whenFound,
        acc
      )
    case 'IndexExpression':
      // technically the index is an expr which can be evaled
      return recurseWithoutSharingSiblingScope(
        [node.array, node.index],
        halt,
        whenFound,
        acc
      )
    case 'PipeExpression':
      // pipe needs to share range set earlier in the pipe
      // nested expressions (not range) will still not be shared
      return recurseWITHSharingSiblingScope(
        // order is important.
        // parse tree has the yield be the callee, and argument is everything upstream of the pipe
        [node.argument, node.call],
        halt,
        whenFound,
        acc
      )
    case 'StringExpression':
      return recurseWithoutSharingSiblingScope(node.parts, halt, whenFound, acc)
    case 'InterpolatedPart':
    case 'ParenExpression':
      return recurseWithoutSharingSiblingScope(
        [node.expression],
        halt,
        whenFound,
        acc
      )

    // Can set Identifier
    case 'ImportDeclaration':
      if (node.as) {
        return {...acc, scope: {...acc.scope, [node.as.name]: node.path}}
      }
      return recurseWithoutSharingSiblingScope(
        [node.path],
        halt,
        whenFound,
        acc
      )

    // Leaf in terms of setting scope, but may have the halt node (identifier)
    case 'PackageClause':
      return recurseWithoutSharingSiblingScope(
        [node.name],
        halt,
        whenFound,
        acc
      )
    case 'BuiltinStatement':
      return recurseWithoutSharingSiblingScope([node.id], halt, whenFound, acc)
    // Leaf
    case 'BadStatement':
    case 'Identifier':
    case 'BooleanLiteral':
    case 'DateTimeLiteral':
    case 'DurationLiteral':
    case 'FloatLiteral':
    case 'PipeLiteral':
    case 'RegexpLiteral':
    case 'StringLiteral':
    case 'UnsignedIntegerLiteral':
      return acc
    default:
      return acc
    // return assertUnreachable(node.type as never)
  }
}

function recurseWITHSharingSiblingScope(children, halt, whenFound, acc) {
  let halted = acc.halted
  for (const child of children) {
    const subtreeRes = findNodeScope(child, halt, whenFound, acc)
    // Pass along scope. Do not halt.
    acc.scope = {...acc.scope, ...subtreeRes.scope}
    halted = halted || subtreeRes.halted
  }
  return {...acc, halted}
}

function recurseWithoutSharingSiblingScope(children, halt, whenFound, acc) {
  let halted = acc.halted
  let scopeToInclude = {} as Scope
  for (const child of children) {
    const subtreeRes = findNodeScope(child, halt, whenFound, {...acc})
    // These should only set scope, if they have halt node.
    if (subtreeRes.halted) {
      scopeToInclude = {...scopeToInclude, ...subtreeRes.scope}
    }
    halted = halted || subtreeRes.halted
  }
  return {scope: {...acc.scope, ...scopeToInclude}, halted}
}

function extractVariableSubtrees(
  node: VariableAssignment,
  prependLabel: string
): Scope {
  const {properties} = node.init as ObjectExpression
  return properties.reduce((acc, p) => {
    // `v.windowPeriod` or `v.myVar`
    const bindName = `${prependLabel}.${(p.key as Identifier).name ||
      (p.key as StringLiteral).value}`
    return {...acc, [bindName]: p}
  }, {} as Scope)
}

// use for proving exhuastive switch during type checking
export function assertUnreachable(_: never): never {
  throw new Error("Didn't expect to get here")
}
