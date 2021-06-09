import React, {FC, useContext, useState} from 'react'
import classnames from 'classnames'
import {
  Button,
  ComponentSize,
  Panel,
  ComponentColor,
} from '@influxdata/clockface'

// Components
import {BillingContext} from 'src/billing/context/billing'
import BillingContactForm from 'src/billing/components/Checkout/BillingContactForm'
import BillingContactDisplay from 'src/billing/components/BillingContactDisplay'

const BillingContactInfo: FC = () => {
  const {
    billingInfo: {contact},
  } = useContext(BillingContext)

  // Contact is created during signup but city (required) is not collected then
  const isFirstContactSaved = contact && contact.city

  const [isEditing, setIsEditing] = useState(!isFirstContactSaved)

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
        <BillingContactForm onSubmitForm={() => setIsEditing(false)} />
      ) : (
        <BillingContactDisplay />
      )}
    </Panel>
  )
}

export default BillingContactInfo
