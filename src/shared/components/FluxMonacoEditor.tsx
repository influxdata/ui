// Libraries
import React, {FC, useEffect, useRef, useContext, useMemo} from 'react'
import {useDispatch, useSelector} from 'react-redux'
import {useRouteMatch} from 'react-router-dom'
import classnames from 'classnames'

// Components
import MonacoEditor from 'react-monaco-editor'
import ErrorBoundary from 'src/shared/components/ErrorBoundary'

// LSP
import FLUXLANGID from 'src/languageSupport/languages/flux/monaco.flux.syntax'
import THEME_NAME from 'src/languageSupport/languages/flux/monaco.flux.theme'
import {setupForReactMonacoEditor} from 'src/languageSupport/languages/flux/lsp/monaco.flux.lsp'
import {
  comments,
  submit,
} from 'src/languageSupport/languages/flux/monaco.flux.hotkeys'
import {registerAutogrow} from 'src/languageSupport/monaco.autogrow'
import {ConnectionManager} from 'src/languageSupport/languages/flux/lsp/connection'

// Contexts and State
import {EditorContext} from 'src/shared/contexts/editor'
import {PersistenceContext} from 'src/dataExplorer/context/persistence'
import {scriptQueryBuilder} from 'src/shared/selectors/app'

// Types
import {OnChangeScript} from 'src/types/flux'
import {EditorType, Variable} from 'src/types'
import {editor as monacoEditor} from 'monaco-editor'

import './MonacoEditor.scss'
import {isFlagEnabled} from 'src/shared/utils/featureFlag'
export interface EditorProps {
  script?: string
  onChangeScript: OnChangeScript
  onSubmitScript?: () => void
  autogrow?: boolean
  readOnly?: boolean
  autofocus?: boolean
  wrapLines?: 'off' | 'on' | 'bounded'
}

interface Props extends EditorProps {
  setEditorInstance?: (
    editor: EditorType,
    connection: React.MutableRefObject<ConnectionManager>
  ) => void
  variables: Variable[]
}

const FluxEditorMonaco: FC<Props> = ({
  script,
  onChangeScript,
  onSubmitScript,
  setEditorInstance,
  autogrow,
  readOnly,
  autofocus,
  wrapLines,
  variables,
}) => {
  const dispatch = useDispatch()
  const connection = useRef<ConnectionManager>(null)
  const {editor, setEditor} = useContext(EditorContext)
  const isScriptQueryBuilder = useSelector(scriptQueryBuilder)
  const sessionStore = useContext(PersistenceContext)
  const {path} = useRouteMatch()
  const isInScriptQueryBuilder =
    isScriptQueryBuilder && path === '/orgs/:orgID/data-explorer'
  const useSchemaComposition =
    isInScriptQueryBuilder && isFlagEnabled('schemaComposition')

  const wrapperClassName = classnames('qx-editor--monaco', {
    'qx-editor--monaco__autogrow': autogrow,
  })

  useEffect(() => {
    connection.current.updatePreludeModel(variables)
  }, [variables])

  useEffect(() => {
    if (connection.current && useSchemaComposition) {
      connection.current.onSchemaSessionChange(
        sessionStore.selection,
        sessionStore.setSelection,
        dispatch
      )
    }
  }, [
    useSchemaComposition,
    connection.current,
    sessionStore?.selection,
    sessionStore?.selection.composition || null,
    sessionStore?.selection.resultOptions || null,
    sessionStore?.setSelection,
  ])

  useEffect(() => {
    if (!editor) {
      return
    }
    submit(editor, () => {
      if (onSubmitScript) {
        onSubmitScript()
      }
    })
  }, [editor, onSubmitScript])

  const editorDidMount = (editor: EditorType) => {
    connection.current = setupForReactMonacoEditor(editor)
    connection.current.updatePreludeModel(variables)

    setEditor(editor, connection)
    if (setEditorInstance) {
      setEditorInstance(editor, connection)
    }

    comments(editor)

    if (autogrow) {
      registerAutogrow(editor)
    }

    monacoEditor.remeasureFonts()

    if (autofocus && !readOnly && !editor.hasTextFocus()) {
      const model = editor.getModel()
      editor.setPosition({
        lineNumber: model.getLineCount(),
        column: model.getLineLength(model.getLineCount()) + 1,
      })
      editor.focus()
    }
  }

  const onChange = (text: string) => {
    onChangeScript(text)
  }

  return useMemo(
    () => (
      <ErrorBoundary>
        <div className={wrapperClassName} data-testid="flux-editor">
          <MonacoEditor
            language={FLUXLANGID}
            theme={THEME_NAME}
            value={script}
            onChange={onChange}
            options={{
              fontSize: 13,
              fontFamily: '"IBMPlexMono", monospace',
              cursorWidth: 2,
              lineNumbersMinChars: 4,
              lineDecorationsWidth: 0,
              minimap: {
                renderCharacters: false,
              },
              overviewRulerBorder: false,
              automaticLayout: true,
              readOnly: readOnly || false,
              wordWrap: wrapLines ?? 'off',
              scrollBeyondLastLine: false,
            }}
            editorDidMount={editorDidMount}
          />
          {isInScriptQueryBuilder && (
            <div className="monaco-editor__language">{FLUXLANGID}</div>
          )}
        </div>
      </ErrorBoundary>
    ),
    [onChangeScript, setEditor, useSchemaComposition, script]
  )
}

export default FluxEditorMonaco
