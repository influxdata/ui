import React, {FC, useContext} from 'react'
import {Form} from '@influxdata/clockface'
import FluxEditor from 'src/shared/components/FluxMonacoEditor'
import {formatQueryText} from 'src/flows/shared/utils'
import {PopupContext} from 'src/flows/context/popup'

const QueryTextPreview: FC = () => {
  const {data} = useContext(PopupContext)

  const formattedQueryText = formatQueryText(data.query)

  return (
    <Form.Element label="" style={{height: 300, position: 'relative'}}>
      <div className="flux-editor">
        <div className="flux-editor--left-panel">
          <FluxEditor
            script={formattedQueryText}
            onChangeScript={() => {}}
            readOnly={true}
          />
        </div>
      </div>
    </Form.Element>
  )
}

export default QueryTextPreview
