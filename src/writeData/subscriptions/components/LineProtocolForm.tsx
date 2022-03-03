// Libraries
import React, {FC} from 'react'

// Components
import {Grid, TextArea} from '@influxdata/clockface'

// Styles
import 'src/writeData/subscriptions/components/LineProtocolForm.scss'

const LineProtocolForm: FC = () => (
  <div className="line-protocol-form">
    <Grid.Column>
      <div className="form-text">
        Great news, Line Protocol doesn’t need additional parsing rules!
      </div>
      <h2 className="form-header">Validate your Line Protocol</h2>
      <TextArea
        name="validate"
        value={''}
        onChange={() => {}}
        style={{height: '146px', minHeight: '146px'}}
        ref={null}
        maxLength={255}
        testID="line-protocol-validate"
      />
    </Grid.Column>
  </div>
)

export default LineProtocolForm
