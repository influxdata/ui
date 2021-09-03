// Libraries
import React, {FC, useState} from 'react'

// Components
import {
  Form,
  Input,
  Button,
  Heading,
  ButtonType,
  ButtonShape,
  InfluxColors,
  ComponentSize,
  ComponentColor,
  HeadingElement,
  ComponentStatus,
  Overlay,
} from '@influxdata/clockface'
import {event} from 'src/cloud/utils/reporting'

export const ShareLinkOverlay: FC = () => {
  const [increaseAmount, onChangeIncreaseAmount] = useState<string>('')
  const {closeFn} = useContext(PopupContext)

  const handleAmountValidation = (value: string): string | null => {
    if (!value) {
      return 'Amount is required'
    }
    return null
  }

  const isFormValid = (): boolean => {
    return !!increaseAmount
  }

  const handleSubmit = (): void => {
    window
      .open
      // `mailto:support@influxdata.com?subject=Request%20Series%20Cardinality%20Increase&body=Organization ID%3A%20${orgID}%0D%0A%0D%0ARequested Series Cardinality Limit:%20${increaseAmount}%0D%0A%0D%0AUse-Case Details:%0D%0A${requestDetails}`
      ()
  }

  const closer = () => {
    event('Export Task Overlay Closed')

    closeFn()
  }

  return (
    <Overlay visible={true}>
      <Overlay.Container maxWidth={700}>
        <Overlay.Header
          title="Export As Task"
          onDismiss={closer}
          testID="export-as-overlay--header"
        />
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
      </Overlay.Container>
    </Overlay>
  )
}
