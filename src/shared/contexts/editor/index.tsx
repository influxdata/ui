import React, {FC, createContext, useState, useCallback} from 'react'
import {EditorType} from 'src/types'
import {
  InjectionType,
  InjectionOptions,
  calcInjectionPosition,
  moveCursorAndTriggerSuggest,
} from 'src/shared/contexts/editor/injection'
import {isFlagEnabled} from 'src/shared/utils/featureFlag'

export interface EditorContextType {
  editor: EditorType | null
  setEditor: (editor: EditorType) => void
  inject: (options: InjectionOptions) => void
}

const DEFAULT_CONTEXT: EditorContextType = {
  editor: null,
  setEditor: _ => {},
  inject: _ => {},
}

export const EditorContext = createContext<EditorContextType>(DEFAULT_CONTEXT)

export const EditorProvider: FC = ({children}) => {
  const [editor, setEditor] = useState<EditorType>(null)

  const inject = useCallback(
    (options: InjectionOptions) => {
      if (!editor) {
        return {}
      }

      const {
        header,
        text: initT,
        type,
        triggerSuggest,
        updateTextToParentState: updateText,
      } = options
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
    [editor]
  )

  return (
    <EditorContext.Provider
      value={{
        editor,
        setEditor,
        inject,
      }}
    >
      {children}
    </EditorContext.Provider>
  )
}

export {
  InjectionType,
  InjectionOptions,
  calcInjectionPosition,
  moveCursorAndTriggerSuggest,
}
