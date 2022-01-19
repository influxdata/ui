import React, {
  FC, createContext, useState, useCallback, useMemo, useContext,
} from 'react'
import {EditorType} from 'src/types'
import {PipeContext} from 'src/flows/context/pipe'


interface InsertPosition {
  row: number
  column: number
  shouldInsertOnNextLine: boolean
}

export interface EditorContextType {
  pipeId: string
  editor: EditorType | null
  register: (editor: EditorType) => void
  calcInsertPosition: (t: string, nextL?: boolean) => Partial<InsertPosition>
  updateText: (t: string) => void
}

const DEFAULT_CONTEXT: EditorContextType = {
  pipeId: '',
  editor: null,
  register: (_) => {},
  calcInsertPosition: (_) => ({}),
  updateText: (_) => {},
}

export const EditorContext = createContext<EditorContextType>(DEFAULT_CONTEXT)

export const EditorProvider: FC<{id: string}> = ({children, id}) => {
  const [editor, setEditor] = useState<EditorType>(null)
  const {data, update} = useContext(PipeContext)
  const {queries, activeQuery} = data

  const register = (instance: EditorType) => {
    setEditor(instance)
  }

  const updateText = useCallback(
    text => {
      const _queries = queries.slice()
      _queries[activeQuery] = {
        ...queries[activeQuery],
        text,
      }

      update({queries: _queries})
    },
    [queries, activeQuery]
  )

  const calcInsertPosition = (text: string, onOwnLine = false): Partial<InsertPosition> => {
    if (!editor) {
      return {}
    }
    const {lineNumber, column} = editor.getPosition()
    let row = lineNumber

    const split = text.split('\n')
    const currentLineHasText = (split[row] || split[split.length - 1]).trim()
    if (currentLineHasText && onOwnLine) {
      row++
    }

    const [currentRange] = editor.getVisibleRanges()
    // Determines whether the new insert line is beyond the current range
    let shouldInsertOnNextLine = row > currentRange.endLineNumber

    // edge case for when user toggles to the script editor
    // this defaults the cursor to the initial position (top-left, 1:1 position)
    if (lineNumber === 1 && column === 1 && onOwnLine) {
      // adds the function to the end of the query
      shouldInsertOnNextLine = true
      row = currentRange.endLineNumber + 1
    }

    return {row, column, shouldInsertOnNextLine}
  }

  return useMemo(
    () => (
      <EditorContext.Provider
        value={{
          pipeId: id,
          editor,
          register,
          calcInsertPosition,
          updateText,
        }}
      >
        {children}
      </EditorContext.Provider>
    ), [id, editor]
  )
}
