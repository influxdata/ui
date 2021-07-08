// Libraries
import React, {FC, useRef, useState} from 'react'
import {ProtocolToMonacoConverter} from 'monaco-languageclient/lib/monaco-converter'
import classnames from 'classnames'

// Components
import MonacoEditor from 'react-monaco-editor'

// Utils
import FLUXLANGID from 'src/external/monaco.flux.syntax'
import THEME_NAME from 'src/external/monaco.flux.theme'
import loadServer, {LSPServer} from 'src/external/monaco.flux.server'
import {comments, submit} from 'src/external/monaco.flux.hotkeys'
import {registerAutogrow} from 'src/external/monaco.autogrow'
import {isFlagEnabled} from 'src/shared/utils/featureFlag'

// Types
import {OnChangeScript} from 'src/types/flux'
import {EditorType} from 'src/types'
import {editor as monacoEditor} from 'monaco-editor'

import './FluxMonacoEditor.scss'
import {Diagnostic} from 'monaco-languageclient/lib/services'

const p2m = new ProtocolToMonacoConverter()

export interface EditorProps {
  script: string
  onChangeScript: OnChangeScript
  onSubmitScript?: () => void
  autogrow?: boolean
  readOnly?: boolean
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
  wrapLines,
}) => {
  const lspServer = useRef<LSPServer>(null)
  const [editorInst, seteditorInst] = useState<EditorType | null>(null)
  const [docURI, setDocURI] = useState('')

  const wrapperClassName = classnames('flux-editor--monaco', {
    'flux-editor--monaco__autogrow': autogrow,
  })

  const updateDiagnostics = (diagnostics: Diagnostic[]) => {
    if (editorInst) {
      const results = p2m.asDiagnostics(diagnostics)
      monacoEditor.setModelMarkers(editorInst.getModel(), 'default', results)
    }
  }

  const editorDidMount = async (editor: EditorType) => {
    if (setEditorInstance) {
      setEditorInstance(editor)
    }

    seteditorInst(editor)

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
      const diagnostics = await lspServer.current.didOpen(uri, script)
      updateDiagnostics(diagnostics)
      monacoEditor.remeasureFonts()

      if (isFlagEnabled('cursorAtEOF')) {
        const lines = (script || '').split('\n')
        editor.setPosition({
          lineNumber: lines.length,
          column: lines[lines.length - 1].length + 1,
        })
        editor.focus()
      } else {
        if (!readOnly) {
          editor.focus()
        }
      }
    } catch (e) {
      // TODO: notify user that lsp failed
    }
  }

  const onChange = async (text: string) => {
    onChangeScript(text)
    try {
      const diagnostics = await lspServer.current.didChange(docURI, text)
      updateDiagnostics(diagnostics)
    } catch (e) {
      // TODO: notify user that lsp failed
    }
  }

  return (
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
        }}
        editorDidMount={editorDidMount}
      />
    </div>
  )
}

export default FluxEditorMonaco
