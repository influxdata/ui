import React, {
  FC,
  createContext,
  useState,
  useCallback,
  useContext,
} from 'react'
import {EditorType} from 'src/types'
import {PipeContext} from 'src/flows/context/pipe'

export enum InjectionType {
  OnOwnLine = 'onOwnLine',
  SameLine = 'sameLine',
}

interface InjectionPosition {
  row: number
  column: number
  shouldStartWithNewLine: boolean
  shouldEndInNewLine: boolean
}

export interface InjectionOptions {
  header?: string | null
  text: string
  type: InjectionType
}

export interface EditorContextType {
  editor: EditorType | null
  setEditor: (editor: EditorType) => void
  inject: (options: InjectionOptions) => void
  calcInjectiontPosition: (type: InjectionType) => Partial<InjectionPosition>
  updateText: (t: string) => void
}

const DEFAULT_CONTEXT: EditorContextType = {
  editor: null,
  setEditor: _ => {},
  inject: _ => {},
  calcInjectiontPosition: _ => ({}),
  updateText: _ => {},
}

export const EditorContext = createContext<EditorContextType>(DEFAULT_CONTEXT)

export const EditorProvider: FC = ({children}) => {
  const [editor, setEditor] = useState<EditorType>(null)
  const {data, update} = useContext(PipeContext)
  const {queries, activeQuery} = data

  const updateText = useCallback(
    text => {
      const _queries = [...queries]
      _queries[activeQuery] = {
        ...queries[activeQuery],
        text,
      }

      update({queries: _queries})
    },
    [queries, activeQuery]
  )

  const calcInjectiontPosition = useCallback(
    (type: InjectionType): Partial<InjectionPosition> => {
      if (!editor) {
        return {}
      }
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
    },
    [editor]
  )

  const inject = useCallback(
    (options: InjectionOptions) => {
      if (!editor) {
        return {}
      }

      const {header, text: initT, type} = options
      const {
        row,
        column: initC,
        shouldStartWithNewLine,
        shouldEndInNewLine,
      } = calcInjectiontPosition(type)
      let text = ''

      if (shouldStartWithNewLine) {
        text = `\n${initT}`
      } else {
        text = initT
      }

      if (shouldEndInNewLine) {
        text = `${text}\n`
      }

      const column = type == InjectionType.OnOwnLine ? 1 : initC
      const range = new monaco.Range(row, column, row, column)
      const edits = [
        {
          range,
          text,
        },
      ]

      if (
        header &&
        !editor
          .getModel()
          .getValue()
          .includes(header)
      ) {
        edits.unshift({
          range: new monaco.Range(1, 1, 1, 1),
          text: `${header}\n`,
        })
      }

      editor.executeEdits('', edits)
      updateText(editor.getValue())
    },
    [editor, calcInjectiontPosition, updateText]
  )

  return (
    <EditorContext.Provider
      value={{
        editor,
        setEditor,
        inject,
        calcInjectiontPosition,
        updateText,
      }}
    >
      {children}
    </EditorContext.Provider>
  )
}
