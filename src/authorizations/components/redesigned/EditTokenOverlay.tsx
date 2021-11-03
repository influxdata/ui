// Libraries
import React, {FC, useState} from 'react'
import {connect, ConnectedProps} from 'react-redux'
import 'src/authorizations/components/redesigned/customApiTokenOverlay.scss'

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
  Page,
} from '@influxdata/clockface'
import {EditResourceAccordion} from 'src/authorizations/components/redesigned/EditResourceAccordion'

// Types
import {Authorization} from 'src/types'

// Actions
import {updateAuthorization} from 'src/authorizations/actions/thunks'

// Utills
import {formatPermissionsObj} from 'src/authorizations/utils/permissions'
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

  const handleInputChange = event => {
    setDescription(event.target.value)
    setStatus(ComponentStatus.Default)
  }

  const handleDismiss = () => props.onDismissOverlay()

  const changeToggle = () => {
    setStatus(ComponentStatus.Default)

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
              permissions={formatPermissionsObj(props.auth.permissions)}
            />
          </FlexBox.Child>
          <Page.ControlBarCenter>
            <FlexBox margin={ComponentSize.Medium}>
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
            </FlexBox>
          </Page.ControlBarCenter>
        </FlexBox>
      </Overlay.Body>
    </Overlay.Container>
  )
}

const mdtp = {
  updateAuthorization,
}

const connector = connect(null, mdtp)

export default connector(EditTokenOverlay)
