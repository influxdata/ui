// Libraries
import React, {FC} from 'react'

// Components
import {Form, Overlay} from '@influxdata/clockface'
import LineProtocolTabs from 'src/buckets/components/lineProtocol/configure/LineProtocolTabs'
import LineProtocolHelperText from 'src/buckets/components/lineProtocol/LineProtocolHelperText'

const LineProtocol: FC = () => (
  <Form>
    <Overlay.Body style={{textAlign: 'center'}}>
      <LineProtocolTabs />
      <LineProtocolHelperText />
    </Overlay.Body>
  </Form>
)

export default LineProtocol
