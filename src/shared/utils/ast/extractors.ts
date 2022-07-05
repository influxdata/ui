// Utils
import {
  AstScope,
  isNowCall,
  isTimeCall,
  ScopeVariableAssignedNodeT,
} from 'src/shared/utils/ast'
import {durationToMilliseconds} from 'src/shared/utils/duration'

// Types
import {
  CallExpression,
  Property,
  Expression,
  Identifier,
  ObjectExpression,
  DateTimeLiteral,
  DurationLiteral,
} from 'src/types'

/**
 * Given a Range subtree, find the absolute (numeric) timeRange values.
 *
 * @param {AstScope} scope -- Scope at point in AST walk
 * @param {CallExpression} rangeNode -- AST subtree for the range
 * @returns {[number, number]} -- [startTime, endTime]
 */
export function rangeTimes(
  scope: AstScope,
  rangeNode: CallExpression
): [number, number] | never {
  const now = Date.now()
  const properties: Property[] = (rangeNode.arguments[0] as ObjectExpression)
    .properties

  // The `start` argument is required
  const startProperty = properties.find(
    p => (p.key as Identifier).name === 'start'
  )
  const start = propertyTime(scope, startProperty.value, now)

  // The `end` argument to a `range` call is optional, and defaults to now
  const endProperty = properties.find(
    p => (p.key as Identifier).name === 'stop'
  )
  const end = endProperty ? propertyTime(scope, endProperty.value, now) : now

  if (isNaN(start) || isNaN(end)) {
    throw new Error('failed to analyze query')
  }

  return [start, end]
}

/**
 * Given a Property node, recursively find the absolute (numeric) time value.
 *
 * @param scope -- Scope at point in AST walk
 * @param value -- current AST subtree
 * @param now -- static value of now()
 * @returns {number} -- Time determined for the Property node
 */
export function propertyTime(
  scope: AstScope,
  value: ScopeVariableAssignedNodeT,
  now: number
): number | never {
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
      return propertyTime(scope, lookupVariable(scope, value.name), now)

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

    case 'VariableAssignment':
      return propertyTime(scope, value.init, now)

    case 'MemberExpression':
      const objName = value.object?.type == 'Identifier' && value.object?.name
      const propertyName =
        value.property?.type == 'Identifier'
          ? value.property?.name
          : value.property.value
      if (!objName || !propertyName) {
        throw new Error(
          `malformed MemberExpression: object name ${objName} and property name ${propertyName}`
        )
      }
      const objExpr = lookupVariable(
        scope,
        `${objName}.${propertyName}`
      ) as ObjectExpression
      return propertyTime(scope, objExpr, now)

    case 'CallExpression':
      if (isNowCall(value)) {
        return now
      }
      if (isTimeCall(value)) {
        const property =
          (value.arguments[0]?.type == 'ObjectExpression' &&
            value.arguments[0].properties[0]?.value) ||
          null
        if (!property) {
          throw new Error(`did not recognize value of time expression`)
        }
        return propertyTime(scope, property, now)
      }
      throw new Error('unexpected CallExpression')

    default:
      throw new Error(`unexpected expression type ${value.type}`)
  }
}

/**
 * Given a variable, lookup the value in the scope.
 *
 * @param scope -- Scope at point in AST walk
 * @param name -- variable name to lookup
 * @returns {Expression} -- the AST node, containing the value
 */

export function lookupVariable(
  scope: AstScope,
  name: string
): Expression | never {
  if (!scope[name]) {
    throw new Error('Used variable is missing from scope')
  }
  const node = scope[name]
  switch (node.type) {
    case 'Property':
      return node.value
    case 'VariableAssignment':
      return node.init
    default:
      return node
  }
}
