import React, {FC, useContext} from 'react'
import {Panel, Grid, ComponentSize} from '@influxdata/clockface'

import BillingContactItem from 'src/billing/components/BillingContactItem'
import {BillingContext} from 'src/billing/context/billing'

const BillingContactDisplay: FC = () => {
  const {
    billingInfo: {contact},
  } = useContext(BillingContext)

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
