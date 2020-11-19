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
import {MONACO_LINE_HEIGHT} from 'src/shared/constants/fluxEditor'
const MAX_PREVIEW_HEIGHT = 300

const QueryTextPreview: FC = () => {
  const editor = useRef<EditorType>(null)
  const {data} = useContext(PopupContext)

  const handleSetEditorInstance = (monacoEditor: EditorType): void => {
    editor.current = monacoEditor
  }

  const {text, lineCount} = formatQueryText(data.query)

  const heightPixels = Math.min(
    MONACO_LINE_HEIGHT * (lineCount + 1),
    MAX_PREVIEW_HEIGHT
  )

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
