import React, {FC} from 'react'
import {Form} from '@influxdata/clockface'
import FluxEditor from 'src/shared/components/FluxMonacoEditor'

type Props = {
  formattedQueryText: string
}

const QueryTextPreview: FC<Props> = ({formattedQueryText}) => (
  <Form.Element label="" style={{height: 300, position: 'relative'}}>
    <div className="flux-editor">
      <div className="flux-editor--left-panel">
        <FluxEditor
          script={formattedQueryText}
          onChangeScript={() => {}}
          onSubmitScript={() => {}}
          setEditorInstance={() => {}}
        />
      </div>
    </div>
  </Form.Element>
)

export default QueryTextPreview
