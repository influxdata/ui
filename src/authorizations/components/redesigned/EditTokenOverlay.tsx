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
  Button,
  ComponentColor,
  Page,
} from '@influxdata/clockface'

// Types
import {Authorization} from 'src/types'

// Actions
import {updateAuthorization} from 'src/authorizations/actions/thunks'
import {ActionTypes} from 'src/shared/actions/app'

interface OwnProps {
  auth: Authorization
  onDismissOverlay: () => void
}

type ReduxProps = ConnectedProps<typeof connector>

type Props = ReduxProps & OwnProps

const labels = {
  active: 'Active',
  inactive: 'Inactive',
}

const EditTokenOverlay: FC<Props> = props => {
  const [description, setDescription] = useState(props.auth.description)
  const handleInputChange = event => setDescription(event.target.value)

  const handleDismiss = () => props.onDismissOverlay()

  const changeToggle = () => {
    const {onUpdate, auth} = props

    onUpdate({
      ...auth,
      status: auth.status === 'active' ? 'inactive' : 'active',
    })
  }

  const onSave = () => {
    const {onUpdate, auth} = props

    onUpdate({
      ...auth,
      description: description,
    })
    handleDismiss()
  }

  const formatPermissionsObj = () => {
    const {
      auth: {permissions},
    } = props

    const newPerms = {}
    permissions.map(perm => {
      let p
      if (newPerms.hasOwnProperty(perm.resource.type)) {
        p = {...newPerms[perm.resource.type]}
        if (
          perm.resource.id &&
          (perm.resource.type === 'buckets' ||
            perm.resource.type === 'telegrafs')
        ) {
          if (p.sublevelPermissions.hasOwnProperty(perm.resource.id)) {
            p.sublevelPermissions[perm.resource.id].permissions[
              perm.action
            ] = true
          } else {
            p.sublevelPermissions[perm.resource.id] = {
              id: perm.resource.id,
              orgID: perm.resource.orgID,
              name: perm.resource.name,
              permissions: {
                read: perm.action === 'read',
                write: perm.action === 'write',
              },
            }
          }
        } else {
          p[perm.action] = true
        }
      } else {
        if (
          perm.resource.id &&
          (perm.resource.type === 'buckets' ||
            perm.resource.type === 'telegrafs')
        ) {
          p = {
            read: false,
            write: false,
            sublevelPermissions: {
              [perm.resource.id]: {
                id: perm.resource.id,
                orgID: perm.resource.orgID,
                name: perm.resource.name,
                permissions: {
                  read: perm.action === 'read',
                  write: perm.action === 'write',
                },
              },
            },
          }
        } else {
          p = {
            read: perm.action === 'read',
            write: perm.action === 'write',
          }
        }
      }

      newPerms[perm.resource.type] = p
    })

    Object.keys(newPerms).map(resource => {
      const p = {...newPerms[resource]}
      if (p.sublevelPermissions) {
        p.read = !Object.keys(p.sublevelPermissions).some(
          key => p.sublevelPermissions[key].permissions.read === false
        )

        p.write = !Object.keys(p.sublevelPermissions).some(
          key => p.sublevelPermissions[key].permissions.write === false
        )

        newPerms[resource] = p
      }
    })
  }

  formatPermissionsObj()

  return (
    <Overlay.Container maxWidth={630}>
      <Overlay.Header title="API Token Summary" onDismiss={handleDismiss} />
      <Overlay.Body>
        <FlexBox
          alignItems={AlignItems.FlexStart}
          margin={ComponentSize.Medium}
          direction={FlexDirection.Column}
          justifyContent={JustifyContent.SpaceBetween}
        >
          <FlexBox margin={ComponentSize.Medium} direction={FlexDirection.Row}>
            <SlideToggle
              active={props.auth.status === 'active'}
              size={ComponentSize.ExtraSmall}
              onChange={changeToggle}
            />
            <InputLabel active={props.auth.status === 'active'}>
              {labels[props.auth.status]}
            </InputLabel>
          </FlexBox>
          <Form>
            <FlexBox
              direction={FlexDirection.Row}
              margin={ComponentSize.Large}
              justifyContent={JustifyContent.SpaceBetween}
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
              {/* <ResourceAccordion resources={resources} /> */}
            </FlexBox.Child>
            <Page.ControlBarCenter>
              <FlexBox margin={ComponentSize.Medium}>
                <Button
                  color={ComponentColor.Default}
                  text="Cancel"
                  onClick={handleDismiss}
                  testID="token-cancel-btn"
                />
                <Button
                  color={ComponentColor.Primary}
                  text="Save"
                  onClick={onSave}
                  testID="token-save-btn"
                />
              </FlexBox>
            </Page.ControlBarCenter>
          </Form>
        </FlexBox>
      </Overlay.Body>
    </Overlay.Container>
  )
}

const mdtp = {
  onUpdate: updateAuthorization,
}

const connector = connect(null, mdtp)

export default connector(EditTokenOverlay)
