import React, {FC, useState} from 'react'
import {
  Button,
  ComponentSize,
  Panel,
  ComponentColor,
} from '@influxdata/clockface'

// Components
import BillingContactForm from 'src/billing/components/Checkout/BillingContactForm'
import BillingContactDisplay from 'src/billing/components/BillingContactDisplay'

const BillingContactInfo: FC = () => {
  const [isEditing, setIsEditing] = useState(false)

  return (
    <Panel className="checkout-panel billing-contact-panel">
      <Panel.Header size={ComponentSize.Large}>
        <h4>{`${isEditing ? 'Enter ' : ''}Contact Information`}</h4>
        <Button
          color={ComponentColor.Default}
          onClick={() => setIsEditing(!isEditing)}
          text={isEditing ? 'Cancel Change' : 'Edit Information'}
          size={ComponentSize.Small}
        />
      </Panel.Header>
      {isEditing ? (
        <BillingContactForm toggleEditingOff={() => setIsEditing(false)} />
      ) : (
        <BillingContactDisplay />
      )}
    </Panel>
  )
}

export default BillingContactInfo
