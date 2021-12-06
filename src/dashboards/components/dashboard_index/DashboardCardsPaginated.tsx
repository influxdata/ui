// Libraries
import React, {PureComponent} from 'react'
import {connect} from 'react-redux'
import memoizeOne from 'memoize-one'

// Components
import DashboardCard from 'src/dashboards/components/dashboard_index/DashboardCard'
import {TechnoSpinner} from '@influxdata/clockface'
import AssetLimitAlert from 'src/cloud/components/AssetLimitAlert'

// Selectors
import {getSortedResources, SortTypes} from 'src/shared/utils/sort'

// Types
import {AppState, Dashboard, RemoteDataState} from 'src/types'
import {Sort} from 'src/clockface'
import {LimitStatus} from 'src/cloud/actions/limits'

// Utils
import {extractDashboardLimits} from 'src/cloud/utils/limits'
import {isFlagEnabled} from 'src/shared/utils/featureFlag'
import {CLOUD} from 'src/shared/constants'

let getPinnedItems
if (CLOUD) {
  getPinnedItems = require('src/shared/contexts/pinneditems').getPinnedItems
}

interface StateProps {
  limitStatus: LimitStatus['status']
}

interface OwnProps {
  dashboards: Dashboard[]
  sortKey: string
  sortDirection: Sort
  sortType: SortTypes
  onFilterChange: (searchTerm: string) => void
}

class DashboardCards extends PureComponent<OwnProps & StateProps> {
  private _observer
  private _isMounted = true
  private _spinner

  private memGetSortedResources = memoizeOne<typeof getSortedResources>(
    getSortedResources
  )

  state = {
    pages: 1,
    windowSize: 0,
    pinnedItems: [],
  }

  public componentDidMount() {
    if (isFlagEnabled('pinnedItems') && CLOUD) {
      getPinnedItems()
        .then(res => {
          if (this._isMounted) {
            this.setState(prev => ({...prev, pinnedItems: res, windowSize: 15}))
          }
        })
        .catch(err => {
          console.error(err)
        })
    } else {
      this.setState(prev => ({...prev, windowSize: 15}))
    }
  }

  public componentWillUnmount() {
    this._isMounted = false
  }

  private registerSpinner = elem => {
    this._spinner = elem

    if (!elem) {
      return
    }

    let count = 1.0
    const threshold = []

    while (count > 0) {
      threshold.push(count)
      count -= 0.1
    }

    threshold.reverse()

    this._observer = new IntersectionObserver(this.measure, {
      threshold,
      rootMargin: '60px 0px',
    })

    this._observer.observe(this._spinner)
  }

  private measure = entries => {
    if (
      entries
        .map(e => e.isIntersecting)
        .reduce((prev, curr) => prev || curr, false)
    ) {
      this.setState({
        pages: this.state.pages + 1,
      })
    }
  }

  public render() {
    const {
      dashboards,
      sortDirection,
      sortKey,
      sortType,
      onFilterChange,
    } = this.props
    const sortedDashboards = this.memGetSortedResources(
      dashboards,
      sortKey,
      sortDirection,
      sortType
    )
      console.log('working?' , sortedDashboards)
    const {windowSize, pages, pinnedItems} = this.state

    return (
      <div>
        <div className="dashboards-card-grid">
          {sortedDashboards
            // .filter(d => d.status === RemoteDataState.Done)
            // .slice(0, pages * windowSize)
            .map(({id, name, description, labels, meta}) => (
              <DashboardCard
                key={id}
                id={id}
                name={name}
                labels={labels}
                updatedAt={meta.updatedAt}
                description={description}
                onFilterChange={onFilterChange}
                isPinned={
                  !!pinnedItems.find(item => item?.metadata.dashboardID === id)
                }
              />
            ))}
          <AssetLimitAlert
            className="dashboards--asset-alert"
            resourceName="dashboards"
            limitStatus={this.props.limitStatus}
          />
        </div>
        {/* {windowSize * pages < dashboards.length && (
          <div
            style={{height: '140px', margin: '14px auto'}}
            ref={this.registerSpinner}
          >
            <TechnoSpinner />
          </div>
        )} */}
      </div>
    )
  }
}

const mstp = (state: AppState) => {
  return {
    limitStatus: extractDashboardLimits(state),
  }
}

export default connect(mstp)(DashboardCards)
