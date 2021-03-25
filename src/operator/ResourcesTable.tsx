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
  organizationColumnHeaders,
} from 'src/operator/constants'

const ResourcesTable: FC = () => {
  const {activeTab, accounts, organizations, status} = useContext(
    OperatorContext
  )

  const resources = activeTab === 'accounts' ? accounts : organizations
  const infos =
    activeTab === 'accounts' ? accountHeaderInfo : organizationColumnHeaders

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
                  {infos.map((column: string) => (
                    <Table.HeaderCell key={column}>{column}</Table.HeaderCell>
                  ))}
                </Table.Row>
              </Table.Header>
              <Table.Body>
                {resources.map(resource => (
                  <ResourcesTableRow key={resource.id} resource={resource} />
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
