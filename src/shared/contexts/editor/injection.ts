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

export interface InjectionOptions {
  header?: string | null
  text: string
  type: InjectionType
  triggerSuggest?: boolean
  cbParentOnUpdateText: (t: string) => void
}

export function calcInjectionPosition(
  editor,
  type: InjectionType
): InjectionPosition {
  const {lineNumber, column: col} = editor.getPosition()
  let row = lineNumber
  let column = col

  const model = editor.getModel()
  if (model == null) {
    throw Error("model is null")
  }
  const queryText = model.getValue()
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
    shouldEndInNewLine = true
  }
  if (type == InjectionType.OnOwnLine) {
    column = 1
  }

  // if we asked to insert on a row out-of-range
  // then need to manually append newline to front of row
  const shouldStartWithNewLine = row > currentRange.endLineNumber

  return {row, column, shouldStartWithNewLine, shouldEndInNewLine}
}

export const moveCursorAndTriggerSuggest = (
  editor,
  {row, column, shouldStartWithNewLine, shouldEndInNewLine},
  hasHeader,
  textLength
) => {
  let columnOffset = 1
  if (shouldStartWithNewLine) {
    columnOffset++
  }
  if (shouldEndInNewLine) {
    columnOffset++
  }
  setTimeout(() => {
    editor.focus()
    editor.setPosition({
      lineNumber: hasHeader ? row + 1 : row,
      column: column + textLength - columnOffset,
    })
    editor.trigger('', 'editor.action.triggerSuggest', {})
  }, 0)
}
