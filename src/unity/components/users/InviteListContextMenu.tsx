import React, {useState, useContext} from 'react'

import {
  RemoteDataState,
  IndexList,
  TechnoSpinner,
  Alignment,
  ComponentSize,
  FlexBox,
  IconFont,
  ComponentColor,
  ButtonShape,
  SquareButton,
  ConfirmationButton,
  ComponentStatus,
} from '@influxdata/clockface'
import {UserListContext, UserListContextResult} from './UsersPage'

// Thunks
import {withdrawInvite, resendInvite} from 'src/unity/thunks'

// Types
import {Invite} from 'src/types'

interface Props {
  invite: Invite
}

function InviteListContextMenu({invite}: Props) {
  const [isHover, setHover] = useState(true)
  const [{orgID}, dispatch] = useContext<UserListContextResult>(UserListContext)

  const handleRemove = () => {
    withdrawInvite(dispatch, orgID, invite)
  }

  const handleResend = () => {
    resendInvite(dispatch, orgID, invite.id, invite)
  }

  const componentStatus =
    invite.status === RemoteDataState.Loading
      ? ComponentStatus.Loading
      : ComponentStatus.Default

  if (componentStatus === ComponentStatus.Loading) {
    return (
      <IndexList.Cell alignment={Alignment.Right}>
        <TechnoSpinner diameterPixels={30} strokeWidth={ComponentSize.Small} />
      </IndexList.Cell>
    )
  }

  return (
    <IndexList.Cell
      revealOnHover={isHover}
      alignment={Alignment.Right}
      testID="invite-row-context"
    >
      <FlexBox margin={ComponentSize.Small}>
        <SquareButton
          titleText="Resend Invitation"
          icon={IconFont.Refresh}
          color={ComponentColor.Secondary}
          onClick={handleResend}
          testID="resend-invite"
        />
        <ConfirmationButton
          icon={IconFont.Trash}
          onShow={() => setHover(false)}
          onHide={() => setHover(true)}
          confirmationLabel="This action will invalidate the invitation link sent to this user"
          confirmationButtonText="Withdraw Invitation"
          titleText="Withdraw Invitation"
          confirmationButtonColor={ComponentColor.Danger}
          color={ComponentColor.Danger}
          shape={ButtonShape.Square}
          onConfirm={handleRemove}
          status={componentStatus}
          testID="withdraw-invite"
        />
      </FlexBox>
    </IndexList.Cell>
  )
}

export default InviteListContextMenu
