// Libraries
import React, {FC, useCallback, useState, useEffect} from 'react'
import {
  Table,
  RemoteDataState,
  SpinnerContainer,
  TechnoSpinner,
  EmptyState,
  ComponentSize,
  Tabs,
  Orientation,
} from '@influxdata/clockface'
import ResourcesTableRow from 'src/operator/ResourcesTableRow'
import {Resource, CellInfo} from 'src/types/operator'
import ResourcesSearchbar from 'src/operator/ResourcesSearchbar'
import OperatorTabs from 'src/operator/OperatorTabs'

type ActiveTab = 'accounts' | 'organizations' | 'users' | 'testResources'

interface Props {
  infos: CellInfo[]
  fetchResources: (searchTerm?: string) => Promise<Resource[]>
  tabName: ActiveTab
  searchBarPlaceholder: string
}

const ResourcesTable: FC<Props> = ({
  infos,
  fetchResources,
  searchBarPlaceholder,
  tabName,
}) => {
  const [resources, setResources] = useState([])
  const [status, setStatus] = useState(RemoteDataState.NotStarted)
  const fetchData = useCallback(
    async (searchTerm?) => {
      try {
        setStatus(RemoteDataState.Loading)
        const resources = await fetchResources(searchTerm || '')
        setResources(resources)
        setStatus(RemoteDataState.Done)
      } catch (e) {
        console.error(e)
        setStatus(RemoteDataState.Error)
      }
    },
    [fetchResources]
  )

  useEffect(() => {
    fetchData()
  }, [tabName, fetchData])

  return (
    <Tabs.Container orientation={Orientation.Horizontal}>
      <OperatorTabs activeTab={tabName} />
      <Tabs.TabContents>
        <ResourcesSearchbar
          searchDebounce={tabName != 'testResources'}
          fetchData={fetchData}
          placeholder={searchBarPlaceholder}
        />
        <SpinnerContainer
          loading={status}
          spinnerComponent={<TechnoSpinner diameterPixels={100} />}
        >
          {resources.length ? (
            <Table>
              <Table.Header>
                <Table.Row>
                  {infos.map(({header}) => (
                    <Table.HeaderCell key={header}>{header}</Table.HeaderCell>
                  ))}
                </Table.Row>
              </Table.Header>
              <Table.Body>
                {resources.map(resource => (
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
                Looks like there were no <b>{tabName}</b> that matched your
                search.
              </EmptyState.Text>
            </EmptyState>
          )}
        </SpinnerContainer>
      </Tabs.TabContents>
    </Tabs.Container>
  )
}

export default ResourcesTable
