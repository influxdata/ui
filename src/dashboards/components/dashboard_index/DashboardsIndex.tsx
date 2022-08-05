// Libraries
import React, {PureComponent} from 'react'
import {Route, RouteComponentProps, Switch} from 'react-router-dom'
import {connect, ConnectedProps} from 'react-redux'
import {AutoSizer} from 'react-virtualized'

// Decorators
import {ErrorHandling} from 'src/shared/decorators/errors'

// Components
import DashboardsIndexContents from 'src/dashboards/components/dashboard_index/DashboardsIndexContents'
import {
  ComponentSize,
  Page,
  Sort,
  SpinnerContainer,
  TechnoSpinner,
} from '@influxdata/clockface'
import FilterList from 'src/shared/components/FilterList'
import SearchWidget from 'src/shared/components/search_widget/SearchWidget'
import AddResourceDropdown from 'src/shared/components/AddResourceDropdown'
import GetAssetLimits from 'src/cloud/components/GetAssetLimits'
import RateLimitAlert from 'src/cloud/components/RateLimitAlert'
import ResourceSortDropdown from 'src/shared/components/resource_sort_dropdown/ResourceSortDropdown'
import DashboardImportOverlay from 'src/dashboards/components/DashboardImportOverlay'

// Utils
import {pageTitleSuffixer} from 'src/shared/utils/pageTitles'
import {extractDashboardLimits} from 'src/cloud/utils/limits'

// Actions
import {
  createDashboard as createDashboardAction,
  getDashboards,
} from 'src/dashboards/actions/thunks'
import {setDashboardSort, setSearchTerm} from 'src/dashboards/actions/creators'
import {getLabels} from 'src/labels/actions/thunks'
import {getAll} from 'src/resources/selectors'
import {getResourcesStatus} from 'src/resources/selectors/getResourcesStatus'

// Types
import {AppState, ResourceType, Dashboard} from 'src/types'
import {SortTypes} from 'src/shared/utils/sort'
import {DashboardSortKey} from 'src/shared/components/resource_sort_dropdown/generateSortItems'

import ErrorBoundary from 'src/shared/components/ErrorBoundary'

type ReduxProps = ConnectedProps<typeof connector>
type Props = ReduxProps & RouteComponentProps<{orgID: string}>

interface State {
  searchTerm: string
}

const FilterDashboards = FilterList<Dashboard>()

@ErrorHandling
class DashboardIndex extends PureComponent<Props, State> {
  constructor(props: Props) {
    super(props)

    this.state = {
      searchTerm: props.searchTerm,
    }
  }

  componentDidMount() {
    this.props.getDashboards()
    this.props.getLabels()

    let sortType: SortTypes = this.props.sortOptions.sortType
    const params = new URLSearchParams(window.location.search)
    let sortKey: DashboardSortKey = 'name'
    if (params.get('sortKey') === 'name') {
      sortKey = 'name'
    } else if (params.get('sortKey') === 'meta.updatedAt') {
      sortKey = 'meta.updatedAt'
      sortType = SortTypes.Date
    }

    let sortDirection: Sort = this.props.sortOptions.sortDirection
    if (params.get('sortDirection') === Sort.Ascending) {
      sortDirection = Sort.Ascending
    } else if (params.get('sortDirection') === Sort.Descending) {
      sortDirection = Sort.Descending
    }

    let searchTerm: string = ''
    if (params.get('searchTerm') !== null) {
      searchTerm = params.get('searchTerm')
      this.props.setSearchTerm(searchTerm)
      this.setState({searchTerm})
    }

    this.props.setDashboardSort({sortKey, sortDirection, sortType})
  }

  componentWillUnmount() {
    this.props.setSearchTerm(this.state.searchTerm)
  }

  public render() {
    const {
      createDashboard,
      sortOptions,
      limitStatus,
      dashboards,
      remoteDataState,
    } = this.props
    const {searchTerm} = this.state

    return (
      <SpinnerContainer
        loading={remoteDataState}
        spinnerComponent={<TechnoSpinner />}
      >
        <Page
          testID="empty-dashboards-list"
          titleTag={pageTitleSuffixer(['Dashboards'])}
        >
          <Page.Header fullWidth={false}>
            <Page.Title title="Dashboards" />
            <RateLimitAlert location="dashboards" />
          </Page.Header>
          <Page.ControlBar fullWidth={false}>
            <ErrorBoundary>
              <Page.ControlBarLeft>
                <SearchWidget
                  placeholderText="Filter dashboards..."
                  onSearch={this.handleFilterDashboards}
                  searchTerm={searchTerm}
                />
                <ResourceSortDropdown
                  resourceType={ResourceType.Dashboards}
                  sortDirection={sortOptions.sortDirection}
                  sortKey={sortOptions.sortKey}
                  sortType={sortOptions.sortType}
                  onSelect={this.handleSort}
                />
              </Page.ControlBarLeft>
              <Page.ControlBarRight>
                <AddResourceDropdown
                  onSelectNew={createDashboard}
                  onSelectTemplate={this.summonTemplatePage}
                  onSelectImport={this.summonImportOverlay}
                  resourceName="Dashboard"
                  limitStatus={limitStatus}
                />
              </Page.ControlBarRight>
            </ErrorBoundary>
          </Page.ControlBar>
          <ErrorBoundary>
            <Page.Contents
              className="dashboards-index__page-contents"
              fullWidth={true}
              scrollable={true}
              scrollbarSize={ComponentSize.Large}
              autoHideScrollbar={true}
            >
              <AutoSizer style={{height: '100%', width: '100%'}}>
                {({width, height}) => {
                  return (
                    <GetAssetLimits>
                      <FilterDashboards
                        list={dashboards}
                        searchTerm={searchTerm}
                        searchKeys={['name', 'labels[].name']}
                        sortByKey="name"
                      >
                        {filteredDashboards => (
                          <DashboardsIndexContents
                            pageWidth={width}
                            pageHeight={height}
                            dashboards={filteredDashboards}
                            totalDashboards={dashboards.length}
                            searchTerm={searchTerm}
                            onFilterChange={this.handleFilterDashboards}
                            sortDirection={sortOptions.sortDirection}
                            sortType={sortOptions.sortType}
                            sortKey={sortOptions.sortKey}
                          />
                        )}
                      </FilterDashboards>
                    </GetAssetLimits>
                  )
                }}
              </AutoSizer>
            </Page.Contents>
          </ErrorBoundary>
        </Page>
        <Switch>
          <Route
            path="/orgs/:orgID/dashboards-list/import"
            component={DashboardImportOverlay}
          />
        </Switch>
      </SpinnerContainer>
    )
  }

  private summonImportOverlay = (): void => {
    const {
      history,
      match: {
        params: {orgID},
      },
    } = this.props
    history.push(`/orgs/${orgID}/dashboards-list/import`)
  }

  private handleFilterDashboards = (searchTerm: string): void => {
    const url = new URL(location.href)
    url.searchParams.set('searchTerm', searchTerm)
    history.replaceState(null, '', url.toString())

    this.setState({searchTerm})
  }

  private handleSort = (
    sortKey: DashboardSortKey,
    sortDirection: Sort,
    sortType: SortTypes
  ): void => {
    const url = new URL(location.href)
    url.searchParams.set('sortKey', sortKey)
    url.searchParams.set('sortDirection', sortDirection)
    history.replaceState(null, '', url.toString())

    this.props.setDashboardSort({sortKey, sortDirection, sortType})
  }

  private summonTemplatePage = (): void => {
    const {
      history,
      match: {
        params: {orgID},
      },
    } = this.props
    history.push(`/orgs/${orgID}/settings/templates`)
  }
}

const mstp = (state: AppState) => {
  const {sortOptions, searchTerm} = state.resources.dashboards
  const remoteDataState = getResourcesStatus(state, [
    ResourceType.Dashboards,
    ResourceType.Labels,
  ])
  return {
    dashboards: getAll<Dashboard>(state, ResourceType.Dashboards),
    limitStatus: extractDashboardLimits(state),
    sortOptions,
    searchTerm,
    remoteDataState,
  }
}

const mdtp = {
  createDashboard: createDashboardAction,
  setDashboardSort,
  setSearchTerm,
  getDashboards,
  getLabels,
}

const connector = connect(mstp, mdtp)

export default connector(DashboardIndex)
