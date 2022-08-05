// Libraries
import React, {Component, createRef, RefObject} from 'react'
import {connect, ConnectedProps} from 'react-redux'
import {withRouter, RouteComponentProps} from 'react-router-dom'
import memoizeOne from 'memoize-one'

// Components
import DashboardsTableEmpty from 'src/dashboards/components/dashboard_index/DashboardsTableEmpty'
import DashboardCards from 'src/dashboards/components/dashboard_index/DashboardCards'
import {ResourceList} from '@influxdata/clockface'

// Actions
import {retainRangesDashTimeV1 as retainRangesDashTimeV1Action} from 'src/dashboards/actions/ranges'
import {checkDashboardLimits as checkDashboardLimitsAction} from 'src/cloud/actions/limits'
import {createDashboard} from 'src/dashboards/actions/thunks'

// Decorators
import {ErrorHandling} from 'src/shared/decorators/errors'

// Types
import {Dashboard, AppState, Pageable, RemoteDataState} from 'src/types'
import {Sort} from '@influxdata/clockface'
import {SortTypes, getSortedResources} from 'src/shared/utils/sort'
import {DashboardSortKey} from 'src/shared/components/resource_sort_dropdown/generateSortItems'

// Utils
import {PaginationNav} from '@influxdata/clockface'

interface OwnProps {
  onFilterChange: (searchTerm: string) => void
  searchTerm: string
  filterComponent?: JSX.Element
  sortDirection: Sort
  sortType: SortTypes
  sortKey: DashboardSortKey
  pageHeight: number
  pageWidth: number
  dashboards: Dashboard[]
  totalDashboards: number
}

type ReduxProps = ConnectedProps<typeof connector>
type Props = ReduxProps & OwnProps & RouteComponentProps<{orgID: string}>

const DEFAULT_PAGINATION_CONTROL_HEIGHT = 62

@ErrorHandling
class DashboardsIndexContents extends Component<Props> implements Pageable {
  private paginationRef: RefObject<HTMLDivElement>
  public currentPage: number = 1
  public rowsPerPage: number = 12
  public totalPages: number

  private memGetSortedResources = memoizeOne<typeof getSortedResources>(
    getSortedResources
  )
  constructor(props) {
    super(props)
    this.paginationRef = createRef<HTMLDivElement>()
  }

  public componentDidMount() {
    const {dashboards} = this.props

    const dashboardIDs = dashboards.map(d => d.id)
    this.props.retainRangesDashTimeV1(dashboardIDs)
    this.props.checkDashboardLimits()

    const params = new URLSearchParams(window.location.search)
    const urlPageNumber = parseInt(params.get('page'), 10)

    const passedInPageIsValid =
      urlPageNumber && urlPageNumber <= this.totalPages && urlPageNumber > 0
    if (passedInPageIsValid) {
      this.currentPage = urlPageNumber
    }
  }

  public componentDidUpdate() {
    // if the user filters the list while on a page that is
    // outside the new filtered list put them on the last page of the new list
    if (this.currentPage > this.totalPages) {
      this.paginate(this.totalPages)
    }
  }

  public paginate = page => {
    this.currentPage = page
    const url = new URL(location.href)
    url.searchParams.set('page', page)
    history.replaceState(null, '', url.toString())
    this.forceUpdate()
  }

  public renderDashboardCards() {
    const sortedDashboards = this.memGetSortedResources(
      this.props.dashboards,
      this.props.sortKey,
      this.props.sortDirection,
      this.props.sortType
    )

    const startIndex = this.rowsPerPage * Math.max(this.currentPage - 1, 0)
    const endIndex = Math.min(
      startIndex + this.rowsPerPage,
      this.props.totalDashboards
    )
    const rows = []
    for (let i = startIndex; i < endIndex; i++) {
      const dashboard = sortedDashboards[i]
      if (dashboard) {
        rows.push(dashboard)
      }
    }
    return rows
  }

  public render() {
    const {
      searchTerm,
      status,
      dashboards,
      onFilterChange,
      onCreateDashboard,
    } = this.props

    const heightWithPagination =
      this.paginationRef?.current?.clientHeight ||
      DEFAULT_PAGINATION_CONTROL_HEIGHT
    const height = this.props.pageHeight - heightWithPagination

    this.totalPages = Math.max(
      Math.ceil(dashboards.length / this.rowsPerPage),
      1
    )

    if (status === RemoteDataState.Done && !dashboards.length) {
      return (
        <DashboardsTableEmpty
          searchTerm={searchTerm}
          onCreateDashboard={onCreateDashboard}
          summonImportFromTemplateOverlay={this.summonImportFromTemplateOverlay}
          summonImportOverlay={this.summonImportOverlay}
        />
      )
    }

    return (
      <>
        <ResourceList style={{width: this.props.pageWidth}}>
          <ResourceList.Body
            style={{maxHeight: height, minHeight: height, overflow: 'auto'}}
            emptyState={null}
          >
            <DashboardCards
              dashboards={this.renderDashboardCards()}
              onFilterChange={onFilterChange}
            />
          </ResourceList.Body>
        </ResourceList>
        <PaginationNav.PaginationNav
          ref={this.paginationRef}
          style={{width: this.props.pageWidth}}
          totalPages={this.totalPages}
          currentPage={this.currentPage}
          pageRangeOffset={1}
          onChange={this.paginate}
        />
      </>
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

  private summonImportFromTemplateOverlay = (): void => {
    const {
      history,
      match: {
        params: {orgID},
      },
    } = this.props
    history.push(`/orgs/${orgID}/dashboards-list/import/template`)
  }
}

const mstp = (state: AppState) => {
  return {
    status: state.resources.dashboards.status,
  }
}

const mdtp = {
  retainRangesDashTimeV1: retainRangesDashTimeV1Action,
  checkDashboardLimits: checkDashboardLimitsAction,
  onCreateDashboard: createDashboard as any,
}

const connector = connect(mstp, mdtp)

export default connector(withRouter(DashboardsIndexContents))
