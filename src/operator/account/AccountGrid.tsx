import React, {FC, useContext} from 'react'
import {
  FlexBox,
  FlexDirection,
  ComponentSize,
  AlignItems,
} from '@influxdata/clockface'
import AccountBillingContact from './AccountBillingContact'
import AccountField from 'src/operator/account/AccountField'
import {AccountContext} from 'src/operator/context/account'

const AccountGrid: FC = () => {
  const {account, organizations} = useContext(AccountContext)

  const billingAccountID = () => {
    if (!account?.marketplaceSubscription) {
      return account?.zuoraAccountId ?? 'N/A'
    }

    return account?.marketplaceSubscription?.subscriberId ?? 'N/A'
  }

  const cancelledAt = account?.cancelledAt
    ? new Date(account?.cancelledAt)
    : null
  const hasCancelledAt = Boolean(cancelledAt)

  return (
    <FlexBox
      direction={FlexDirection.Row}
      margin={ComponentSize.Large}
      alignItems={AlignItems.FlexStart}
      testID="account-grid--wrapper"
    >
      <FlexBox
        direction={FlexDirection.Column}
        margin={ComponentSize.ExtraSmall}
        alignItems={AlignItems.FlexStart}
      >
        <AccountField
          header="Account Type"
          body={account.type === 'pay_as_you_go' ? 'PAYG' : account.type}
          testID="account-type"
        />
        <AccountField
          header="Account Balance"
          body={`$${account.balance.toFixed(2)}`}
          testID="account-balance"
        />
        <AccountField
          header="Cloud Provider"
          body={organizations?.[0]?.provider ?? 'N/A'}
          testID="cloud-provider"
        />
        <AccountField
          header="Cancelled At"
          body={
            account.type === 'cancelled' && hasCancelledAt
              ? `${cancelledAt.toLocaleTimeString()} ${cancelledAt.toDateString()}`
              : 'N/A'
          }
          testID="cancelled-at"
        />
      </FlexBox>
      <FlexBox
        direction={FlexDirection.Column}
        margin={ComponentSize.ExtraSmall}
        alignItems={AlignItems.FlexStart}
      >
        <AccountField
          header="Billing Provider"
          body={account?.marketplaceSubscription?.marketplace ?? 'Zuora'}
          testID="billing-provider"
        />
        <AccountField
          header="Billing Account ID"
          body={billingAccountID() || 'N/A'}
          testID="billing-acctid"
        />
        <AccountField
          header="Salesforce ID"
          body={account?.users?.[0]?.sfdcContactId ?? 'N/A'}
          testID="salesforce-id"
        />
      </FlexBox>
      <FlexBox
        direction={FlexDirection.Column}
        margin={ComponentSize.ExtraSmall}
        alignItems={AlignItems.FlexStart}
      >
        <AccountField
          header="Subscription Status"
          body={account?.marketplaceSubscription?.status ?? 'pending'}
          testID="subscription-status"
        />
        <AccountBillingContact />
      </FlexBox>
    </FlexBox>
  )
}
export default AccountGrid
