// Libraries
import React, {FC, useContext} from 'react'
import {
  Table,
  EmptyState,
  ComponentSize,
  FlexBox,
  FlexDirection,
} from '@influxdata/clockface'

// Components
import ResourcesTableRow from 'src/operator/ResourcesTableRow'
import RemoveFromAccount from 'src/operator/account/RemoveFromAccount'

// Constants
import {acctUserColumnInfo, accountUserHeaderInfo} from 'src/operator/constants'

// Contexts
import {AccountContext} from 'src/operator/context/account'
import {OperatorContext} from 'src/operator/context/operator'

const AssociatedTableUsers: FC = () => {
  const {account, handleRemoveUserFromAccount} = useContext(AccountContext)
  const hasMultipleUsers = account?.users?.length > 1
  const {hasWritePermissions} = useContext(OperatorContext)

  return (
    <FlexBox direction={FlexDirection.Column} margin={ComponentSize.Large}>
      {account?.users?.length ? (
        <Table>
          <Table.Header>
            <Table.Row>
              {accountUserHeaderInfo.map((header: string) => (
                <Table.HeaderCell key={header}>{header}</Table.HeaderCell>
              ))}
            </Table.Row>
          </Table.Header>
          <Table.Body testID="associated-users--table-body">
            {account?.users.map(resource => (
              <ResourcesTableRow
                key={resource.id}
                resource={resource}
                infos={acctUserColumnInfo}
              >
                {hasWritePermissions && hasMultipleUsers && (
                  <RemoveFromAccount
                    removeUser={async () => {
                      await handleRemoveUserFromAccount(resource.id)
                    }}
                  />
                )}
              </ResourcesTableRow>
            ))}
          </Table.Body>
          <Table.Footer />
        </Table>
      ) : (
        <EmptyState size={ComponentSize.Medium}>
          <EmptyState.Text>
            No users. If this account is no longer being used, please delete it.
          </EmptyState.Text>
        </EmptyState>
      )}
    </FlexBox>
  )
}

export default AssociatedTableUsers
