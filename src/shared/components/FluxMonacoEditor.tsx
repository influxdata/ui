// Libraries
import React, {FC, useEffect, useRef, useContext} from 'react'
import classnames from 'classnames'

// Components
import MonacoEditor from 'react-monaco-editor'
import ErrorBoundary from 'src/shared/components/ErrorBoundary'

// Utils
import FLUXLANGID from 'src/languageSupport/languages/flux/monaco.flux.syntax'
import THEME_NAME from 'src/languageSupport/languages/flux/monaco.flux.theme'
import {setupForReactMonacoEditor} from 'src/languageSupport/languages/flux/lsp/monaco.flux.lsp'
import {
  comments,
  submit,
} from 'src/languageSupport/languages/flux/monaco.flux.hotkeys'
import {registerAutogrow} from 'src/languageSupport/monaco.autogrow'
import Prelude from 'src/languageSupport/languages/flux/lsp/prelude'
import {EditorContext} from 'src/shared/contexts/editor'

// Types
import {OnChangeScript} from 'src/types/flux'
import {EditorType, Variable} from 'src/types'
import {editor as monacoEditor} from 'monaco-editor'

import './FluxMonacoEditor.scss'

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
  setEditorInstance?: (editor: EditorType) => void
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
  const prelude = useRef<Prelude>(null)
  const {setEditor} = useContext(EditorContext)

  const wrapperClassName = classnames('flux-editor--monaco', {
    'flux-editor--monaco__autogrow': autogrow,
  })

  useEffect(() => {
    prelude.current.updatePreludeModel(variables)
  }, [variables])

  const editorDidMount = (editor: EditorType) => {
    prelude.current = setupForReactMonacoEditor(editor)
    prelude.current.updatePreludeModel(variables)
    setEditor(editor)
    if (setEditorInstance) {
      setEditorInstance(editor)
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
      </div>
    </ErrorBoundary>
  )
}

export default FluxEditorMonaco
