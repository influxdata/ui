import React, {FC} from 'react'

// Components
import {
  AlignItems,
  ComponentSize,
  InfluxColors,
  Panel,
} from '@influxdata/clockface'

// Utils
import {useBilling} from 'src/billing/components/BillingPage'

const TimeOptions = {
  month: 'numeric',
  day: 'numeric',
  year: 'numeric',
  hour: 'numeric',
  minute: '2-digit',
}

const PlanTypePanel: FC = () => {
  const [{account, region}] = useBilling()

  return (
    <Panel className="plan-type-panel">
      <Panel.Header>
        <h4>Pay As You Go</h4>
      </Panel.Header>
      <Panel.Body alignItems={AlignItems.Stretch}>
        <Panel
          backgroundColor={InfluxColors.Onyx}
          className="plan-type-panel--detail"
        >
          <Panel.Header size={ComponentSize.ExtraSmall}>
            <h5>Region</h5>
          </Panel.Header>
          <Panel.Body size={ComponentSize.ExtraSmall}>
            {region.title}
          </Panel.Body>
        </Panel>
        <Panel
          backgroundColor={InfluxColors.Onyx}
          className="plan-type-panel--detail"
        >
          <Panel.Header size={ComponentSize.ExtraSmall}>
            <h5>Account Balance</h5>
          </Panel.Header>
          <Panel.Body size={ComponentSize.ExtraSmall}>
            <span className="money">
              {parseFloat(`${account.balance}`).toFixed(2)}
            </span>
          </Panel.Body>
        </Panel>
        <Panel
          backgroundColor={InfluxColors.Onyx}
          className="plan-type-panel--detail"
        >
          <Panel.Header size={ComponentSize.ExtraSmall}>
            <h5>Last Update</h5>
          </Panel.Header>
          <Panel.Body size={ComponentSize.ExtraSmall}>
            {new Date(account.updatedAt).toLocaleString('default', TimeOptions)}{' '}
          </Panel.Body>
          <Panel.Footer
            size={ComponentSize.ExtraSmall}
            className="billing--update-frequency"
          >
            Updated Hourly
          </Panel.Footer>
        </Panel>
      </Panel.Body>
    </Panel>
  )
}

export default PlanTypePanel
