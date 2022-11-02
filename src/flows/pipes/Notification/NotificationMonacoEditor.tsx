// Libraries
import React, {FC} from 'react'

// Components
import MonacoEditor from 'react-monaco-editor'

// Utils
import LANGID from 'src/languageSupport/languages/markdown/monaco.markdown.syntax'
import THEME_NAME from 'src/languageSupport/languages/flux/monaco.flux.theme'

// Types
import {EditorType} from 'src/types'
import {OnChangeScript} from 'src/types/flux'

import 'src/shared/components/MonacoEditor.scss'

interface Props {
  setEditorInstance?: (editor: EditorType) => void
  text: string
  onChangeText: OnChangeScript
  readOnly?: boolean
}

const NotificationMonacoEditor: FC<Props> = ({
  text,
  onChangeText,
  setEditorInstance,
  readOnly,
}) => {
  const editorDidMount = (editor: EditorType) => {
    if (setEditorInstance) {
      setEditorInstance(editor)
    }
    editor.focus()
  }

  return (
    <div className="markdown-editor--monaco" data-testid="text-editor">
      <MonacoEditor
        language={LANGID}
        theme={THEME_NAME}
        value={text}
        onChange={onChangeText}
        height="300px"
        options={{
          fontSize: 13,
          fontFamily: '"IBMPlexMono", monospace',
          cursorWidth: 2,
          lineNumbersMinChars: 4,
          lineDecorationsWidth: 0,
          minimap: {
            enabled: false,
          },
          contextmenu: false,
          overviewRulerBorder: false,
          automaticLayout: true,
          wordWrap: 'on',
          lineNumbers: 'off',
          scrollBeyondLastLine: false,
          readOnly: !!readOnly,
        }}
        editorDidMount={editorDidMount}
      />
    </div>
  )
}

export default NotificationMonacoEditor
