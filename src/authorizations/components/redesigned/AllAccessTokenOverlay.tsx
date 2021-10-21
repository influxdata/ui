// Libraries
import React, {ChangeEvent, FC, useState, useContext} from 'react'
import {useDispatch, useSelector} from 'react-redux'

// Components
import {
  Alert,
  IconFont,
  ComponentColor,
  FlexBox,
  AlignItems,
  FlexDirection,
  ComponentSize,
  Button,
  ButtonType,
  Input,
  Overlay,
  Form,
} from '@influxdata/clockface'

// Actions
import {createAuthorization} from 'src/authorizations/actions/thunks'
import {showOverlay, dismissOverlay} from 'src/overlays/actions/overlays'

// Contexts
import {OverlayContext} from 'src/overlays/components/OverlayController'

// Utils
import {allAccessPermissions} from 'src/authorizations/utils/permissions'

// Selectors
import {getOrg} from 'src/organizations/selectors'
import {getMe} from 'src/me/selectors'

// Types
import {Authorization} from 'src/types'

interface OwnProps {
  onClose: () => void
}

const AllAccessTokenOverlay: FC<OwnProps> = props => {
  const {onClose} = useContext(OverlayContext)
  const dispatch = useDispatch()
  const [description, setDescription] = useState<string>('')
  const {id: orgID} = useSelector(getOrg)
  const {id: meID} = useSelector(getMe)

  const handleSave = () => {
    const token: Authorization = {
      orgID,
      description,
      permissions: allAccessPermissions(orgID, meID),
    }
    dispatch(createAuthorization(token))
    handleDismiss()
    dispatch(showOverlay('access-token', null, () => dismissOverlay()))
  }

  const handleInputChange = (event: ChangeEvent<HTMLInputElement>) => {
    const {value} = event.target
    setDescription(value)
  }

  const handleDismiss = () => {
    props.onClose()
  }

  return (
    <Overlay.Container maxWidth={500}>
      <Overlay.Header
        title="Generate All Access API Token"
        onDismiss={onClose}
      />
      <Overlay.Body>
        <Form onSubmit={handleSave}>
          <FlexBox
            alignItems={AlignItems.Center}
            direction={FlexDirection.Column}
            margin={ComponentSize.Large}
          >
            <Alert icon={IconFont.AlertTriangle} color={ComponentColor.Warning}>
              This token will be able to create, update, delete, read, and write
              to anything in this organization
            </Alert>
            <Form.Element label="Description">
              <Input
                placeholder="Describe this new API token"
                value={description}
                onChange={handleInputChange}
                testID="all-access-token-input"
              />
            </Form.Element>

            <Form.Footer>
              <Button
                text="Cancel"
                color={ComponentColor.Tertiary}
                icon={IconFont.Remove}
                onClick={handleDismiss}
              />

              <Button
                text="Save"
                testID="button--save"
                icon={IconFont.Checkmark}
                color={ComponentColor.Success}
                type={ButtonType.Submit}
              />
            </Form.Footer>
          </FlexBox>
        </Form>
      </Overlay.Body>
    </Overlay.Container>
  )
}

export default AllAccessTokenOverlay
