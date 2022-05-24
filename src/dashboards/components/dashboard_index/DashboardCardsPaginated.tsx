// Libraries
import React, {PureComponent} from 'react'
import {connect, ConnectedProps} from 'react-redux'

// Components
import DashboardCard from 'src/dashboards/components/dashboard_index/DashboardCard'
import AssetLimitAlert from 'src/cloud/components/AssetLimitAlert'
import {ResourceCard} from '@influxdata/clockface'

// Types
import {AppState, Dashboard} from 'src/types'
import {LimitStatus} from 'src/cloud/actions/limits'

// Selectors
import {getMe} from 'src/me/selectors'
import {getOrg} from 'src/organizations/selectors'

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
  onFilterChange: (searchTerm: string) => void
}

type ReduxProps = ConnectedProps<typeof connector>
type Props = OwnProps & StateProps & ReduxProps

class DashboardCards extends PureComponent<Props> {
  private _isMounted = true
  private _assetLimitAlertStyle = {
    height: 'inherit',
  }

  state = {
    pinnedItems: [],
    dashboardCardHeight: 'inherit',
  }

  public componentDidMount() {
    if (isFlagEnabled('pinnedItems') && CLOUD) {
      this.updatePinnedItems()
    }
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

  public render() {
    const {dashboards, onFilterChange} = this.props

    const {pinnedItems} = this.state

    return (
      <div className="dashboards-card-grid">
        {dashboards.map(({id, name, description, labels, meta}) => (
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
    )
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
