import React, {FC, ChangeEvent} from 'react'

import {Panel, ComponentSize, ComponentStatus} from '@influxdata/clockface'

import BillingPanelFooter from './BillingPanelFooter'
import BillingThreshold from './BillingThreshold'
import SummaryBullet from 'src/billing/components/Checkout/SummaryBullet'
import VersionedPrices from 'src/billing/components/Checkout/VersionedPrices'

interface Props {
  onNextStep: () => void
  hide: boolean
  notifyEmail: string
  balanceThreshold: number
  isNotifyActive: boolean
  onNotify: () => void
  onBalanceThresholdChange: (e: ChangeEvent<HTMLInputElement>) => void
  onEmailChange: (e: ChangeEvent<HTMLInputElement>) => void
  pricingVersion: number
}

const BillingSummary: FC<Props> = ({
  onNextStep,
  hide,
  notifyEmail,
  balanceThreshold,
  isNotifyActive,
  onNotify,
  onBalanceThresholdChange,
  onEmailChange,
  pricingVersion,
}) => {
  const buttonStatus =
    balanceThreshold < 10 ? ComponentStatus.Disabled : ComponentStatus.Default

  return (
    <Panel className="simple-card">
      <Panel.Header size={ComponentSize.Large}>
        <h4>Plan Details</h4>
      </Panel.Header>
      <Panel.Body size={ComponentSize.Large}>
        <ul className="billing-summary">
          <li>
            <SummaryBullet>
              You are switching to a <strong>Usage-Based</strong> plan
            </SummaryBullet>
          </li>
          <li>
            <SummaryBullet>
              This change will take effect <strong>immediately</strong>
            </SummaryBullet>
          </li>
          <li>
            <SummaryBullet horizontalChildren>
              <BillingThreshold
                isNotifyActive={isNotifyActive}
                balanceThreshold={balanceThreshold}
                notifyEmail={notifyEmail}
                onNotify={onNotify}
                onBalanceThresholdChange={onBalanceThresholdChange}
                onEmailChange={onEmailChange}
              />
            </SummaryBullet>
          </li>
          <li>
            <SummaryBullet>
              Your billing period closes on the{' '}
              <strong>last day of the month</strong>
            </SummaryBullet>
          </li>
        </ul>
      </Panel.Body>
      <VersionedPrices pricingVersion={pricingVersion} />
      <BillingPanelFooter
        confirmText="Take the First Step"
        hide={hide}
        onNextStep={onNextStep}
        buttonStatus={buttonStatus}
      />
    </Panel>
  )
}
export default BillingSummary
