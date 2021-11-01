import React, {FC, useContext} from 'react'
import {Panel, Grid, ComponentSize} from '@influxdata/clockface'

import BillingContactItem from 'src/billing/components/BillingContactItem'
import {BillingContext} from 'src/billing/context/billing'

const BillingContactDisplay: FC = () => {
  const {
    billingInfo: {contact},
  } = useContext(BillingContext)

  return (
    <Panel.Body size={ComponentSize.Large} testID="billing-contact">
      <Grid>
        <Grid.Row>
          <BillingContactItem header="First Name" value={contact?.firstName} />
          <BillingContactItem header="Last Name" value={contact?.lastName} />
        </Grid.Row>
        <Grid.Row>
          <BillingContactItem
            header="Company Name"
            value={contact?.companyName}
          />
          <BillingContactItem header="Country" value={contact?.country} />
        </Grid.Row>
        <Grid.Row>
          <BillingContactItem
            header="Physical Address"
            value={`${contact?.street1}, ${contact?.street2}`}
          />
        </Grid.Row>
        <Grid.Row>
          <BillingContactItem header="City" value={contact?.city} />
          <BillingContactItem
            header="State (Subdivision)"
            value={contact?.subdivision}
          />
          <BillingContactItem
            header="Postal Code"
            value={contact?.postalCode}
          />
        </Grid.Row>
      </Grid>
    </Panel.Body>
  )
}

export default BillingContactDisplay
