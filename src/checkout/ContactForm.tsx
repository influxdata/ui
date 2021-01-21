import React, {FC} from 'react'
import {useFormikContext} from 'formik'
import {Columns, Grid} from '@influxdata/clockface'
import FormInput from 'src/checkout/shared/FormInput'
import FormSelectDropdown from 'src/checkout/shared/FormSelectDropdown'
import {states, countries} from 'src/billing/constants'

const UsContactForm: FC = () => (
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

const CaContactForm: FC = () => (
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

const IntlContactForm: FC = () => (
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
        <FormInput id="intlSubdivision" label="State / Province / Region" />
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
        <FormInput id="city" label="City / Town" required />
      </Grid.Column>
      <Grid.Column widthSM={Columns.Three}>
        <FormInput id="postalCode" label="ZIP / Postal Code" />
      </Grid.Column>
    </Grid.Row>
  </Grid>
)

const ContactForm: FC = () => {
  const {
    values: {country},
  } = useFormikContext()

  switch (country) {
    case 'United States':
      return <UsContactForm />
    case 'Canada':
      return <CaContactForm />
    default:
      return <IntlContactForm />
  }
}

export default ContactForm
