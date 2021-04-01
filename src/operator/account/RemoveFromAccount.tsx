import {ConfirmationButton, Table} from '@influxdata/clockface'
import React, {FC} from 'react'

interface Props {
  removeUser: () => Promise<void>
}

const RemoveFromAccount: FC<Props> = ({removeUser}) => {
  return (
    <Table.Cell>
      <ConfirmationButton
        confirmationButtonText="Remove User"
        confirmationLabel="This will not delete a user. It will remove them from their account and org allowing them to join a new organization. Are you sure?"
        onConfirm={removeUser}
        text="Remove User"
      />
    </Table.Cell>
  )
}

export default RemoveFromAccount
