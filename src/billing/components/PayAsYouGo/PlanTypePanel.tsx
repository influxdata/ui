import React, {FC, useContext} from 'react'

// Components
import {
  AlignItems,
  ComponentSize,
  InfluxColors,
  Panel,
} from '@influxdata/clockface'
import {BillingContext} from 'src/billing/context/billing'

const PlanTypePanel: FC = () => {
  const {billingInfo} = useContext(BillingContext)

  return (
    <Panel className="plan-type-panel">
      <Panel.Header testID="payg-plan--header">
        <h4>Pay As You Go</h4>
      </Panel.Header>
      <Panel.Body alignItems={AlignItems.Stretch}>
        <Panel
          backgroundColor={InfluxColors.Grey15}
          className="plan-type-panel--detail"
        >
          <Panel.Header
            size={ComponentSize.ExtraSmall}
            testID="payg-plan--balance-header"
          >
            <h5>Account Balance</h5>
          </Panel.Header>
          <Panel.Body
            size={ComponentSize.ExtraSmall}
            testID="payg-plan--balance-body"
          >
            <span className="money">
              {parseFloat(`${billingInfo?.balance}`).toFixed(2)}
            </span>
          </Panel.Body>
        </Panel>
        <Panel
          backgroundColor={InfluxColors.Grey15}
          className="plan-type-panel--detail"
        >
          <Panel.Header
            size={ComponentSize.ExtraSmall}
            testID="payg-plan--updated-header"
          >
            <h5>Last Update</h5>
          </Panel.Header>
          <Panel.Body
            size={ComponentSize.ExtraSmall}
            testID="payg-plan--updated-body"
          >
            {new Date(billingInfo?.balanceUpdatedAt).toLocaleString('default', {
              month: 'numeric',
              day: 'numeric',
              year: 'numeric',
              hour: 'numeric',
              minute: '2-digit',
            })}{' '}
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
