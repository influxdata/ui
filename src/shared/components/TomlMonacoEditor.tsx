// Libraries
import React, {FC} from 'react'

// Components
import MonacoEditor from 'react-monaco-editor'
import THEME_NAME from 'src/languageSupport/languages/toml/monaco.toml.theme'
import TOMLLANGID from 'src/languageSupport/languages/toml/monaco.toml.syntax'
import {OnChangeScript, EditorType, CursorEvent, KeyboardEvent} from 'src/types'

import './MonacoEditor.scss'

interface Position {
  line: number
  ch: number
}

interface Props {
  script: string
  className?: string
  willMount?: (monaco: EditorType) => void
  readOnly?: boolean
  testID?: string
  onChangeScript?: OnChangeScript
  onSubmitScript?: () => void
  onCursorChange?: (position: Position) => void
}

const TomlEditorMonaco: FC<Props> = props => {
  const editorDidMount = (editor: EditorType) => {
    editor.onDidChangeCursorPosition((evt: CursorEvent) => {
      const {position} = evt
      const {onCursorChange} = props
      const pos = {
        line: position.lineNumber,
        ch: position.column,
      }

      if (onCursorChange) {
        onCursorChange(pos)
      }
    })

    editor.onKeyUp((evt: KeyboardEvent) => {
      const {ctrlKey, code} = evt
      const {onSubmitScript} = props
      if (ctrlKey && code === 'Enter') {
        if (onSubmitScript) {
          onSubmitScript()
        }
      }
    })

    if (props.willMount) {
      props.willMount(editor)
    }
  }
  const {script, onChangeScript, readOnly} = props
  const testID = props.testID || 'toml-editor'
  const className = props.className || 'time-machine-editor--embedded'

  return (
    <div className={className} data-testid={testID}>
      <MonacoEditor
        language={TOMLLANGID}
        theme={THEME_NAME}
        value={script}
        onChange={onChangeScript}
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
        }}
        editorDidMount={editorDidMount}
      />
    </div>
  )
}

export default TomlEditorMonaco
