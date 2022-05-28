import {get} from 'lodash'
import {Node, CallExpression} from 'src/types'
import {
  TIME_RANGE_START,
  TIME_RANGE_STOP,
  WINDOW_PERIOD,
} from 'src/variables/constants'

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
  return get(node, 'location.source') == `v.${WINDOW_PERIOD}`
}

export function isTimeRangeStartVariableNode(node: Node) {
  return get(node, 'location.source') == `v.${TIME_RANGE_START}`
}

export function isTimeRangeStopVariableNode(node: Node) {
  return get(node, 'location.source') == `v.${TIME_RANGE_STOP}`
}

export function isVariableDeclaration(node: Node) {
  return get(node, 'type') === 'VariableAssignment'
}
