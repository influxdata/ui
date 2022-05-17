import {FluxFunction} from 'src/types/shared'
import {CLOUD} from 'src/shared/constants'
import {FROM, UNION} from 'src/shared/constants/fluxFunctions'
import {isFlagEnabled} from 'src/shared/utils/featureFlag'

export const isPipeTransformation = (func: FluxFunction) => {
  if (CLOUD && isFlagEnabled('fluxDynamicDocs')) {
    return func.fluxType.startsWith('<-', 1)
  }
  return !['from', 'union'].includes(func.name)
}

export const functionRequiresNewLine = (funcName: string): boolean => {
  switch (funcName) {
    case FROM.name:
    case UNION.name: {
      return true
    }
    default:
      return false
  }
}

export enum InjectionType {
  OnOwnLine = 'onOwnLine',
  SameLine = 'sameLine',
}

export interface InjectionPosition {
  row: number
  column: number
  shouldStartWithNewLine: boolean
  shouldEndInNewLine: boolean
}

export function calcInjectionPosition(editor, type: InjectionType) {
  const {lineNumber, column: col} = editor.getPosition()
  let row = lineNumber
  let column = col

  const queryText = editor.getModel().getValue()
  const split = queryText.split('\n')
  const getCurrentLineText = () => {
    // row is not zero indexed in monaco editor. 1..N
    return (split[row - 1] || split[split.length - 1]).trimEnd()
  }

  let currentLineText = getCurrentLineText()
  // column is not zero indexed in monnao editor. 1..N
  let textAheadOfCursor = currentLineText.slice(0, column - 1).trim()
  let textBehindCursor = currentLineText.slice(column - 1).trim()

  // if cursor has text in front of it, and should be onOwnRow
  if (type == InjectionType.OnOwnLine && textAheadOfCursor) {
    row++
    column = 1
  }
  // edge case for when user toggles to the script editor
  // this defaults the cursor to the initial position (top-left, 1:1 position)
  const [currentRange] = editor.getVisibleRanges()
  if (row === 1 && column === 1) {
    row = currentRange.endLineNumber + 1
  }

  if (row !== lineNumber) {
    currentLineText = getCurrentLineText()
    textAheadOfCursor = currentLineText.slice(0, column - 1).trim()
    textBehindCursor = currentLineText.slice(column - 1).trim()
  }

  let shouldEndInNewLine = false
  // if cursor has text behind it, and should be onOwnRow
  if (type == InjectionType.OnOwnLine && textBehindCursor) {
    shouldEndInNewLine = true
  }

  const cursorInMiddleOfText = textAheadOfCursor && textBehindCursor
  if (type == InjectionType.OnOwnLine && cursorInMiddleOfText) {
    row++
    column = 1
    shouldEndInNewLine = true
  }

  // if we asked to insert on a row out-of-range
  // then need to manually append newline to front of row
  const shouldStartWithNewLine = row > currentRange.endLineNumber

  return {row, column, shouldStartWithNewLine, shouldEndInNewLine}
}
