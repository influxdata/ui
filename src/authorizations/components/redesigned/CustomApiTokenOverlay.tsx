import React, {FC, useState} from 'react'

// Components
import {
  Overlay,
  Form,
  Input,
  FlexBox,
  AlignItems,
  FlexDirection,
  ComponentSize,
  Button,
  ComponentColor,
  ButtonShape,
} from '@influxdata/clockface'

import ResourceAccordion from './ResourceAccordion'

interface OwnProps {
  onClose: () => void
}

export const CustomApiTokenOverlay: FC<OwnProps> = props => {
  // const resources = ['telegrafs', 'buckets', 'dashboards']
  const resources = ['telegrafs']
  const handleDismiss = () => {
    props.onClose()
  }
  const [description, setDescription] = useState('')

  const handleInputChange = event => {
    setDescription(event.target.value)
  }

  return (
    <Overlay.Container maxWidth={800}>
      <Overlay.Header
        title="Generate a Personal Api Token"
        onDismiss={handleDismiss}
      />
      <Overlay.Body>
        <Form>
          <FlexBox
            alignItems={AlignItems.Center}
            direction={FlexDirection.Column}
            margin={ComponentSize.Large}
          >
            <Form.Element label="Description">
              <Input
                placeholder="Describe this new token"
                value={description}
                onChange={handleInputChange}
                testID="custom-api-token-input"
              />
            </Form.Element>
            <Form.Element label="Resources">
              <ResourceAccordion resources={resources} />
            </Form.Element>
          </FlexBox>
        </Form>
      </Overlay.Body>
      <Overlay.Footer>
        <Button
          color={ComponentColor.Primary}
          shape={ButtonShape.Default}
          onClick={handleDismiss}
          testID="cancel-token-overlay--buton"
          text="Cancel"
        />
        <Button
          color={ComponentColor.Success}
          shape={ButtonShape.Default}
          onClick={() => {}}
          testID="generate-token-overlay--buton"
          text="Generate"
        />
      </Overlay.Footer>
    </Overlay.Container>
  )
}
