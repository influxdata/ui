import React, {FC} from 'react'
import {Columns, Grid} from '@influxdata/clockface'
import FormInput from 'src/checkout/shared/FormInput'
import FormSelectDropdown from 'src/checkout/shared/FormSelectDropdown'
import {countries} from 'src/billing/constants'

const CanadaContactForm: FC = () => (
  <Grid>
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
        <FormInput id="intlSubdivision" label="Province" />
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
        <FormInput id="postalCode" label="Postal Code" />
      </Grid.Column>
    </Grid.Row>
  </Grid>
)

export default CanadaContactForm
