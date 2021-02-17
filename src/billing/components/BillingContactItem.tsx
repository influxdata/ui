import React from 'react'

import {Columns, Grid, Form} from '@influxdata/clockface'

const BillingContactItem = ({header, children}) => {
  return (
    <Grid.Column widthXS={Columns.Twelve} widthSM={Columns.Four}>
      <Form.Element label={header}>
        <div className="billing--contact-info">{children}</div>
      </Form.Element>
    </Grid.Column>
  )
}

export default BillingContactItem
