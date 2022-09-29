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

// Utils
import {extractDashboardLimits} from 'src/cloud/utils/limits'
import {notify} from 'src/shared/actions/notifications'

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
  private _assetLimitAlertStyle = {
    height: 'inherit',
  }

  state = {
    dashboardCardHeight: 'inherit',
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

  public render() {
    const {dashboards, onFilterChange} = this.props

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
