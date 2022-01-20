import React, {
  FC,
  createContext,
  useState,
  useCallback,
  useMemo,
  useContext,
  useRef,
  useEffect,
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
  shouldInsertOnNextLine: boolean
}

interface InjectionOptions {
  header?: string | null
  text: string
  type: InjectionType
}

export interface EditorContextType {
  editor: EditorType | null
  register: (editor: EditorType) => void
  inject: (options: InjectionOptions) => void
  calcInjectiontPosition: (type: InjectionType) => Partial<InjectionPosition>
  updateText: (t: string) => void
}

const DEFAULT_CONTEXT: EditorContextType = {
  editor: null,
  register: _ => {},
  inject: _ => {},
  calcInjectiontPosition: _ => ({}),
  updateText: _ => {},
}

export const EditorContext = createContext<EditorContextType>(DEFAULT_CONTEXT)

export const EditorProvider: FC = ({children}) => {
  const [editor, setEditor] = useState<EditorType>(null)
  const {data, update} = useContext(PipeContext)
  const {queries, activeQuery} = data
  const query = queries[activeQuery]

  // Downstream components use these callbacks.
  // Deeply nested, memoized components.
  // Avoid vulnerability to memoization ref checks.
  // (e.g. Sidebar remaining open).
  const queryText = useRef(() => query.text)
  useEffect(() => {
    queryText.current = () => query.text
  }, [query.text])

  const register = (instance: EditorType) => {
    setEditor(instance)
  }

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
      const {lineNumber, column} = editor.getPosition()
      let row = lineNumber

      const split = queryText.current().split('\n')
      // row is not zero indexed. 1..N
      const currentLineText = (
        split[row - 1] || split[split.length - 1]
      ).trimEnd()
      const textAheadOfCursor = currentLineText.slice(0, column).trim()
      if (
        currentLineText &&
        textAheadOfCursor &&
        type == InjectionType.OnOwnLine
      ) {
        row++
      }

      const [currentRange] = editor.getVisibleRanges()
      // Determines whether the new insert line is beyond the current range
      let shouldInsertOnNextLine = row > currentRange.endLineNumber

      // edge case for when user toggles to the script editor
      // this defaults the cursor to the initial position (top-left, 1:1 position)
      if (lineNumber === 1 && column === 1) {
        shouldInsertOnNextLine = true
        row = currentRange.endLineNumber + 1
      }

      return {row, column, shouldInsertOnNextLine}
    },
    [editor, queryText]
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
        shouldInsertOnNextLine,
      } = calcInjectiontPosition(type)
      let text = ''

      if (shouldInsertOnNextLine && !/^(\W*)?\\n/.test(text)) {
        text = `\n${initT}`
      } else {
        text = initT
      }

      const column = type == InjectionType.OnOwnLine ? 1 : initC
      const range = new window.monaco.Range(row, column, row, column)
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
          range: new window.monaco.Range(1, 1, 1, 1),
          text: `${header}\n`,
        })
      }

      editor.executeEdits('', edits)
      updateText(editor.getValue())
    },
    [editor, calcInjectiontPosition, updateText]
  )

  return useMemo(
    () => (
      <EditorContext.Provider
        value={{
          editor,
          register,
          inject,
          calcInjectiontPosition,
          updateText,
        }}
      >
        {children}
      </EditorContext.Provider>
    ),
    [editor, inject, calcInjectiontPosition, updateText]
  )
}
