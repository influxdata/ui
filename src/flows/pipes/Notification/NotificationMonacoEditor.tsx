// Libraries
import React, {FC, useContext} from 'react'

// Components
import MonacoEditor from 'react-monaco-editor'

// Utils
import LANGID from 'src/languageSupport/languages/markdown/monaco.markdown.syntax'
import THEME_NAME from 'src/languageSupport/languages/flux/monaco.flux.theme'
import {EditorContext} from 'src/shared/contexts/editor'

// Types
import {EditorType} from 'src/types'
import {OnChangeScript} from 'src/types/flux'

import 'src/shared/components/FluxMonacoEditor.scss'

interface Props {
  text: string
  onChangeText: OnChangeScript
  readOnly?: boolean
}

const NotificationMonacoEditor: FC<Props> = ({
  text,
  onChangeText,
  readOnly,
}) => {
  const {setEditor} = useContext(EditorContext)
  const editorDidMount = (editor: EditorType) => {
    setEditor(editor)
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
