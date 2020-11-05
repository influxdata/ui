import React, {FC} from 'react'
import {Form} from '@influxdata/clockface'
import FluxEditor from 'src/shared/components/FluxMonacoEditor'
import {RouteProps, useLocation} from 'react-router-dom'

const QueryTextPreview: FC = () => {
  const location: RouteProps['location'] = useLocation()
  const params = location.state
  const {queryText} = params[0]
  const formattedQueryText = queryText
    .trim()
    .split('|>')
    .join('\n  |>')

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
