import React, {FC, useState} from 'react'
import classnames from 'classnames'
import {
  Button,
  ComponentSize,
  Panel,
  ComponentColor,
} from '@influxdata/clockface'

// Components
import BillingContactForm from 'src/billing/components/Checkout/BillingContactForm'
import BillingContactDisplay from 'src/billing/components/BillingContactDisplay'

// Utils
import {useBilling} from 'src/billing/components/BillingPage'
import {getBillingInfo} from 'src/billing/thunks'

const BillingContactInfo: FC = () => {
  const [
    {
      billingInfo: {contact},
    },
    dispatch,
  ] = useBilling()

  // Contact is created during signup but city (required) is not collected then
  const isFirstContactSaved = contact && contact.city

  const [isEditing, setIsEditing] = useState(!isFirstContactSaved)

  const handleSubmitEditForm = () => {
    setIsEditing(false)
    getBillingInfo(dispatch)
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
