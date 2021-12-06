// Libraries
import React, {PureComponent} from 'react'
import {Route, RouteComponentProps, Switch} from 'react-router-dom'
import {connect, ConnectedProps} from 'react-redux'
import {AutoSizer} from 'react-virtualized'

// Decorators
import {ErrorHandling} from 'src/shared/decorators/errors'

// Components
import DashboardsIndexContents from 'src/dashboards/components/dashboard_index/DashboardsIndexContentsPaginated'
import {ComponentSize, Page, Sort} from '@influxdata/clockface'
import SearchWidget from 'src/shared/components/search_widget/SearchWidget'
import AddResourceDropdown from 'src/shared/components/AddResourceDropdown'
import GetAssetLimits from 'src/cloud/components/GetAssetLimits'
import RateLimitAlert from 'src/cloud/components/RateLimitAlert'
import ResourceSortDropdown from 'src/shared/components/resource_sort_dropdown/ResourceSortDropdown'
import DashboardImportOverlay from 'src/dashboards/components/DashboardImportOverlay'
import CreateFromTemplateOverlay from 'src/templates/components/createFromTemplateOverlay/CreateFromTemplateOverlay'
import DashboardExportOverlay from 'src/dashboards/components/DashboardExportOverlay'

// Utils
import {pageTitleSuffixer} from 'src/shared/utils/pageTitles'
import {extractDashboardLimits} from 'src/cloud/utils/limits'

// Actions
import {createDashboard as createDashboardAction, getDashboards} from 'src/dashboards/actions/thunks'
import {setDashboardSort, setSearchTerm} from 'src/dashboards/actions/creators'
import {getLabels} from 'src/labels/actions/thunks'

// Types
import {AppState, ResourceType} from 'src/types'
import {SortTypes} from 'src/shared/utils/sort'
import {DashboardSortKey} from 'src/shared/components/resource_sort_dropdown/generateSortItems'

import ErrorBoundary from 'src/shared/components/ErrorBoundary'

type ReduxProps = ConnectedProps<typeof connector>
type Props = ReduxProps & RouteComponentProps<{orgID: string}>

interface State {
  searchTerm: string
}

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
  }

  componentWillUnmount() {
    this.props.setSearchTerm(this.state.searchTerm)
  }

  public render() {
    const {createDashboard, sortOptions, limitStatus} = this.props
    const {searchTerm} = this.state

    return (
      <>
        <Page
          testID="empty-dashboards-list"
          titleTag={pageTitleSuffixer(['Dashboards'])}
        >
          <Page.Header fullWidth={false}>
            <Page.Title title="Dashboards" />
            <RateLimitAlert />
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
                  onSelectImport={this.summonImportOverlay}
                  onSelectTemplate={this.summonTemplatePage}
                  resourceName="Dashboard"
                  limitStatus={limitStatus}
                />
              </Page.ControlBarRight>
            </ErrorBoundary>
          </Page.ControlBar>
          <ErrorBoundary>
            <Page.Contents
              className="dashboards-index__page-contents"
              fullWidth={false}
              scrollable={true}
              scrollbarSize={ComponentSize.Large}
              autoHideScrollbar={true}
            >
                <AutoSizer style={{height: '100%', width: '100%'}}>
                {({width, height}) => {
                return (
                    <GetAssetLimits>
                        <DashboardsIndexContents
                        pageWidth={width}
                        pageHeight={height}
                        searchTerm={searchTerm}
                        onFilterChange={this.handleFilterDashboards}
                        sortDirection={sortOptions.sortDirection}
                        sortType={sortOptions.sortType}
                        sortKey={sortOptions.sortKey}
                        />
                    </GetAssetLimits>
                    )}}
                
                </AutoSizer>
            </Page.Contents>
          </ErrorBoundary>
        </Page>
        <Switch>
          <Route
            path="/orgs/:orgID/dashboards-list/:dashboardID/export"
            component={DashboardExportOverlay}
          />
          <Route
            path="/orgs/:orgID/dashboards-list/import/template"
            component={CreateFromTemplateOverlay}
          />
          <Route
            path="/orgs/:orgID/dashboards-list/import"
            component={DashboardImportOverlay}
          />
        </Switch>
      </>
    )
  }

  private handleFilterDashboards = (searchTerm: string): void => {
    this.setState({searchTerm})
  }

  private handleSort = (
    sortKey: DashboardSortKey,
    sortDirection: Sort,
    sortType: SortTypes
  ): void => {
    this.props.setDashboardSort({sortKey, sortDirection, sortType})
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
    console.log("its the one");
  return {
    limitStatus: extractDashboardLimits(state),
    sortOptions,
    searchTerm,
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
