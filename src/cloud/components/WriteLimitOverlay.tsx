import React, {useState, useContext, FC} from 'react'
import {useDispatch, useSelector} from 'react-redux'

import {
  OverlayContainer,
  Overlay,
  Form,
  Heading,
  Input,
  HeadingElement,
  Button,
  ButtonType,
  ButtonShape,
  ComponentSize,
  ComponentColor,
  ComponentStatus,
  InputType,
} from '@influxdata/clockface'

import {OverlayContext} from 'src/overlays/components/OverlayController'
import {showOverlay, dismissOverlay} from 'src/overlays/actions/overlays'

// Selectors
import {selectQuartzIdentity} from 'src/identity/selectors'

// Design
import './WriteLimitOverlay.scss'

const WriteLimitOverlay: FC = () => {
  const [limitReason, setLimitReason] = useState('')

  const {onClose} = useContext(OverlayContext)
  const dispatch = useDispatch()
  const quartzIdentity = useSelector(selectQuartzIdentity)
  const {org: identityOrg} = quartzIdentity.currentIdentity

  const handleSubmit = (): void => {
    const orgName = identityOrg.name
    const orgID = identityOrg.id

    dispatch(
      showOverlay(
        'contact-support',
        {
          subject: `[Org: ${orgName}] [Org Id: ${orgID}] Request Query Write Limit Increase`,
          description: limitReason,
        },
        dismissOverlay
      )
    )
  }

  return (
    <OverlayContainer
      maxWidth={760}
      testID="rate-limit-overlay"
      className="rate-limit-overlay"
    >
      <Overlay.Header
        title={`Let's get your data flowing again.`}
        onDismiss={onClose}
        wrapText={true}
      />
      <Overlay.Body className="limits-increasewrites--body">
        <Form onSubmit={handleSubmit} className="limits-increasewrites--form">
          <Heading element={HeadingElement.H4}>
            Request Query Write Limit Increase
          </Heading>
          <Form.Element label="Request Details" required={true}>
            <Input
              name="Write Limit Increase"
              placeholder="Tell us how much you need your write limit raised and your use-case details"
              required={true}
              autoFocus={true}
              value={limitReason}
              onChange={e => setLimitReason(e.target.value)}
              testID="rate-alert-form-amount"
              type={InputType.Text}
            />
          </Form.Element>
        </Form>
      </Overlay.Body>
      <Overlay.Footer>
        <Button
          shape={ButtonShape.Default}
          type={ButtonType.Submit}
          size={ComponentSize.Medium}
          color={ComponentColor.Tertiary}
          text="Cancel"
          onClick={onClose}
        />
        <Button
          shape={ButtonShape.Default}
          onClick={handleSubmit}
          size={ComponentSize.Medium}
          color={ComponentColor.Primary}
          className="rate-alert--request-increase-button"
          text="Create Request"
          status={
            limitReason.length
              ? ComponentStatus.Default
              : ComponentStatus.Disabled
          }
        />
      </Overlay.Footer>
    </OverlayContainer>
  )
}

export default WriteLimitOverlay
