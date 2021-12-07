// Libraries
import React, {Component, createRef, RefObject} from 'react'
import {connect, ConnectedProps} from 'react-redux'
import {withRouter, RouteComponentProps} from 'react-router-dom'
import memoizeOne from 'memoize-one'

// Components
import Table from 'src/dashboards/components/dashboard_index/Table'
// import FilterList from 'src/shared/components/FilterList'
import DashboardsTableEmpty from 'src/dashboards/components/dashboard_index/DashboardsTableEmpty'
import DashboardCardsPaginated from 'src/dashboards/components/dashboard_index/DashboardCardsPaginated'

// Actions
import {retainRangesDashTimeV1 as retainRangesDashTimeV1Action} from 'src/dashboards/actions/ranges'
import {checkDashboardLimits as checkDashboardLimitsAction} from 'src/cloud/actions/limits'
import {createDashboard} from 'src/dashboards/actions/thunks'

// Decorators
import {ErrorHandling} from 'src/shared/decorators/errors'

// Types
import {Dashboard, AppState, ResourceType, Pageable, RemoteDataState} from 'src/types'
import {Sort} from '@influxdata/clockface'
// import {getAll} from 'src/resources/selectors'
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
  dashboards: any
  totalDashboards: number
}

type ReduxProps = ConnectedProps<typeof connector>
type Props = ReduxProps & OwnProps & RouteComponentProps<{orgID: string}>

// const FilterDashboards = FilterList<Dashboard>()

@ErrorHandling
class DashboardsIndexContents extends Component<Props> 
    implements Pageable {

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
    console.log('url page num ', urlPageNumber, this.totalPages)

    const passedInPageIsValid =
      urlPageNumber && urlPageNumber <= this.totalPages && urlPageNumber > 0
    if (passedInPageIsValid) {
      this.currentPage = urlPageNumber
      console.log('its valid')
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
    const endIndex = Math.min(startIndex + this.rowsPerPage, this.props.totalDashboards)
    const rows = []
    for (let i = startIndex; i < endIndex; i++) {
      const dashboard = sortedDashboards[i]
      if(dashboard) {
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
      filterComponent,
      onFilterChange,
      sortDirection,
      sortType,
      sortKey,
      onCreateDashboard,
    } = this.props

    this.totalPages = Math.max(
      Math.ceil(dashboards.length / this.rowsPerPage),
      1
    )
    console.log('total pages ', this.totalPages)
    // console.log('sorted dash ', sortedDashboards)
    
    
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
            

            <DashboardCardsPaginated 
            dashboards={this.renderDashboardCards()}
            onFilterChange={onFilterChange}
            sortDirection={sortDirection}
            sortType={sortType}
            sortKey={sortKey}
            />
                  
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
    // dashboards: getAll<Dashboard>(state, ResourceType.Dashboards),
    status: state.resources.dashboards.status
  }
}

const mdtp = {
  retainRangesDashTimeV1: retainRangesDashTimeV1Action,
  checkDashboardLimits: checkDashboardLimitsAction,
  onCreateDashboard: createDashboard as any,
}

const connector = connect(mstp, mdtp)

export default connector(withRouter(DashboardsIndexContents))
