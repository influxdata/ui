// Libraries
import React, {FC} from 'react'

// Components
import {Grid, Heading, HeadingElement, FontWeight} from '@influxdata/clockface'

// Styles
import 'src/writeData/subscriptions/components/LineProtocolForm.scss'

const LineProtocolForm: FC = () => {
  // const [lp, setLineProtocol] = useState('')
  return (
    <div className="line-protocol-form">
      <Grid.Column>
        <Heading
          element={HeadingElement.H5}
          weight={FontWeight.Regular}
          className="line-protocol-form__text"
        >
          Great news, Line Protocol doesn’t need additional parsing rules!
        </Heading>
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
