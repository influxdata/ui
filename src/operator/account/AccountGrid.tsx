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
  const {account} = useContext(AccountContext)

  const changeType = type => {
    switch (type) {
      case 'pay_as_you_go':
        return 'PAYG'
      default:
        return type
    }
  }

  const billingAccountID = () => {
    if (!account?.marketplace) {
      return account?.zuoraAccountId ?? 'N/A'
    } else {
      return account?.marketplace?.subscriberId ?? 'N/A'
    }
  }

  return (
    <FlexBox
      direction={FlexDirection.Row}
      margin={ComponentSize.Large}
      alignItems={AlignItems.FlexStart}
    >
      <FlexBox
        direction={FlexDirection.Column}
        margin={ComponentSize.ExtraSmall}
        alignItems={AlignItems.FlexStart}
      >
        <AccountField
          header="Account Type"
          body={changeType(account.type)}
          testID="account-type"
        />
        <AccountField
          header="Account Balance"
          body={`$${account.balance.toFixed(2)}`}
          testID="account-balance"
        />
        <AccountField
          header="Cloud Provider"
          body={account?.organizations?.[0]?.provider ?? 'N/A'}
          testID="cloud-provider"
        />
      </FlexBox>

      <FlexBox
        direction={FlexDirection.Column}
        margin={ComponentSize.ExtraSmall}
        alignItems={AlignItems.FlexStart}
      >
        <AccountField
          header="Billing Provider"
          body={account?.marketplace?.shortName ?? 'Zuora'}
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
          body={account?.marketplace?.status ?? 'N/A'}
          testID="subscription-status"
        />
        <AccountBillingContact />
      </FlexBox>
    </FlexBox>
  )
}
export default AccountGrid
