// Libraries
import React, {FC, useContext} from 'react'
import {
  Table,
  EmptyState,
  ComponentSize,
  FlexBox,
  FlexDirection,
} from '@influxdata/clockface'
import ResourcesTableRow from 'src/operator/ResourcesTableRow'
import {AccountContext} from 'src/operator/context/account'
import {acctOrgColumnInfo, accountOrgHeaders} from 'src/operator/constants'

const AssociatedOrgsTable: FC = () => {
  const {account} = useContext(AccountContext)
  return (
    <FlexBox direction={FlexDirection.Column} margin={ComponentSize.Large}>
      {account?.organizations?.length ? (
        <Table>
          <Table.Header>
            <Table.Row>
              {accountOrgHeaders.map((header: string) => (
                <Table.HeaderCell key={header}>{header}</Table.HeaderCell>
              ))}
            </Table.Row>
          </Table.Header>
          <Table.Body>
            {account.organizations.map(resource => (
              <ResourcesTableRow
                key={resource.id}
                resource={resource}
                infos={acctOrgColumnInfo}
              />
            ))}
          </Table.Body>
          <Table.Footer />
        </Table>
      ) : (
        <EmptyState size={ComponentSize.Medium}>
          <EmptyState.Text>No orgs</EmptyState.Text>
        </EmptyState>
      )}
    </FlexBox>
  )
}

export default AssociatedOrgsTable
