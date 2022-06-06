// Libraries
import React, {PureComponent} from 'react'
import {connect, ConnectedProps} from 'react-redux'
import memoizeOne from 'memoize-one'

// Components
import DashboardCard from 'src/dashboards/components/dashboard_index/DashboardCard'
import {ResourceCard, TechnoSpinner} from '@influxdata/clockface'
import AssetLimitAlert from 'src/cloud/components/AssetLimitAlert'

// Selectors
import {getSortedResources, SortTypes} from 'src/shared/utils/sort'
import {getMe} from 'src/me/selectors'
import {getOrg} from 'src/organizations/selectors'

// Types
import {AppState, Dashboard, RemoteDataState} from 'src/types'
import {Sort} from 'src/clockface'
import {LimitStatus} from 'src/cloud/actions/limits'

// Contexts
import {
  addPinnedItem,
  deletePinnedItemByParam,
  PinnedItemTypes,
} from 'src/shared/contexts/pinneditems'

// Utils
import {extractDashboardLimits} from 'src/cloud/utils/limits'
import {isFlagEnabled} from 'src/shared/utils/featureFlag'
import {CLOUD} from 'src/shared/constants'
import {notify} from 'src/shared/actions/notifications'

import {
  pinnedItemFailure,
  pinnedItemSuccess,
} from 'src/shared/copy/notifications'

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

type ReduxProps = ConnectedProps<typeof connector>
type Props = OwnProps & StateProps & ReduxProps

class DashboardCards extends PureComponent<Props> {
  private _observer
  private _isMounted = true
  private _spinner
  private _assetLimitAlertStyle = {
    height: 'inherit',
  }

  private memGetSortedResources = memoizeOne<typeof getSortedResources>(
    getSortedResources
  )

  state = {
    pages: 1,
    windowSize: 0,
    pinnedItems: [],
    dashboardCardHeight: 'inherit',
  }

  public componentDidMount() {
    if (isFlagEnabled('pinnedItems') && CLOUD) {
      this.updatePinnedItems()
    }
    this.setState(prev => ({...prev, windowSize: 15}))
  }

  public componentDidUpdate() {
    const card = document.querySelector<HTMLElement>(
      '.dashboards-card-grid > .cf-resource-card'
    )
    if (card?.offsetHeight) {
      this.setState({
        dashboardCardHeight: `${card.offsetHeight}px`,
      })
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

  public updatePinnedItems = () => {
    getPinnedItems()
      .then(res => {
        if (this._isMounted) {
          this.setState(prev => ({...prev, pinnedItems: res}))
        }
      })
      .catch(err => console.error(err))
  }

  public handlePinDashboard = async (
    dashboardID: string,
    name: string,
    description: string
  ) => {
    const {org, me} = this.props

    // add to pinned item list
    try {
      await addPinnedItem({
        orgID: org.id,
        userID: me.id,
        metadata: {
          dashboardID,
          name,
          description,
        },
        type: PinnedItemTypes.Dashboard,
      })
      this.props.sendNotification(pinnedItemSuccess('dashboard', 'added'))
      this.updatePinnedItems()
    } catch (err) {
      this.props.sendNotification(pinnedItemFailure(err.message, 'add'))
    }
  }

  public handleUnpinDashboard = async (dashboardID: string) => {
    // delete from pinned item list
    try {
      await deletePinnedItemByParam(dashboardID)
      this.props.sendNotification(pinnedItemSuccess('dashboard', 'deleted'))
      this.updatePinnedItems()
    } catch (err) {
      this.props.sendNotification(pinnedItemFailure(err.message, 'delete'))
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

    const {windowSize, pages, pinnedItems} = this.state

    return (
      <div style={{height: '100%'}}>
        <div className="dashboards-card-grid">
          {sortedDashboards
            .filter(d => d.status === RemoteDataState.Done)
            .slice(0, pages * windowSize)
            .map(({id, name, description, labels, meta}) => (
              <DashboardCard
                key={id}
                id={id}
                name={name}
                labels={labels}
                updatedAt={meta.updatedAt}
                description={description}
                onFilterChange={onFilterChange}
                onPinDashboard={this.handlePinDashboard}
                onUnpinDashboard={this.handleUnpinDashboard}
                isPinned={
                  !!pinnedItems.find(item => item?.metadata.dashboardID === id)
                }
              />
            ))}
          {this.props.limitStatus === 'exceeded' && (
            <ResourceCard style={{height: this.state.dashboardCardHeight}}>
              <AssetLimitAlert
                className="dashboards--asset-alert"
                resourceName="dashboards"
                limitStatus={this.props.limitStatus}
                style={this._assetLimitAlertStyle}
              />
            </ResourceCard>
          )}
        </div>
        {windowSize * pages < dashboards.length && (
          <div
            style={{height: '140px', margin: '14px auto'}}
            ref={this.registerSpinner}
          >
            <TechnoSpinner />
          </div>
        )}
      </div>
    )
  }
}

const mdtp = {
  sendNotification: notify,
}

const mstp = (state: AppState) => {
  const me = getMe(state)
  const org = getOrg(state)

  return {
    limitStatus: extractDashboardLimits(state),
    me,
    org,
  }
}

const connector = connect(mstp, mdtp)

export default connector(DashboardCards)
