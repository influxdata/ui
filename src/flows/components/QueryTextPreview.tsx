// Libraries
import React, {FC, useContext} from 'react'

// Components
import {Form} from '@influxdata/clockface'
import FluxEditorMonaco from 'src/shared/components/FluxMonacoEditor'

// Utils
import {formatQueryText} from 'src/flows/shared/utils'

// Contexts
import {PopupContext} from 'src/flows/context/popup'

const QueryTextPreview: FC = () => {
  const {data} = useContext(PopupContext)
  const {text} = formatQueryText(data.query)

  return (
    <Form.Element label="">
      <FluxEditorMonaco
        script={text}
        onChangeScript={() => {}}
        readOnly
        autogrow
      />
    </Form.Element>
  )
}

export default QueryTextPreview
