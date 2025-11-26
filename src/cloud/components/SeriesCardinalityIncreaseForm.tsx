// Libraries
import React, {FC} from 'react'

// Components
import {
  Form,
  Heading,
  InfluxColors,
  HeadingElement,
} from '@influxdata/clockface'

export const SeriesCardinalityIncreaseForm: FC = () => {
  return (
    <div>
      <Form.Divider lineColor={InfluxColors.Grey15} />
      <Heading element={HeadingElement.H4}>
        Request Series Cardinality Limit Increase
      </Heading>
      <p>
        To request a cardinality limit increase, please use the Contact Support
        option in the Help menu.
      </p>
    </div>
  )
}
