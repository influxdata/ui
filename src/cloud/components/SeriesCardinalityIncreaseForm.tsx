// Libraries
import React, {FC, useState} from 'react'
import {useDispatch, useSelector} from 'react-redux'

// Components
import {
  Form,
  Heading,
  TextArea,
  Button,
  ButtonType,
  ButtonShape,
  InfluxColors,
  ComponentSize,
  ComponentColor,
  HeadingElement,
  ComponentStatus,
} from '@influxdata/clockface'

// Actions
import {showOverlay, dismissOverlay} from 'src/overlays/actions/overlays'

// Selectors
import {selectQuartzIdentity} from 'src/identity/selectors'

export const SeriesCardinalityIncreaseForm: FC = () => {
  const dispatch = useDispatch()
  const quartzIdentity = useSelector(selectQuartzIdentity)
  const {org: identityOrg} = quartzIdentity.currentIdentity

  const [requestDetails, setRequestDetails] = useState('')

  const handleDetailsValidation = (value: string): string | null => {
    if (!value) {
      return 'Request details are required'
    }
    return null
  }

  const isFormValid = (): boolean => {
    return Boolean(requestDetails)
  }

  const handleSubmit = (): void => {
    const orgName = identityOrg.name
    const orgID = identityOrg.id

    dispatch(
      showOverlay(
        'contact-support',
        {
          subject: `[Org: ${orgName}] [Org Id: ${orgID}] Request Series Cardinality Limit Increase`,
          description: requestDetails,
        },
        dismissOverlay
      )
    )
  }

  return (
    <Form onSubmit={handleSubmit}>
      <Form.Divider lineColor={InfluxColors.Grey15} />
      <Heading element={HeadingElement.H4}>
        Request Series Cardinality Limit Increase
      </Heading>
      <Form.ValidationElement
        label="Request Details"
        validationFunc={handleDetailsValidation}
        value={requestDetails}
        required={true}
      >
        {status => (
          <TextArea
            name="Request Details"
            placeholder="Tell us how much series cardinality you need, your use-case details, what you've tried so far, and why you need an increase."
            status={status}
            value={requestDetails}
            onChange={e => setRequestDetails(e.target.value)}
            testID="cardinality-request-details"
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
        text="Create Request"
        status={
          isFormValid() ? ComponentStatus.Default : ComponentStatus.Disabled
        }
      />
    </Form>
  )
}
