import {Node, CallExpression} from 'src/types'
import {
  TIME_RANGE_START,
  TIME_RANGE_STOP,
  WINDOW_PERIOD,
} from 'src/variables/constants'

export function isNowCall(node: CallExpression): boolean {
  return node?.callee && (node?.callee as any).name === 'now'
}

export function isTimeCall(node: CallExpression): boolean {
  return node?.callee && (node?.callee as any).name === 'time'
}

export function isRangeNode(node: Node) {
  return (
    (node as any).callee &&
    ((node as CallExpression)?.callee as any).type === 'Identifier' &&
    (node as any).callee &&
    ((node as CallExpression)?.callee as any).name === 'range'
  )
}

export function isWindowPeriodVariableNode(node: Node) {
  return node?.location?.source == `v.${WINDOW_PERIOD}`
}

export function isTimeRangeStartVariableNode(node: Node) {
  return node?.location?.source == `v.${TIME_RANGE_START}`
}

export function isTimeRangeStopVariableNode(node: Node) {
  return node?.location?.source == `v.${TIME_RANGE_STOP}`
}

export function isVariableDeclaration(node: Node) {
  return node?.type == 'VariableAssignment'
}
