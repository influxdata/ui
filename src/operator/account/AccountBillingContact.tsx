import React, {FC, useContext} from 'react'
import {TextBlock} from '@influxdata/clockface'
import {billingContactInfo} from 'src/operator/constants'
import {AccountContext} from 'src/operator/context/account'

const AccountBillingContact: FC = () => {
  const {
    account: {billingContact},
  } = useContext(AccountContext)

  const createLine = (path, defaultValue, renderValue) => {
    const value = path.map(x => {
      return billingContact[x] ?? defaultValue
    })
    return renderValue ? renderValue(value) : value
  }

  const createBillingContact = () => {
    return billingContactInfo.map(value => {
      const text = createLine(value.path, value.defaultValue, value.renderValue)
      return text != '' ? (
        <TextBlock
          key={value.name}
          className="account-grid-text body"
          text={text}
        />
      ) : (
        <p key={value.name} />
      )
    })
  }

  return (
    <div>
      <TextBlock
        className="account-grid-text heading"
        text="Billing Contact"
        testID="billing-contact-header"
      />
      {createBillingContact()}
    </div>
  )
}

export default AccountBillingContact
