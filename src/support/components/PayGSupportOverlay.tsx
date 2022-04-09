import React, {FC, useContext, useState} from 'react'

// Components
import {
  Overlay,
  Button,
  ButtonType,
  ComponentColor,
  Columns,
  Form,
  Input,
  Dropdown,
  Grid,
  TextArea,
} from '@influxdata/clockface'
import {SafeBlankLink} from 'src/utils/SafeBlankLink'

// Contexts
import {OverlayContext} from 'src/overlays/components/OverlayController'

// Types
import ErrorBoundary from 'src/shared/components/ErrorBoundary'

interface OwnProps {
  onClose: () => void
}

const PayGSupportOverlay: FC<OwnProps> = () => {
  const [subject, setSubject] = useState('')
  const {onClose} = useContext(OverlayContext)

  const handleSubmit = (): void => {
    // submit support form
  }

  const handleSubjectValidation = (): void => {
    // validate user input
  }

  const handleChangeInput = e => {
    const {value} = e.target
    setSubject(value)
  }

  return (
    <Overlay.Container maxWidth={600}>
      <Overlay.Header
        testID="payg-support-overlay-header"
        title="Contact Support"
        onDismiss={onClose}
      />
      <ErrorBoundary>
        <Overlay.Body>
          <p>
            Check our{' '}
            <SafeBlankLink href="https://status.influxdata.com">
              status page
            </SafeBlankLink>{' '}
            to see if there is an outage impacting your region.
          </p>
          <Form onSubmit={handleSubmit}>
            <div>
              <Form.ValidationElement
                label="Subject"
                value={subject}
                required={true}
                prevalidate={true}
                validationFunc={handleSubjectValidation}
              >
                {status => (
                  <Input
                    testID="subject-input"
                    name="subject"
                    autoFocus={true}
                    value={subject}
                    onChange={handleChangeInput}
                    status={status}
                  />
                )}
              </Form.ValidationElement>
            </div>
            <Form.Element label="Severity" required={true}>
              <Dropdown
                button={(active, onClick) => (
                  <Dropdown.Button
                    active={active}
                    onClick={onClick}
                    testID="support-dropdown--button"
                  ></Dropdown.Button>
                )}
                // menu={onCollapse => (
                //   <Dropdown.Menu onCollapse={onCollapse}>))</Dropdown.Menu>
                // )}
              />
            </Form.Element>
            {/* <Grid.Column widthSM={Columns.Twelve}> */}
            <Form.Element label="Description" required={true}>
              <TextArea
                rows={10}
                //   className="endpoint-description--textarea"
                testID="endpoint-description--textarea"
                name="description"
                //   value={endpoint.description}
                //   onChange={handleChange}
              />
            </Form.Element>
            {/* </Grid.Column> */}

            <Overlay.Footer className="overlay-footer">
              <Button
                text="Cancel"
                color={ComponentColor.Tertiary}
                onClick={onClose}
                // titleText="Cancel creation of Label and return to list"
                type={ButtonType.Button}
                testID="payg-contact-support--cancel"
              />
              <Button
                text="Submit"
                color={ComponentColor.Success}
                type={ButtonType.Submit}
                testID="payg-contact-support--submit"
                // status={
                //   isFormValid ? ComponentStatus.Default : ComponentStatus.Disabled
                // }
              />
            </Overlay.Footer>
          </Form>
        </Overlay.Body>
      </ErrorBoundary>
    </Overlay.Container>
  )
}

export default PayGSupportOverlay
