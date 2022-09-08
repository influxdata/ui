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
import {UsersContext} from 'src/users/context/users'

// Types
import {Invite} from 'src/types'

interface Props {
  invite: Invite
}

function InviteListContextMenu({invite}: Props) {
  const [isHover, setHover] = useState(true)

  const {handleResendInvite, handleWithdrawInvite, removeInviteStatus} =
    useContext(UsersContext)

  const handleRemove = () => {
    handleWithdrawInvite(invite.id)
  }

  const handleResend = () => {
    handleResendInvite(invite.id)
  }

  let componentStatus = ComponentStatus.Default

  if (invite && invite?.id === removeInviteStatus?.id) {
    componentStatus =
      removeInviteStatus.status === RemoteDataState.Loading
        ? ComponentStatus.Loading
        : ComponentStatus.Default
  }

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
          icon={IconFont.Refresh_New}
          color={ComponentColor.Secondary}
          onClick={handleResend}
          testID="resend-invite"
        />
        <ConfirmationButton
          icon={IconFont.Trash_New}
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
