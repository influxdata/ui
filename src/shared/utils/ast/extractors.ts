// Libraries
import {get} from 'lodash'

// Utils
import {findNodes} from 'src/shared/utils/ast/visitors'
import {
  isNowCall,
  isTimeCall,
  isVariableDeclaration,
} from 'src/shared/utils/ast/nodes'
import {durationToMilliseconds} from 'src/shared/utils/duration'

// Types
import {
  Node,
  CallExpression,
  Property,
  Expression,
  Identifier,
  ObjectExpression,
  DateTimeLiteral,
  DurationLiteral,
} from 'src/types'

/*
  Given a `range` call in an AST, reports the `start` and `stop` arguments the
  the call as absolute instants in time. If the `start` or `stop` argument is a
  relative duration literal, it is interpreted as relative to the current
  instant (`Date.now()`).
*/
export function rangeTimes(
  ast: any,
  rangeNode: CallExpression
): [number, number] {
  const now = Date.now()
  const properties: Property[] = (rangeNode.arguments[0] as ObjectExpression)
    .properties

  // The `start` argument is required
  const startProperty = properties.find(
    p => (p.key as Identifier).name === 'start'
  )

  const start = propertyTime(ast, startProperty.value, now)

  // The `end` argument to a `range` call is optional, and defaults to now
  const endProperty = properties.find(
    p => (p.key as Identifier).name === 'stop'
  )

  const end = endProperty ? propertyTime(ast, endProperty.value, now) : now
  if (isNaN(start) || isNaN(end)) {
    throw new Error('failed to analyze query')
  }

  return [start, end]
}

// FIXME: this should not use lookupVariable(ast, value.name)
// instead should lookup value in scope map
export function propertyTime(ast: any, value: Expression, now: number): number {
  switch (value.type) {
    case 'UnaryExpression':
      return (
        now - durationToMilliseconds((value.argument as DurationLiteral).values)
      )

    case 'DurationLiteral':
      return now + durationToMilliseconds(value.values)

    case 'StringLiteral':
    case 'DateTimeLiteral':
      return Date.parse(value.value)

    case 'Identifier':
      return propertyTime(ast, lookupVariable(ast, value.name), now)

    case 'BinaryExpression':
      const leftTime = Date.parse((value.left as DateTimeLiteral).value)
      const rightDuration = durationToMilliseconds(
        (value.right as DurationLiteral).values
      )

      switch (value.operator) {
        case '+':
          return leftTime + rightDuration
        case '-':
          return leftTime - rightDuration
        default:
          throw new Error(`unexpected operator ${value.operator}`)
      }

    case 'MemberExpression':
      const objName = get(value, 'object.name')
      const propertyName = get(value, 'property.name')
      const objExpr = lookupVariable(ast, objName) as ObjectExpression
      const property = objExpr.properties.find(
        p => get(p, 'key.name') === propertyName
      )

      return propertyTime(ast, property.value, now)

    case 'CallExpression':
      if (isNowCall(value)) {
        return now
      }
      if (isTimeCall(value)) {
        const property = get(value, 'arguments[0].properties[0]value', {})
        return propertyTime(ast, property, now)
      }

      throw new Error('unexpected CallExpression')

    default:
      throw new Error(`unexpected expression type ${value.type}`)
  }
}

/*
  Find the node in the `ast` that defines the value of the variable with the
  given `name`.
*/
export function lookupVariable(ast: Node, name: string): Expression {
  const isDeclarator = node => {
    return isVariableDeclaration(node) && get(node, 'id.name') === name
  }

  const declarator = findNodes(ast, isDeclarator)

  if (!declarator.length) {
    throw new Error(`unable to lookup variable "${name}"`)
  }

  if (declarator.length > 1) {
    throw new Error('cannot lookup variable with duplicate declarations')
  }

  const init = declarator[0].init

  return init
}
