import React, {FC} from 'react'
import {TextBlock} from '@influxdata/clockface'
import {billingContactInfo} from 'src/operator/constants'
import {BillingContact} from 'src/types/billing'
import {get} from 'lodash'

interface Props {
  billingContact: BillingContact
}

const AccountBillingContact: FC<Props> = billingContact => {
  const createLine = (path, defaultValue, renderValue) => {
    const value = path.map(x => {
      return get(billingContact, x, defaultValue)
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
