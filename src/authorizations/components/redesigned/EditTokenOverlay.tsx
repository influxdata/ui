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

const labels = {
  active: 'Active',
  inactive: 'Inactive'
};

const EditTokenOverlay: FC<Props> = props => {
  const [description, setDescription] = useState(props.auth.description)

  

  const changeToggle = () => {
    const {onUpdate, auth} = props
    
    onUpdate({
      ...auth,
      status: auth.status === 'active' ? 'inactive' : 'active'
    })
    

  }

  const handleDismiss = () => props.onDismissOverlay()

  const handleInputChange = event => setDescription(event.target.value)

  

  return (
    <Overlay.Container maxWidth={830}>
      <Overlay.Header title="API Token Summary" onDismiss={handleDismiss} />
      <Overlay.Body>
        <FlexBox margin={ComponentSize.Medium}  direction={FlexDirection.Row}>
          <SlideToggle
            active={props.auth.status === 'active'}
            size={ComponentSize.ExtraSmall}
            onChange={changeToggle}
          />
          <InputLabel active={props.auth.status === 'active'}>{labels[props.auth.status]}</InputLabel>
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