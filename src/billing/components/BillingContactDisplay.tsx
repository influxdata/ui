import React from 'react'
import {Panel, Grid, ComponentSize} from '@influxdata/clockface'

import BillingContactItem from 'src/billing/components/BillingContactItem'
import {useBilling} from 'src/billing/components/BillingPage'

const BillingContactDisplay = () => {
  const [
    {
      billingInfo: {contact},
    },
  ] = useBilling()

  return (
    <>
      <Panel.Body size={ComponentSize.Large} testID="billing-contact">
        <Grid>
          <Grid.Row>
            <BillingContactItem header="First Name">
              {contact.firstName}
            </BillingContactItem>
            <BillingContactItem header="Last Name">
              {contact.lastName}
            </BillingContactItem>
          </Grid.Row>
          <Grid.Row>
            <BillingContactItem header="Company Name">
              {contact.companyName}
            </BillingContactItem>
            <BillingContactItem header="Country">
              {contact.country}
            </BillingContactItem>
          </Grid.Row>
          <Grid.Row>
            <BillingContactItem header="Physical Address">
              {contact.street1}, {contact.street2}
            </BillingContactItem>
          </Grid.Row>
          <Grid.Row>
            <BillingContactItem header="City">
              {contact.city}
            </BillingContactItem>
            <BillingContactItem header="State (Subdivision)">
              {contact.subdivision}
            </BillingContactItem>
            <BillingContactItem header="Postal Code">
              {contact.postalCode}
            </BillingContactItem>
          </Grid.Row>
        </Grid>
      </Panel.Body>
    </>
  )
}

export default BillingContactDisplay
