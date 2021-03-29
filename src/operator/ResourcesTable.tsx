// Libraries
import React, {FC, useContext} from 'react'
import {
  Table,
  EmptyState,
  ComponentSize,
  Tabs,
  Orientation,
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

// Types
import {Account, Organization} from 'src/types/operator'

const ResourcesTable: FC = () => {
  const {activeTab, accounts, organizations, status} = useContext(
    OperatorContext
  )

  // TODO(ariel): remove type forcing here, this should be resolved with
  // API integration
  const resources: Account[] | Organization[] =
    activeTab === 'accounts' ? accounts : organizations
  const headers =
    activeTab === 'accounts' ? accountHeaderInfo : organizationColumnHeaders
  const infos =
    activeTab === 'accounts' ? accountColumnInfo : organizationColumnInfo

  return (
    <Tabs.Container orientation={Orientation.Horizontal}>
      <OperatorTabs />
      <Tabs.TabContents>
        <ResourcesSearchbar />
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
                Looks like there were no <b>{activeTab}</b> that matched your
                search.
              </EmptyState.Text>
            </EmptyState>
          )}
        </PageSpinner>
      </Tabs.TabContents>
    </Tabs.Container>
  )
}

export default ResourcesTable
