// Libraries
import React, {FC, useContext, useRef} from 'react'

// Components
import {Form} from '@influxdata/clockface'
import FluxEditorMonaco from 'src/shared/components/FluxMonacoEditor'

// Utils
import {formatQueryText} from 'src/flows/shared/utils'

// Contexts
import {PopupContext} from 'src/flows/context/popup'

// Types
import {EditorType} from 'src/types'

// Constants
const MONACO_LINE_EL_CLASS = 'view-line'
const MAX_PREVIEW_HEIGHT = 300

const QueryTextPreview: FC = () => {
  const editor = useRef<EditorType>(null)
  const {data} = useContext(PopupContext)

  const handleSetEditorInstance = (monacoEditor: EditorType): void => {
    editor.current = monacoEditor
  }

  const {text, lineCount} = formatQueryText(data.query)

  const {height} = document
    .getElementsByClassName(MONACO_LINE_EL_CLASS)[0]
    .getBoundingClientRect()

  const heightPixels = Math.min(height * (lineCount + 1), MAX_PREVIEW_HEIGHT)

  return (
    <Form.Element label="">
      <div
        className="flow-visualization--script-preview"
        style={{height: `${heightPixels}px`}}
      >
        <FluxEditorMonaco
          script={text}
          onChangeScript={() => {}}
          readOnly={true}
          autogrow
          setEditorInstance={handleSetEditorInstance}
        />
      </div>
    </Form.Element>
  )
}

export default QueryTextPreview
