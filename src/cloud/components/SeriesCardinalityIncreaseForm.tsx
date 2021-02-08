// Libraries
import React, {FC, useState} from 'react'

// Components
import {
  Form,
  Input,
  Button,
  Heading,
  TextArea,
  ButtonType,
  ButtonShape,
  InfluxColors,
  ComponentSize,
  ComponentColor,
  HeadingElement,
  ComponentStatus,
} from '@influxdata/clockface'

interface Props {
  orgID: string
}

export const SeriesCardinalityIncreaseForm: FC<Props> = ({orgID}) => {
  const [increaseAmount, onChangeIncreaseAmount] = useState<string>('')
  const [requestDetails, onChangeRequestDetails] = useState<string>('')

  const handleAmountValidation = (value: string): string | null => {
    if (!value) {
      return 'Amount is required'
    }
    return null
  }

  const handleDetailsValidation = (value: string): string | null => {
    if (!value) {
      return 'Use-case details are required'
    }
    return null
  }

  const isFormValid = (): boolean => {
    return !!increaseAmount && !!requestDetails
  }

  const handleSubmit = (): void => {
    window.open(
      `mailto:support@influxdata.com?subject=Request%20Series%20Cardinality%20Increase&body=Organization ID%3A%20${orgID}%0D%0A%0D%0ARequested Series Cardinality Limit:%20${increaseAmount}%0D%0A%0D%0AUse-Case Details:%0D%0A${requestDetails}`
    )
  }

  return (
    <Form onSubmit={handleSubmit}>
      <Form.Divider lineColor={InfluxColors.Castle} />
      <Heading element={HeadingElement.H4}>
        Request Series Cardinality Limit Increase
      </Heading>
      <Form.ValidationElement
        label="Approximate Series Cardinality Needed"
        validationFunc={handleAmountValidation}
        value={increaseAmount}
        required={true}
      >
        {status => (
          <Input
            name="Approximate Series Cardinality Needed"
            placeholder="Tell us how much series cardinality you need."
            required={true}
            status={status}
            autoFocus={true}
            value={increaseAmount}
            onChange={e => onChangeIncreaseAmount(e.target.value)}
            testID="rate-alert-form-amount"
          />
        )}
      </Form.ValidationElement>
      <Form.ValidationElement
        label="Use-Case Details"
        validationFunc={handleDetailsValidation}
        value={requestDetails}
        required={true}
      >
        {status => (
          <TextArea
            name="Use-Case Details"
            placeholder="Tell us about your use-case, what you've tried so far, and why you need an increase."
            status={status}
            value={requestDetails}
            onChange={e => onChangeRequestDetails(e.target.value)}
            testID="rate-alert-form-details"
            rows={10}
          />
        )}
      </Form.ValidationElement>
      <Button
        shape={ButtonShape.Default}
        type={ButtonType.Submit}
        size={ComponentSize.Medium}
        color={ComponentColor.Primary}
        className="rate-alert--request-increase-button"
        text="Submit Request"
        status={
          isFormValid() ? ComponentStatus.Default : ComponentStatus.Disabled
        }
      />
    </Form>
  )
}
