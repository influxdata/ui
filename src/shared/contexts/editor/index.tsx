import React, {FC, createContext, useState, useCallback} from 'react'
import {EditorType, FluxFunction, FluxToolbarFunction} from 'src/types'

// Helpers
import {
  InjectionType,
  InjectionOptions,
  calcInjectionPosition,
  moveCursorAndTriggerSuggest,
} from 'src/shared/contexts/editor/injection'
import {generateImport} from 'src/shared/contexts/editor/insertFunction'
import {
  isPipeTransformation,
  functionRequiresNewLine,
} from 'src/shared/utils/fluxFunctions'
import {getFluxExample} from 'src/shared/utils/fluxExample'

// LSP
import {
  ExecuteCommand,
  ExecuteCommandArgument,
} from 'src/languageSupport/languages/flux/lsp/utils'
import LspConnectionManager from 'src/languageSupport/languages/flux/lsp/connection'

// Utils
import {isFlagEnabled} from 'src/shared/utils/featureFlag'
import {CLOUD} from 'src/shared/constants'

export interface EditorContextType {
  editor: EditorType | null
  setEditor: (
    editor: EditorType,
    conn: React.MutableRefObject<LspConnectionManager>
  ) => void
  inject: (options: InjectionOptions) => void
  injectFunction: (fn, cbToParent) => void
  injectVariable: (variableName, cbToParent) => void
  injectViaLsp: (
    cmd: ExecuteCommand,
    data: Omit<ExecuteCommandArgument, 'textDocument'>
  ) => void
}

const DEFAULT_CONTEXT: EditorContextType = {
  editor: null,
  setEditor: _ => {},
  inject: _ => {},
  injectFunction: (_, __) => {},
  injectVariable: (_, __) => {},
  injectViaLsp: (_, __) => {},
}

export const EditorContext = createContext<EditorContextType>(DEFAULT_CONTEXT)

export const EditorProvider: FC = ({children}) => {
  const [editor, setEditorOnState] = useState<EditorType>(null)
  const [connection, setConnection] = useState<
    React.MutableRefObject<LspConnectionManager>
  >(null)

  const setEditor = (ed, conn) => {
    setEditorOnState(ed)
    setConnection(conn)
  }

  const injectViaLsp = useCallback(
    (cmd, data: Omit<ExecuteCommandArgument, 'textDocument'>) => {
      try {
        connection.current.inject(cmd, data)
      } catch (e) {
        console.error(e)
      }
    },
    [editor, connection]
  )

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
        cbParentOnUpdateText,
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
      cbParentOnUpdateText(editor.getValue())

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

  const injectFunction = useCallback(
    (
      rawFn: FluxToolbarFunction | FluxFunction,
      cbParentOnUpdateText: (t: string) => void
    ): void => {
      const fn =
        CLOUD && isFlagEnabled('fluxDynamicDocs')
          ? getFluxExample(rawFn as FluxFunction)
          : (rawFn as FluxFunction)

      const text = isPipeTransformation(fn)
        ? `  |> ${fn.example.trimRight()}`
        : `${fn.example.trimRight()}`

      const header = generateImport(fn as FluxFunction, editor.getValue())

      const type =
        isPipeTransformation(fn) || functionRequiresNewLine(fn.name)
          ? InjectionType.OnOwnLine
          : InjectionType.SameLine

      const options = {
        text,
        type,
        header,
        triggerSuggest: true,
        cbParentOnUpdateText,
      }
      inject(options)
    },
    [inject, editor]
  )

  const injectVariable = useCallback(
    (variableName: string, cbToParent: (t: string) => void) => {
      if (!editor) {
        return null
      }

      const options = {
        text: `v.${variableName}`,
        type: InjectionType.SameLine,
        triggerSuggest: false,
        cbParentOnUpdateText: cbToParent,
      }
      inject(options)
    },
    [editor, inject]
  )

  return (
    <EditorContext.Provider
      value={{
        editor,
        setEditor,
        inject,
        injectFunction,
        injectVariable,
        injectViaLsp,
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
