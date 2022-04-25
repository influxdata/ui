import React, {FC} from 'react'
import {Columns, Grid} from '@influxdata/clockface'
import FormInput from 'src/checkout/shared/FormInput'
import FormSelectDropdown from 'src/checkout/shared/FormSelectDropdown'
import {states, countries} from 'src/billing/constants'

const USContactForm: FC = () => (
  <Grid>
    <Grid.Row>
      <Grid.Column widthSM={Columns.Six}>
        <FormInput id="email" label="Email Address" />
      </Grid.Column>
    </Grid.Row>
    <Grid.Row>
      <Grid.Column widthSM={Columns.Six}>
        <FormInput id="firstName" label="First Name" />
      </Grid.Column>
      <Grid.Column widthSM={Columns.Six}>
        <FormInput id="lastName" label="Last Name" />
      </Grid.Column>
    </Grid.Row>
    <Grid.Row>
      <Grid.Column widthSM={Columns.Six}>
        <FormSelectDropdown
          id="country"
          label="Country"
          options={countries}
          required
        />
      </Grid.Column>
      <Grid.Column widthSM={Columns.Six}>
        <FormSelectDropdown
          id="usSubdivision"
          label="State"
          options={states}
          required
        />
      </Grid.Column>
    </Grid.Row>
    <Grid.Row>
      <Grid.Column widthSM={Columns.Six}>
        <FormInput id="street1" label="Address 1" />
      </Grid.Column>
      <Grid.Column widthSM={Columns.Six}>
        <FormInput id="street2" label="Address 2" />
      </Grid.Column>
    </Grid.Row>
    <Grid.Row>
      <Grid.Column widthSM={Columns.Six}>
        <FormInput id="city" label="City" required />
      </Grid.Column>
      <Grid.Column widthSM={Columns.Three}>
        <FormInput id="postalCode" label="ZIP" required />
      </Grid.Column>
    </Grid.Row>
  </Grid>
)

export default USContactForm
