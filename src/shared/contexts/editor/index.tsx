import React, {
  FC,
  createContext,
  useState,
  useCallback,
  useRef,
  useEffect,
  useContext,
} from 'react'
import {EditorType, FluxFunction} from 'src/types'

// Helpers
import {
  InjectionMode,
  InjectionOptions,
  calcInjectionPosition,
  moveCursorAndTriggerSuggest,
} from 'src/shared/contexts/editor/injection'
import {
  Injection,
  InjectionType,
  InjectionContext,
  RawInjection,
  FunctionInjection,
  VariableInjection,
  SecretInjection,
} from 'src/shared/contexts/injection'
import {generateImport} from 'src/shared/contexts/editor/insertFunction'
import {
  isPipeTransformation,
  functionRequiresNewLine,
} from 'src/shared/utils/fluxFunctions'
import {getFluxExample} from 'src/shared/utils/fluxExample'

// Utils
import {isFlagEnabled} from 'src/shared/utils/featureFlag'
import {CLOUD} from 'src/shared/constants'

export interface EditorContextType {
  editor: EditorType | null
  setEditor: (editor: EditorType) => void
  onUpdate: (cb: (text: string) => void) => void
}

const DEFAULT_CONTEXT: EditorContextType = {
  editor: null,
  setEditor: _ => {},
  onUpdate: _ => {},
}

export const EditorContext = createContext<EditorContextType>(DEFAULT_CONTEXT)

export const EditorProvider: FC = ({children}) => {
  const {sub, unsub} = useContext(InjectionContext)
  const [editor, setEditor] = useState<EditorType>(null)
  const updateCBs = useRef([])

  const _inject = useCallback(
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
        text = `${text}\n`
      }

      const column = type == InjectionMode.OnOwnLine ? 1 : initC
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

  const injectRaw = useCallback(
    (injection: RawInjection) => {
      _inject({
        text: injection.text,
        type: InjectionMode.SameLine,
        triggerSuggest: false,
      })
    },
    [_inject]
  )

  const injectFunction = (injection: FunctionInjection) => {
    if (!editor) {
      return
    }

    const fn =
      CLOUD && isFlagEnabled('fluxDynamicDocs')
        ? getFluxExample(injection.function as FluxFunction)
        : (injection.function as FluxFunction)

    const text = isPipeTransformation(fn)
      ? `  |> ${fn.example.trimRight()}`
      : `${fn.example.trimRight()}`

    const header = generateImport(fn as FluxFunction, editor.getValue())

    const type =
      isPipeTransformation(fn) || functionRequiresNewLine(fn.name)
        ? InjectionMode.OnOwnLine
        : InjectionMode.SameLine

    _inject({
      text,
      type,
      header,
      triggerSuggest: true,
    })
  }

  const injectVariable = useCallback(
    (injection: VariableInjection) => {
      _inject({
        text: `v.${injection.variable}`,
        type: InjectionMode.SameLine,
        triggerSuggest: false,
      })
    },
    [_inject]
  )

  const injectSecret = useCallback(
    (injection: SecretInjection) => {
      _inject({
        text: `secrets.get(key: "${injection.secret.id}") `,
        type: InjectionMode.SameLine,
        header: `import "influxdata/influxdb/secrets"`,
      })
    },
    [_inject]
  )

  const _setEditor = (nextEditor: EditorType) => {
    nextEditor.getModel().onDidChangeContent(() => {
      if (!editor) {
        return
      }
      const val = editor.getValue()
      updateCBs.current.forEach(cb => cb(val))
    })

    setEditor(nextEditor)
  }

  const onUpdate = (cb: (text: string) => void) => {
    updateCBs.current.push(cb)
  }

  useEffect(() => {
    const cb = (injection: Injection) => {
      switch (injection.type) {
        case InjectionType.Function:
          injectFunction(injection)
          break
        case InjectionType.Variable:
          injectVariable(injection)
          break
        case InjectionType.Secret:
          injectSecret(injection)
          break
        default:
          injectRaw(injection as RawInjection)
      }
    }

    sub(cb)

    return () => {
      unsub(cb)
    }
  }, [sub, unsub, _inject, editor])

  return (
    <EditorContext.Provider
      value={{
        editor,
        setEditor: _setEditor,
        onUpdate,
      }}
    >
      {children}
    </EditorContext.Provider>
  )
}

export {calcInjectionPosition, moveCursorAndTriggerSuggest}
