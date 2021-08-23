// Libraries
import React, {FC, useState} from 'react'
import {connect, ConnectedProps} from 'react-redux'

// Components
import {
  Overlay,
  Form,
  Input,
  FlexBox,
  AlignItems,
  FlexDirection,
  InputLabel,
  SlideToggle,
  ComponentSize,
  JustifyContent,
} from '@influxdata/clockface'

// Types
import {Authorization} from 'src/types'

// Actions
import {
  updateAuthorization,
} from 'src/authorizations/actions/thunks'


interface OwnProps {
  auth: Authorization
  onDismissOverlay: () => void
}

type ReduxProps = ConnectedProps<typeof connector>

type Props = ReduxProps & OwnProps

const EditTokenOverlay: FC<Props> = props => {
  const [description, setDescription] = useState(props.auth.description)

  let isTokenEnabled = () => {
    const {auth} = props
    
    return auth.status === 'active'
  }
  const labelText = isTokenEnabled() ? 'Active' : 'Inactive'

  const changeToggle = () => {
    const {onUpdate} = props
    const auth = {...props.auth}
    auth.status = auth.status === 'active' ? 'inactive' : 'active'
    onUpdate(auth)
    console.log(auth.status)
  }

  
  
  
  const handleDismiss = () => {
    props.onDismissOverlay()
  }

  const handleInputChange = event => {
    setDescription(event.target.value)
  }

  

  return (
    <Overlay.Container maxWidth={830}>
      <Overlay.Header title="API Token Summary" onDismiss={handleDismiss} />
      <Overlay.Body>
        <FlexBox margin={ComponentSize.Medium}  direction={FlexDirection.Row}>
          <SlideToggle
            active={isTokenEnabled()}
            size={ComponentSize.ExtraSmall}
            onChange={changeToggle}
          />
          <InputLabel active={isTokenEnabled()}>{labelText}</InputLabel>
        </FlexBox>
        <Form>
        
          <FlexBox
            alignItems={AlignItems.Center}
            direction={FlexDirection.Column}
            margin={ComponentSize.Large}
          >
            <Form.Element label="Description">
              <Input
                placeholder="Describe this token"
                value={description}
                onChange={handleInputChange}
                testID="custom-api-token-input"
              />
            </Form.Element>
          </FlexBox>
        </Form>
      </Overlay.Body>
    </Overlay.Container>
  )
}

const mdtp = {
  onUpdate: updateAuthorization,
}

const connector = connect(null, mdtp)

export default connector(EditTokenOverlay)