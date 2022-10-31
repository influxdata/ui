// Libraries
import React, {FC, useCallback, useEffect, useState} from 'react'
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
  ComponentStatus,
} from '@influxdata/clockface'
import {EditResourceAccordion} from 'src/authorizations/components/EditResourceAccordion'
import SearchWidget from 'src/shared/components/search_widget/SearchWidget'

// Types
import {Authorization, ResourceType} from 'src/types'

// Actions
import {updateAuthorization} from 'src/authorizations/actions/thunks'
import {getTelegraf} from 'src/telegrafs/actions/thunks'
import {getBucketSchema} from 'src/buckets/actions/thunks'

// Utills
import {formatPermissionsObj} from 'src/authorizations/utils/permissions'
import {isEmpty} from 'lodash'
import {event} from 'src/cloud/utils/reporting'
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
  const [status, setStatus] = useState(ComponentStatus.Disabled)
  const [togglestatus, setToggleStatus] = useState(
    props.auth.status === 'active'
  )
  const [label, setlabel] = useState(props.auth.status)
  const [permissions, setPermissions] = useState([])
  const [searchTerm, setSearchTerm] = useState('')

  const {auth, getTelegraf, getBucketSchema} = props

  const formatPermissions = useCallback(async () => {
    const newPerms = auth.permissions

    for (let i = 0; i < auth.permissions.length; i++) {
      const name = auth.permissions[i].resource.name
      if (!name) {
        if (
          auth.permissions[i].resource.type === ResourceType.Telegrafs &&
          auth.permissions[i].resource.id
        ) {
          try {
            const telegraf = await getTelegraf(auth.permissions[i].resource.id)
            newPerms[i].resource.name = telegraf
          } catch (e) {
            newPerms[i].resource.name = 'Resource deleted'
          }
        } else if (
          auth.permissions[i].resource.type === ResourceType.Buckets &&
          auth.permissions[i].resource.id
        ) {
          try {
            const bucket = await getBucketSchema(
              auth.permissions[i].resource.id
            )
            newPerms[i].resource.name = bucket.name
          } catch (e) {
            newPerms[i].resource.name = 'Resource deleted'
          }
        }
      }
    }

    setPermissions(newPerms)
  }, [auth.permissions, getBucketSchema, getTelegraf])

  useEffect(() => {
    if (isEmpty(permissions)) {
      formatPermissions()
    }
  }, [permissions, formatPermissions])

  const handleInputChange = event => {
    setDescription(event.target.value)
    setStatus(ComponentStatus.Default)
  }

  const handleChangeSearchTerm = (searchTerm: string): void => {
    setSearchTerm(searchTerm)
  }

  const handleDismiss = () => props.onDismissOverlay()

  const changeToggle = () => {
    setStatus(ComponentStatus.Default)
    event('tokens.status.updated')
    if (togglestatus) {
      setToggleStatus(false)
      setlabel('inactive')
    } else {
      setToggleStatus(true)
      setlabel('active')
    }
  }

  const onSave = () => {
    const {auth, updateAuthorization} = props

    updateAuthorization({
      ...auth,
      description: description,
      status: togglestatus ? 'active' : 'inactive',
    })
    handleDismiss()
  }

  return (
    <Overlay.Container maxWidth={800}>
      <Overlay.Header
        className="overlay-header"
        title="API Token Summary"
        onDismiss={handleDismiss}
      />
      <Overlay.Body>
        <FlexBox
          alignItems={AlignItems.FlexStart}
          margin={ComponentSize.Medium}
          direction={FlexDirection.Column}
          justifyContent={JustifyContent.SpaceBetween}
          testID="custom-api-token-toggle"
        >
          <FlexBox margin={ComponentSize.Medium} direction={FlexDirection.Row}>
            <SlideToggle
              active={togglestatus}
              size={ComponentSize.ExtraSmall}
              onChange={changeToggle}
            />
            <InputLabel active={togglestatus}>{labels[label]}</InputLabel>
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
          </Form>
          <FlexBox.Child className="main-flexbox-child">
            <SearchWidget
              searchTerm={searchTerm}
              placeholderText="Filter Access Permissions..."
              onSearch={handleChangeSearchTerm}
            />
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
            <EditResourceAccordion
              permissions={formatPermissionsObj(permissions)}
              searchTerm={searchTerm}
            />
          </FlexBox.Child>
        </FlexBox>
      </Overlay.Body>
      <Overlay.Footer className="overlay-footer">
        <Button
          color={ComponentColor.Tertiary}
          text="Cancel"
          onClick={handleDismiss}
          testID="token-cancel-btn"
        />
        <Button
          color={ComponentColor.Primary}
          text="Save"
          onClick={onSave}
          testID="token-save-btn"
          status={status}
        />
      </Overlay.Footer>
    </Overlay.Container>
  )
}

const mdtp = {
  updateAuthorization,
  getTelegraf,
  getBucketSchema,
}

const connector = connect(null, mdtp)

export default connector(EditTokenOverlay)
