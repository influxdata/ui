// Libraries
import React, {PureComponent} from 'react'
import {connect} from 'react-redux'

// Components
import DashboardCard from 'src/dashboards/components/dashboard_index/DashboardCard'
import AssetLimitAlert from 'src/cloud/components/AssetLimitAlert'

// Types
import {AppState, Dashboard} from 'src/types'
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
  onFilterChange: (searchTerm: string) => void
}

class DashboardCards extends PureComponent<OwnProps & StateProps> {
  
  private _isMounted = true


  state = {
    pinnedItems: [],
  }

  public componentDidMount() {
    if (isFlagEnabled('pinnedItems') && CLOUD) {
      getPinnedItems()
        .then(res => {
          if (this._isMounted) {
            this.setState(prev => ({...prev, pinnedItems: res}))
          }
        })
        .catch(err => {
          console.error(err)
        })
    } 
  }

  public componentWillUnmount() {
    this._isMounted = false
  }

  public render() {
    const {
      dashboards,
      onFilterChange,
    } = this.props

    const {pinnedItems} = this.state

    return (
      <div>
        <div className="dashboards-card-grid">
          {dashboards
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
