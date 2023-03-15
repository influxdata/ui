// Libraries
import React, {
  FC,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react'
import classnames from 'classnames'

// Components
import MonacoEditor from 'react-monaco-editor'
import ErrorBoundary from 'src/shared/components/ErrorBoundary'

// LSP
import {LANGID as INFLUXQL_LANGID} from 'src/languageSupport/languages/influxql/monaco.influxql.syntax'
import {THEME_NAME} from 'src/languageSupport/languages/influxql/monaco.influxql.theme'
import {submit} from 'src/languageSupport/languages/sql/monaco.sql.hotkeys'
import {registerAutogrow} from 'src/languageSupport/monaco.autogrow'
import {ConnectionManager} from 'src/languageSupport/languages/influxql/connection'

// Contexts
import {PersistanceContext} from 'src/dataExplorer/context/persistance'

// Types
import {OnChangeScript, EditorType} from 'src/types'
import {editor as monacoEditor} from 'monaco-editor'

// Styles
import './MonacoEditor.scss'
import {useDispatch} from 'react-redux'

interface Props {
  script?: string
  onChangeScript: OnChangeScript
  onSubmitScript: () => void
  autogrow?: boolean
  readOnly?: boolean
  autofocus?: boolean
  wrapLines?: 'off' | 'on' | 'bounded'
}

export const InfluxQLMonacoEditor: FC<Props> = ({
  script,
  onChangeScript,
  onSubmitScript,
  autogrow,
  readOnly,
  autofocus,
  wrapLines,
}) => {
  const dispatch = useDispatch()
  const connection = useRef<ConnectionManager>(new ConnectionManager())
  const sessionStore = useContext(PersistanceContext)
  const [editor, setEditor] = useState(null)
  const wrapperClassName = classnames('qx-editor--monaco', {
    'qx-editor--monaco__autogrow': autogrow,
  })

  useEffect(() => {
    if (connection.current) {
      connection.current.onSchemaSessionChange(
        sessionStore?.selection,
        sessionStore?.setSelection,
        dispatch,
        sessionStore?.range
      )
    }
  }, [
    sessionStore?.selection,
    sessionStore?.setSelection,
    dispatch,
    sessionStore?.range,
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
    setEditor(editor)
    connection.current.subscribeToModel(editor)

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

  return useMemo(
    () => (
      <ErrorBoundary>
        <div className={wrapperClassName} data-testid="influxql-editor">
          <MonacoEditor
            language={INFLUXQL_LANGID}
            theme={THEME_NAME}
            value={script}
            onChange={(text: string) => onChangeScript(text)}
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
          <div className="monaco-editor__language">{INFLUXQL_LANGID}</div>
        </div>
      </ErrorBoundary>
    ),
    [onChangeScript, script]
  )
}
