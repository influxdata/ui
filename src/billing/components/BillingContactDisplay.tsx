import React, {Fragment} from 'react'
import {Panel, Grid, GridRow, ComponentSize} from '@influxdata/clockface'

import BillingContactItem from './BillingContactItem'
import BillingPanelFooter from './BillingPanelFooter'

const BillingContactDisplay = ({contact, isShowingNext, onNextStep}) => {
  const isFooterDisabled =
    isShowingNext === undefined && onNextStep == undefined

  return (
    <Fragment>
      <Panel.Body size={ComponentSize.Large} testID="billing-contact">
        <Grid>
          <GridRow>
            <BillingContactItem header="First Name">
              {contact.firstName}
            </BillingContactItem>
            <BillingContactItem header="Last Name">
              {contact.lastName}
            </BillingContactItem>
          </GridRow>
          <GridRow>
            <BillingContactItem header="Company Name">
              {contact.companyName}
            </BillingContactItem>
            <BillingContactItem header="Country">
              {contact.country}
            </BillingContactItem>
          </GridRow>
          <GridRow>
            <BillingContactItem header="Physical Address">
              {contact.street1}, {contact.street2}
            </BillingContactItem>
          </GridRow>
          <GridRow>
            <BillingContactItem header="City">
              {contact.city}
            </BillingContactItem>
            <BillingContactItem header="State (Subdivision)">
              {contact.subdivision}
            </BillingContactItem>
            <BillingContactItem header="Postal Code">
              {contact.postalCode}
            </BillingContactItem>
          </GridRow>
        </Grid>
      </Panel.Body>
      {!isFooterDisabled && (
        <BillingPanelFooter
          confirmText="Next"
          onNextStep={onNextStep}
          hide={!isShowingNext}
        />
      )}
    </Fragment>
  )
}

export default BillingContactDisplay
