import React, {
  FC,
  createContext,
  useState,
  useCallback,
  useContext,
} from 'react'
import {EditorType} from 'src/types'
import {PipeContext} from 'src/flows/context/pipe'
import {
  InjectionType,
  InjectionPosition,
  calcInjectionPosition,
} from 'src/shared/utils/fluxFunctions'
export {InjectionType, InjectionPosition} from 'src/shared/utils/fluxFunctions'

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
      return calcInjectionPosition(editor, type)
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
