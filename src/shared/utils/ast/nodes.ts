import {get} from 'lodash'
import {Node, CallExpression} from 'src/types'

export function isNowCall(node: CallExpression): boolean {
  return get(node, 'callee.name') === 'now'
}

export function isTimeCall(node: CallExpression): boolean {
  return get(node, 'callee.name') === 'time'
}

export function isRangeNode(node: Node) {
  return (
    get(node, 'callee.type') === 'Identifier' &&
    get(node, 'callee.name') === 'range'
  )
}

export function isWindowPeriodVariableNode(node: Node) {
  return get(node, 'location.source') == 'v.windowPeriod'
}

export function isVariableDeclaration(node: Node) {
  return get(node, 'type') === 'VariableAssignment'
}
