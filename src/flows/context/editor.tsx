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
  calcInjectionPosition,
  moveCursorAndTriggerSuggest,
} from 'src/shared/utils/fluxFunctions'
export {InjectionType, InjectionPosition} from 'src/shared/utils/fluxFunctions'
import {isFlagEnabled} from 'src/shared/utils/featureFlag'

export interface InjectionOptions {
  header?: string | null
  text: string
  type: InjectionType
  triggerSuggest?: boolean
}

export interface EditorContextType {
  editor: EditorType | null
  setEditor: (editor: EditorType) => void
  inject: (options: InjectionOptions) => void
  updateText: (t: string) => void
}

const DEFAULT_CONTEXT: EditorContextType = {
  editor: null,
  setEditor: _ => {},
  inject: _ => {},
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

  const inject = useCallback(
    (options: InjectionOptions) => {
      if (!editor) {
        return {}
      }

      const {header, text: initT, type, triggerSuggest} = options
      const injectionPosition = calcInjectionPosition(editor, type)
      const {
        row,
        column: initC,
        shouldStartWithNewLine,
        shouldEndInNewLine,
      } = injectionPosition

      let text = initT.trimRight()
      if (shouldStartWithNewLine) {
        text = `\n${text}`
      }
      if (shouldEndInNewLine) {
        text = `${text.trim()}\n`
      }

      const column = type == InjectionType.OnOwnLine ? 1 : initC
      const range = new monaco.Range(row, column, row, column)
      const edits = [
        {
          range,
          text,
        },
      ]

      const addHeader =
        header &&
        !editor
          .getModel()
          .getValue()
          .includes(header)
      if (addHeader) {
        edits.unshift({
          range: new monaco.Range(1, 1, 1, 1),
          text: `${header}\n`,
        })
      }

      editor.executeEdits('', edits)
      updateText(editor.getValue())

      if (isFlagEnabled('fluxDynamicDocs') && triggerSuggest) {
        moveCursorAndTriggerSuggest(
          editor,
          injectionPosition,
          addHeader,
          text.length
        )
      }
    },
    [editor, updateText]
  )

  return (
    <EditorContext.Provider
      value={{
        editor,
        setEditor,
        inject,
        updateText,
      }}
    >
      {children}
    </EditorContext.Provider>
  )
}
