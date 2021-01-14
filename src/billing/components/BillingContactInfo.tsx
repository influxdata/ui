import React, {FC, useState} from 'react'
import classnames from 'classnames'
import {
  Button,
  ComponentSize,
  Panel,
  ComponentColor,
} from '@influxdata/clockface'

import BillingContactForm from 'src/billing/components/Checkout/BillingContactForm'
import BillingContactDisplay from 'src/billing/components/BillingContactDisplay'
import {useBilling} from 'src/billing/components/BillingPage'

const BillingContactInfo: FC = () => {
  const [
    {
      account: {billingContact},
    },
  ] = useBilling()

  // Contact is created during signup but city (required) is not collected then
  const isFirstContactSaved = billingContact && billingContact.city

  const [isEditing, setIsEditing] = useState(!isFirstContactSaved)

  const handleSubmitEditForm = () => {
    setIsEditing(false)
    // TODO(ariel): make a request to get the most updated info
  }

  const panelClass = classnames('checkout-panel billing-contact-panel', {
    hide: false,
  })

  return (
    <Panel className={panelClass}>
      <Panel.Header size={ComponentSize.Large}>
        <h4>
          {isEditing ? 'Enter Contact Information' : 'Contact Information'}
        </h4>
        {isEditing ? (
          isFirstContactSaved && (
            <Button
              color={ComponentColor.Default}
              onClick={() => setIsEditing(false)}
              text="Cancel Change"
              size={ComponentSize.Small}
            />
          )
        ) : (
          <Button
            color={ComponentColor.Default}
            onClick={() => setIsEditing(true)}
            text="Edit Information"
            size={ComponentSize.Small}
          />
        )}
      </Panel.Header>
      {isEditing ? (
        <BillingContactForm onSubmitForm={handleSubmitEditForm} />
      ) : (
        <BillingContactDisplay />
      )}
    </Panel>
  )
}

export default BillingContactInfo
