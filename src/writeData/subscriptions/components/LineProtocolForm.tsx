// Libraries
import React, {
  FC,
  // useState
} from 'react'

// Components
import {
  Grid,
  // TextArea
} from '@influxdata/clockface'

// Styles
import 'src/writeData/subscriptions/components/LineProtocolForm.scss'

const LineProtocolForm: FC = () => {
  // const [lp, setLineProtocol] = useState('')
  return (
    <div className="line-protocol-form">
      <Grid.Column>
        <div className="form-text">
          Great news, Line Protocol doesn’t need additional parsing rules!
        </div>
        {/* For a later iteration */}
        {/* <h2 className="form-header">Validate your Line Protocol</h2>
        <TextArea
          name="validate"
          value={lp}
          onChange={e => {
            setLineProtocol(e.target.value)
          }}
          style={{height: '146px', minHeight: '146px'}}
          ref={null}
          maxLength={255}
          testID="line-protocol-validate"
          placeholder="Enter a line of your data to verify that your formating is valid line protocol."
        /> */}
      </Grid.Column>
    </div>
  )
}

export default LineProtocolForm
