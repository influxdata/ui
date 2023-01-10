// Libraries
import React, {FC} from 'react'
import {capitalize} from 'lodash'

// Components
import {IndexList} from '@influxdata/clockface'
import InviteListContextMenu from './InviteListContextMenu'

// Types
import {Invite} from 'src/types'

interface Props {
  invite: Invite
}

const getDate = datetime => {
  return new Date(datetime).toLocaleDateString()
}

export const InviteListItem: FC<Props> = ({invite}) => {
  const {email, role, expiresAt} = invite

  return (
    <IndexList.Row brighten={true} testID={`invite-list-item ${email}`}>
      <IndexList.Cell>
        <span className="user-list-email">{email}</span>
      </IndexList.Cell>
      <IndexList.Cell />
      <IndexList.Cell className="user-list-cell-role" testID="invite-list-role">
        {capitalize(role)}
      </IndexList.Cell>
      <IndexList.Cell
        className="user-list-cell-status"
        testID="invite-list-status"
      >
        <div>Invite expiration {getDate(expiresAt)}</div>
      </IndexList.Cell>
      <InviteListContextMenu invite={invite} />
    </IndexList.Row>
  )
}
