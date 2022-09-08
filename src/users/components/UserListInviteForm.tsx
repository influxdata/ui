// Libraries
import React, {ChangeEvent, FC, useContext, useState} from 'react'

// Components
import {UsersContext} from 'src/users/context/users'
import UserRoleDropdown from './UserRoleDropdown'
import UserInviteSubmit from './UserInviteSubmit'
import {
  Columns,
  ComponentSize,
  FontWeight,
  Form,
  Grid,
  Heading,
  HeadingElement,
  Input,
  InputType,
  Panel,
} from '@influxdata/clockface'
import {gaEvent} from 'src/cloud/utils/reporting'

// Constants
import {GTM_INVITE_SENT} from 'src/users/constants'

interface InviteErrors {
  email?: string
}

const UserListInviteForm: FC = () => {
  const [errors, setErrors] = useState<InviteErrors>({})
  const {draftInvite, handleEditDraftInvite, handleInviteUser} =
    useContext(UsersContext)

  const onInviteUser = () => {
    handleInviteUser()
    // Google Tag Manager event for sending an invitation
    gaEvent(GTM_INVITE_SENT)
  }

  const onChangeInvitee = (e: ChangeEvent<HTMLInputElement>) => {
    setErrors({})
    handleEditDraftInvite({...draftInvite, email: e.target.value})
  }

  return (
    <Grid>
      <Grid.Row>
        <Grid.Column widthMD={Columns.Ten} widthLG={Columns.Six}>
          <Panel className="user-list-invite--form-panel">
            <Panel.Header>
              <Heading
                weight={FontWeight.Light}
                element={HeadingElement.H2}
                className="user-list-invite--form-heading"
              >
                Add a new user to your organization
              </Heading>
            </Panel.Header>
            <Panel.Body size={ComponentSize.Small}>
              <Form onSubmit={onInviteUser} className="user-list-invite--form">
                <Form.Element
                  label="Enter user Email Address"
                  className="element email--input"
                  errorMessage={errors.email}
                >
                  <Input
                    testID="email--input"
                    placeholder="email address"
                    onChange={onChangeInvitee}
                    value={draftInvite.email}
                    type={InputType.Email}
                    required={true}
                  />
                </Form.Element>
                <Form.Element
                  label="Assign a Role"
                  className="element role--dropdown"
                >
                  <UserRoleDropdown />
                </Form.Element>
                <Form.Element label="" className="element submit--button">
                  <UserInviteSubmit />
                </Form.Element>
              </Form>
            </Panel.Body>
          </Panel>
        </Grid.Column>
      </Grid.Row>
    </Grid>
  )
}

export default UserListInviteForm
