// Libraries
import React, {FC} from 'react'

// Components
import {
  Form,
  Button,
  Heading,
  ButtonShape,
  InfluxColors,
  ComponentSize,
  ComponentColor,
  HeadingElement,
} from '@influxdata/clockface'

export const SeriesCardinalityIncreaseForm: FC = () => {
  const handleSubmit = (): void => {
    window.open(`https://support.influxdata.com/s/login`)
  }

  return (
    <div>
      <Form.Divider lineColor={InfluxColors.Grey15} />
      <Heading element={HeadingElement.H4}>
        Request Series Cardinality Limit Increase
      </Heading>
      <p>
        To request a series cardinality limit increase, please contact our
        support team.
      </p>
      <Button
        shape={ButtonShape.Default}
        onClick={handleSubmit}
        size={ComponentSize.Medium}
        color={ComponentColor.Primary}
        className="rate-alert--request-increase-button"
        text="Submit Request"
      />
    </div>
  )
}
