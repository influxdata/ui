// Libraries
import React, {FC} from 'react'
import classnames from 'classnames'

// Components
import MonacoEditor from 'react-monaco-editor'

// Utils
import PYTHONLANGID from 'src/external/monaco.python.syntax'
import THEME_NAME from 'src/external/monaco.python.theme'

// Types
import {OnChangeScript} from 'src/types/flux'
import {EditorType} from 'src/types'

import 'src/shared/components/FluxMonacoEditor.scss'

export interface EditorProps {
  script: string
  onChangeScript: OnChangeScript
  onSubmitScript?: () => void
  autogrow?: boolean
  readOnly?: boolean
}

interface Props extends EditorProps {
  setEditorInstance?: (editor: EditorType) => void
}

const PythonEditorMonaco: FC<Props> = ({
  script,
  onChangeScript,
  autogrow,
  readOnly,
}) => {
  const wrapperClassName = classnames('flux-editor--monaco', {
    'flux-editor--monaco__autogrow': autogrow,
  })

  const editorDidMount = (editor: EditorType) => {
    try {
      editor.focus()
    } catch (e) {
      // TODO: notify user that lsp failed
    }
  }

  const onChange = (text: string) => {
    onChangeScript(text)
  }

  return (
    <div className={wrapperClassName} data-testid="python-editor">
      <MonacoEditor
        language={PYTHONLANGID}
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
        }}
        editorDidMount={editorDidMount}
      />
    </div>
  )
}

export default PythonEditorMonaco
