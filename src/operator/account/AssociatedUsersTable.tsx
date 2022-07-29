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

// Constants
import {acctUserColumnInfo, accountUserHeaderInfo} from 'src/operator/constants'

// Contexts
import {AccountContext} from 'src/operator/context/account'

const AssociatedTableUsers: FC = () => {
  const {account} = useContext(AccountContext)

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
              />
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
