// Libraries
import React, {FC, useRef, useState} from 'react'
import classnames from 'classnames'

// Components
import MonacoEditor from 'react-monaco-editor'
import ErrorBoundary from 'src/shared/components/ErrorBoundary'

// Utils
import FLUXLANGID from 'src/external/languages/flux/monaco.flux.syntax'
import THEME_NAME from 'src/external/languages/flux/monaco.flux.theme'
import loadServer, {
  LSPServer,
} from 'src/external/languages/flux/lsp/monaco.flux.server'
import {comments, submit} from 'src/external/languages/flux/monaco.flux.hotkeys'
import {registerAutogrow} from 'src/external/monaco.autogrow'

// Types
import {OnChangeScript} from 'src/types/flux'
import {EditorType} from 'src/types'
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
}) => {
  const lspServer = useRef<LSPServer>(null)
  const [docURI, setDocURI] = useState('')

  const wrapperClassName = classnames('flux-editor--monaco', {
    'flux-editor--monaco__autogrow': autogrow,
  })

  const editorDidMount = async (editor: EditorType) => {
    if (setEditorInstance) {
      setEditorInstance(editor)
    }

    const uri = editor.getModel().uri.toString()

    setDocURI(uri)

    comments(editor)
    submit(editor, () => {
      if (onSubmitScript) {
        onSubmitScript()
      }
    })

    if (autogrow) {
      registerAutogrow(editor)
    }

    try {
      lspServer.current = await loadServer()
      await lspServer.current.didOpen(uri, script)
      monacoEditor.remeasureFonts()

      if (autofocus && !readOnly && !editor.hasTextFocus()) {
        const model = editor.getModel()
        editor.setPosition({
          lineNumber: model.getLineCount(),
          column: model.getLineLength(model.getLineCount()) + 1,
        })
        editor.focus()
      }
    } catch (e) {
      // TODO: notify user that lsp failed
    }
  }

  const onChange = async (text: string) => {
    onChangeScript(text)
    try {
      await lspServer.current.didChange(docURI, text)
    } catch (e) {
      // TODO: notify user that lsp failed
    }
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
