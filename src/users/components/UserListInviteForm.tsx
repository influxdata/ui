// Libraries
import React, {ChangeEvent, FC, useContext, useState} from 'react'

// Components
import {UsersContext} from 'src/users/context/users'
import {UserInviteSubmit} from './UserInviteSubmit'
import {
  Columns,
  ComponentSize,
  FlexBox,
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
import {selectCurrentOrg} from 'src/identity/selectors'
import {useSelector} from 'react-redux'

interface InviteErrors {
  email?: string
}

export const UserListInviteForm: FC = () => {
  const [errors, setErrors] = useState<InviteErrors>({})
  const {draftInvite, handleEditDraftInvite, handleInviteUser} =
    useContext(UsersContext)
  const org = useSelector(selectCurrentOrg)

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
                testID="user-list-invite--form-heading"
              >
                Add members to {org.name}
              </Heading>
            </Panel.Header>
            <Panel.Body size={ComponentSize.Small}>
              <FlexBox className="user-list-invite--instructions">
                Members added will have "Owner" access to the organization's
                resources.
              </FlexBox>
              <Form onSubmit={onInviteUser} className="user-list-invite--form">
                <Form.Element
                  label="Email Address"
                  className="email--input"
                  errorMessage={errors.email}
                >
                  <Input
                    testID="email--input"
                    placeholder="name@company.com"
                    onChange={onChangeInvitee}
                    value={draftInvite.email}
                    type={InputType.Email}
                    required={true}
                  />
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
