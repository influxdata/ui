// Libraries
import React, {FC, useContext} from 'react'
import {
  Table,
  EmptyState,
  ComponentSize,
  Tabs,
  Orientation,
  FlexBox,
  FlexDirection,
} from '@influxdata/clockface'

// Components
import ResourcesTableRow from 'src/operator/ResourcesTableRow'
import ResourcesSearchbar from 'src/operator/ResourcesSearchbar'
import {OperatorContext} from 'src/operator/context/operator'
import OperatorTabs from 'src/operator/OperatorTabs'
import PageSpinner from 'src/perf/components/PageSpinner'

// Constants
import {
  accountHeaderInfo,
  accountColumnInfo,
  organizationColumnHeaders,
  organizationColumnInfo,
} from 'src/operator/constants'
import {OperatorRoutes} from 'src/operator/constants'

// Types
import {OperatorOrg, OperatorAccount} from 'src/types'
import ResourcesAccountType from './ResourcesAccountType'
import ResourcesCloudCluster from './ResourcesCloudCluster'

const ResourcesTable: FC = () => {
  const {accounts, organizations, pathname, status} =
    useContext(OperatorContext)

  const isOrgsTab = pathname.includes(OperatorRoutes.organizations)

  // TODO(ariel): remove type forcing here, this should be resolved with
  // API integration
  const resources: (OperatorAccount | OperatorOrg)[] = isOrgsTab
    ? organizations
    : accounts
  const headers = isOrgsTab ? organizationColumnHeaders : accountHeaderInfo
  const infos = isOrgsTab ? organizationColumnInfo : accountColumnInfo

  return (
    <Tabs.Container orientation={Orientation.Horizontal}>
      <OperatorTabs />
      <Tabs.TabContents>
        <FlexBox direction={FlexDirection.Row}>
          <ResourcesAccountType />
          {isOrgsTab && <ResourcesCloudCluster />}
          <ResourcesSearchbar />
        </FlexBox>
        <PageSpinner loading={status}>
          {resources?.length ? (
            <Table>
              <Table.Header>
                <Table.Row>
                  {headers.map((header: string) => (
                    <Table.HeaderCell key={header}>{header}</Table.HeaderCell>
                  ))}
                </Table.Row>
              </Table.Header>
              <Table.Body>
                {resources?.map(resource => (
                  <ResourcesTableRow
                    key={resource.id}
                    resource={resource}
                    infos={infos}
                  />
                ))}
              </Table.Body>
              <Table.Footer />
            </Table>
          ) : (
            <EmptyState size={ComponentSize.Medium}>
              <EmptyState.Text>
                Looks like there were no{' '}
                <b>{isOrgsTab ? 'organizations' : 'accounts'}</b> that matched
                your search.
              </EmptyState.Text>
            </EmptyState>
          )}
        </PageSpinner>
      </Tabs.TabContents>
    </Tabs.Container>
  )
}

export default ResourcesTable
