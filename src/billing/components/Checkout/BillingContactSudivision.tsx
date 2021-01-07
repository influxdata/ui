import React from 'react'

import {
  Form,
  Input,
  SelectDropdown,
  ComponentColor,
} from '@influxdata/clockface'

const BillingContactSubdivision = props => {
  const {country, states, onChange, errorMessage, subdivision} = props

  switch (country) {
    case 'United States':
      return (
        <Form.Element label="State" required={true} errorMessage={errorMessage}>
          <SelectDropdown
            titleText="Select a State"
            selectedOption={subdivision}
            options={states}
            onSelect={onChange}
            buttonColor={ComponentColor.Default}
            disabled={false}
          />
        </Form.Element>
      )
    default:
      return (
        <Form.Element
          label="Subdivision"
          required={true}
          errorMessage={errorMessage}
        >
          <Input
            onChange={({target}) => onChange(target.value)}
            name="subdivision"
            title="Subdivision"
            value={subdivision}
          />
        </Form.Element>
      )
  }
}

export default BillingContactSubdivision
