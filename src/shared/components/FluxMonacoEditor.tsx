// Libraries
import React, {FC, useEffect, useRef, useContext} from 'react'
import {useSelector} from 'react-redux'
import classnames from 'classnames'

// Components
import MonacoEditor from 'react-monaco-editor'
import ErrorBoundary from 'src/shared/components/ErrorBoundary'
import {Icon, IconFont} from '@influxdata/clockface'

// LSP
import FLUXLANGID from 'src/languageSupport/languages/flux/monaco.flux.syntax'
import THEME_NAME from 'src/languageSupport/languages/flux/monaco.flux.theme'
import {setupForReactMonacoEditor} from 'src/languageSupport/languages/flux/lsp/monaco.flux.lsp'
import {
  comments,
  submit,
} from 'src/languageSupport/languages/flux/monaco.flux.hotkeys'
import {registerAutogrow} from 'src/languageSupport/monaco.autogrow'
import ConnectionManager, {
  ICON_SYNC_ID,
} from 'src/languageSupport/languages/flux/lsp/connection'

// Contexts and State
import {EditorContext} from 'src/shared/contexts/editor'
import {PersistanceContext} from 'src/dataExplorer/context/persistance'
import {fluxQueryBuilder} from 'src/shared/selectors/app'

// Types
import {OnChangeScript} from 'src/types/flux'
import {EditorType, Variable} from 'src/types'
import {editor as monacoEditor} from 'monaco-editor'

import './FluxMonacoEditor.scss'
import {isFlagEnabled} from 'src/shared/utils/featureFlag'

export interface EditorProps {
  script: string
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
  const connection = useRef<ConnectionManager>(null)
  const {setEditor} = useContext(EditorContext)
  const isFluxQueryBuilder = useSelector(fluxQueryBuilder)
  const sessionStore = useContext(PersistanceContext)

  const wrapperClassName = classnames('flux-editor--monaco', {
    'flux-editor--monaco__autogrow': autogrow,
  })

  useEffect(() => {
    connection.current.updatePreludeModel(variables)
  }, [variables])

  useEffect(() => {
    if (
      connection.current &&
      isFluxQueryBuilder &&
      isFlagEnabled('schemaComposition')
    ) {
      connection.current.onSchemaSessionChange(
        sessionStore.selection,
        sessionStore.setSelection
      )
    }
  }, [
    connection.current,
    sessionStore?.selection,
    sessionStore?.selection.composition || null,
    sessionStore?.setSelection,
  ])

  const editorDidMount = (editor: EditorType) => {
    connection.current = setupForReactMonacoEditor(editor)
    connection.current.updatePreludeModel(variables)

    setEditor(editor, connection)
    if (setEditorInstance) {
      setEditorInstance(editor, connection)
    }

    comments(editor)
    submit(editor, () => {
      if (onSubmitScript) {
        onSubmitScript()
      }
    })

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

  return (
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
        <div id={ICON_SYNC_ID} className="sync-bar">
          <Icon glyph={IconFont.Sync} className="sync-icon" />
        </div>
      </div>
    </ErrorBoundary>
  )
}

export default FluxEditorMonaco
