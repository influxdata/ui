import React, {FC, useState, useContext} from 'react'
import 'src/authorizations/components/redesigned/customApiTokenOverlay.scss'

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
import {connect} from 'react-redux'
import {AppState} from 'src/types'

interface OwnProps {
  onClose: () => void
}

interface StateProps {
  allResources: string[]
}

const CustomApiTokenOverlay: FC<OwnProps & StateProps> = props => {
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
            <FlexBox.Child className="main-flexbox-child">
              <FlexBox
                margin={ComponentSize.Large}
                justifyContent={JustifyContent.SpaceBetween}
                direction={FlexDirection.Row}
                stretchToFitWidth={true}
                alignItems={AlignItems.Center}
                className="flex-box-label"
              >
                <FlexBox.Child basis={40} grow={8}>
                  <InputLabel size={ComponentSize.ExtraSmall}>
                    Resources
                  </InputLabel>
                </FlexBox.Child>
                <FlexBox.Child grow={1} className="flexbox-child-label-read">
                  <InputLabel
                    className="input-label-read"
                    size={ComponentSize.ExtraSmall}
                  >
                    Read
                  </InputLabel>
                </FlexBox.Child>
                <FlexBox.Child grow={1} className="flexbox-child-label-write">
                  <InputLabel
                    className="input-label-write"
                    size={ComponentSize.ExtraSmall}
                  >
                    Write
                  </InputLabel>
                </FlexBox.Child>
              </FlexBox>
              <ResourceAccordion resources={props.allResources} />
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

const mstp = (state: AppState) => {
  return {
    allResources: state.resources.tokens.allResources,
  }
}

export default connect(mstp)(CustomApiTokenOverlay)
