// Libraries
import React, {ChangeEvent, FC, useState, useContext, useMemo} from 'react'
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
import {getIdpeMeThunk} from 'src/me/actions/thunks/index'

// Contexts
import {OverlayContext} from 'src/overlays/components/OverlayController'

// Utils
import {allAccessPermissions} from 'src/authorizations/utils/permissions'
import {event} from 'src/cloud/utils/reporting'

// Selectors
import {getOrg} from 'src/organizations/selectors'
import {getMe} from 'src/me/selectors'
import {getAllTokensResources} from 'src/resources/selectors'

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
  const allPermissionTypes = useSelector(getAllTokensResources)

  const sortedPermissionTypes = useMemo(
    () =>
      allPermissionTypes.sort((a, b) =>
        a.toLowerCase().localeCompare(b.toLowerCase())
      ),
    [allPermissionTypes]
  )

  const handleSave = () => {
    if (!meID) {
      dispatch(getIdpeMeThunk())
    }

    const token: Authorization = {
      orgID,
      description,
      permissions: allAccessPermissions(sortedPermissionTypes, orgID, meID),
    }

    Promise.resolve(dispatch(createAuthorization(token))).then(() => {
      event('token.allAccess.create.success', {meID, name: description})
      dispatch(showOverlay('access-token', null, () => dismissOverlay()))
    }, handleDismiss)
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
                icon={IconFont.Remove_New}
                onClick={handleDismiss}
              />

              <Button
                text="Save"
                testID="button--save"
                icon={IconFont.CheckMark_New}
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
