import React, {FC, useState, useContext} from 'react'

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
  InputLabel,
  JustifyContent,
} from '@influxdata/clockface'

import ResourceAccordion from './ResourceAccordion'

// Contexts
import {OverlayContext} from 'src/overlays/components/OverlayController'

interface OwnProps {
  onClose: () => void
}

export const CustomApiTokenOverlay: FC<OwnProps> = props => {
  const resources = ['telegrafs', 'buckets']
  const handleDismiss = () => {
    props.onClose()
  }

  const {onClose} = useContext(OverlayContext)
  const [description, setDescription] = useState('')

  const handleInputChange = event => {
    setDescription(event.target.value)
  }

  return (
    <Overlay.Container maxWidth={800}>
      <Overlay.Header
        title="Generate a Personal Api Token"
        onDismiss={onClose}
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
            <FlexBox.Child style={{width: '100%'}}>
              <FlexBox
                margin={ComponentSize.Large}
                justifyContent={JustifyContent.SpaceBetween}
                direction={FlexDirection.Row}
                stretchToFitWidth={true}
                alignItems={AlignItems.Center}
                style={{textAlign: 'start', margin: '5px 0px'}}
              >
                <FlexBox.Child basis={40} grow={8}>
                  <InputLabel size={ComponentSize.ExtraSmall}>
                    Resources
                  </InputLabel>
                </FlexBox.Child>
                <FlexBox.Child
                  grow={1}
                  style={{alignItems: 'left', marginLeft: '20px'}}
                >
                  <InputLabel
                    style={{marginLeft: '20px'}}
                    size={ComponentSize.ExtraSmall}
                  >
                    Read
                  </InputLabel>
                </FlexBox.Child>
                <FlexBox.Child
                  grow={1}
                  style={{alignItems: 'left', marginRight: '20px'}}
                >
                  <InputLabel
                    style={{marginRight: '20px'}}
                    size={ComponentSize.ExtraSmall}
                  >
                    Write
                  </InputLabel>
                </FlexBox.Child>
              </FlexBox>
              <ResourceAccordion resources={resources} />
            </FlexBox.Child>
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
