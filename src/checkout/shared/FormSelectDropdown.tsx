import React, {FC, useContext} from 'react'
import {
  Form,
  FormElementProps,
  SelectDropdown,
  SelectDropdownProps,
} from '@influxdata/clockface'

// Context
import {CheckoutContext} from 'src/checkout/context/checkout'

type Props = FormElementProps &
  Omit<SelectDropdownProps, 'onSelect' | 'selectedOption'>

const FormSelectDropdown: FC<Props> = ({label, required, id, options}) => {
  const {inputs, handleSetInputs} = useContext(CheckoutContext)

  const handleSelect = (value: string): void => {
    handleSetInputs(id, value)
  }

  return (
    <Form.Element htmlFor={id} label={label} required={required}>
      <SelectDropdown
        id={id}
        options={options}
        onSelect={handleSelect}
        selectedOption={inputs[id]}
        testID={`${id}--dropdown`}
      />
    </Form.Element>
  )
}

export default FormSelectDropdown
