import React, {FC} from 'react'
import {Form} from '@influxdata/clockface'
import MonacoEditor from 'react-monaco-editor'
import THEME_NAME from 'src/external/monaco.toml.theme'
import TOMLLANGID from 'src/external/monaco.toml.syntax'

type Props = {
  formattedQueryText?: string
}

const QueryTextPreview: FC<Props> = ({formattedQueryText = ''}) => (
  <Form.Element label="" style={{height: 300, position: 'relative'}}>
    <div className="flux-editor">
      <div className="flux-editor--left-panel">
        <MonacoEditor
          language={TOMLLANGID}
          theme={THEME_NAME}
          value={formattedQueryText}
          onChange={() => {}}
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
            readOnly: true,
          }}
        />
      </div>
    </div>
  </Form.Element>
)

export default QueryTextPreview
