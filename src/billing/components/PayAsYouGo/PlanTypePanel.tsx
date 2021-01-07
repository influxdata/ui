import React, {Component} from 'react'

import {
  Panel,
  ComponentSize,
  InfluxColors,
  Grid,
  Columns,
} from '@influxdata/clockface'

const TimeOptions = {
  month: 'numeric',
  day: 'numeric',
  year: 'numeric',
  hour: 'numeric',
  minute: '2-digit',
}

class PlanTypePanel extends Component {
  render() {
    const {account, region} = this.props

    return (
      <Panel className="plan-type-panel">
        <Panel.Header>
          <h4>Pay As You Go</h4>
        </Panel.Header>
        <Panel.Body>
          <Grid>
            <Grid.Row>
              <Grid.Column widthSM={Columns.Four}>
                <Panel
                  size={ComponentSize.ExtraSmall}
                  backgroundColor={InfluxColors.Onyx}
                  className="plan-type-panel--detail"
                >
                  <Panel.Header>
                    <h5>Region</h5>
                  </Panel.Header>
                  <Panel.Body>{region.title}</Panel.Body>
                </Panel>
              </Grid.Column>
              <Grid.Column widthSM={Columns.Four}>
                <Panel
                  size={ComponentSize.ExtraSmall}
                  backgroundColor={InfluxColors.Onyx}
                  className="plan-type-panel--detail"
                >
                  <Panel.Header>
                    <h5>Account Balance</h5>
                  </Panel.Header>
                  <Panel.Body>
                    <span className="money">
                      ${parseFloat(account.balance).toFixed(2)}
                    </span>
                  </Panel.Body>
                </Panel>
              </Grid.Column>
              <Grid.Column widthSM={Columns.Four}>
                <Panel
                  size={ComponentSize.ExtraSmall}
                  backgroundColor={InfluxColors.Onyx}
                  className="plan-type-panel--detail"
                >
                  <Panel.Header>
                    <h5>Last Update</h5>
                  </Panel.Header>
                  <Panel.Body>
                    {new Date(account.updatedAt).toLocaleString(
                      'default',
                      TimeOptions
                    )}{' '}
                  </Panel.Body>
                  <Panel.Footer className="billing--update-frequency">
                    Updated Hourly
                  </Panel.Footer>
                </Panel>
              </Grid.Column>
            </Grid.Row>
          </Grid>
        </Panel.Body>
      </Panel>
    )
  }
}

export default PlanTypePanel
