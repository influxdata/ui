import React, {FC} from 'react'

import {Columns, Grid, Form} from '@influxdata/clockface'

type Props = {
  header: string
  value: string
}

const BillingContactItem: FC<Props> = ({header, value}) => (
  <Grid.Column widthXS={Columns.Twelve} widthSM={Columns.Four}>
    <Form.Element label={header} testID={`form-label--${header}`}>
      <div
        className="billing--contact-info"
        data-testid={`contact-info--${value}`}
      >
        {value}
      </div>
    </Form.Element>
  </Grid.Column>
)

export default BillingContactItem
