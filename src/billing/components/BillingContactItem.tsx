import React from 'react'

import {GridColumn, Form} from '@influxdata/clockface'

const BillingContactItem = ({header, children}) => {
  return (
    <GridColumn widthXS="12" widthSM="4">
      <Form.Element label={header}>
        <div className="billing--contact-info">{children}</div>
      </Form.Element>
    </GridColumn>
  )
}

export default BillingContactItem
