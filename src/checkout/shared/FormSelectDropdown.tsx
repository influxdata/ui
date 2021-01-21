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

const FormSelectDropdown: FC<Props> = ({label, required, ...props}) => {
  const {inputs, handleSetInputs} = useContext(CheckoutContext)

  const handleSelect = (value: string): void => {
    handleSetInputs(props.id, value)
  }

  return (
    <Form.Element
      htmlFor={props.id}
      label={label}
      required={required}
      // errorMessage={meta.touched && meta.error}
    >
      <SelectDropdown
        {...props}
        onSelect={handleSelect}
        selectedOption={inputs[props.id]}
        testID={`${props.id}--dropdown`}
      />
    </Form.Element>
  )
}

export default FormSelectDropdown
