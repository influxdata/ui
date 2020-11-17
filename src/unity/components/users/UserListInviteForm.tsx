// Libraries
import React, {ChangeEvent, FC, useContext, useState} from 'react'

// Components
import {UserListContext, UserListContextResult} from './UsersPage'
import UserRoleDropdown from './UserRoleDropdown'
import UserInviteSubmit from './UserInviteSubmit'
import {
  Columns,
  ComponentSize,
  FontWeight,
  Form,
  Gradients,
  Grid,
  Heading,
  HeadingElement,
  IconFont,
  Input,
  Notification,
  Panel,
} from '@influxdata/clockface'

import {createOrgInvite} from 'src/unity/api'
import {gaEvent} from 'src/cloud/utils/reporting'

// Actions
import {editDraftInvite, resetDraftInvite, setInvites} from 'src/unity/reducers'

// Constants
import {GTM_INVITE_SENT} from 'src/unity/constants'

// Hooks
import {useNotify} from 'src/unity/hooks'

interface InviteErrors {
  email?: string
}

const UserListInviteForm: FC = () => {
  const [errors, setErrors] = useState<InviteErrors>({})
  const [notify, {show, hide}] = useNotify()
  const [{draftInvite, orgID, invites}, dispatch] = useContext<
    UserListContextResult
  >(UserListContext)

  const onInviteUser = async () => {
    dispatch(resetDraftInvite())

    try {
      const resp = await createOrgInvite(orgID, draftInvite)

      if (resp.status !== 201) {
        throw new Error(resp.data.message)
      }

      dispatch(setInvites([resp.data, ...invites]))
      show()

      // Google Tag Manager event for sending an invitation
      gaEvent(GTM_INVITE_SENT)
    } catch (error) {
      console.error(error)
    }
  }

  const onChangeInvitee = (e: ChangeEvent<HTMLInputElement>) => {
    setErrors({})
    dispatch(editDraftInvite({...draftInvite, email: e.target.value}))
  }

  return (
    <>
      <Grid>
        <Grid.Row>
          <Grid.Column widthMD={Columns.Ten} widthLG={Columns.Six}>
            <Panel
              gradient={Gradients.PolarExpress}
              className="user-list-invite--form-panel"
            >
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
                <Form
                  onSubmit={onInviteUser}
                  className="user-list-invite--form"
                >
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
                    <UserInviteSubmit draftInvite={draftInvite} />
                  </Form.Element>
                </Form>
              </Panel.Body>
            </Panel>
          </Grid.Column>
        </Grid.Row>
      </Grid>
      <Notification
        size={ComponentSize.Small}
        gradient={Gradients.HotelBreakfast}
        icon={IconFont.UserAdd}
        onDismiss={hide}
        onTimeout={hide}
        visible={notify}
        duration={5000}
        testID="invite-sent-success"
      >
        Invitation Sent
      </Notification>
    </>
  )
}

export default UserListInviteForm
