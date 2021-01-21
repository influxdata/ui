import React, {ChangeEvent, FC, useContext} from 'react'
import {Form, FormElementProps, Input, InputProps} from '@influxdata/clockface'

// Context
import {CheckoutContext} from 'src/checkout/context/checkout'

type Props = FormElementProps & InputProps

const FormInput: FC<Props> = ({label, required, ...props}) => {
  const {inputs, handleSetInputs} = useContext(CheckoutContext)

  const handleChange = (event: ChangeEvent<HTMLInputElement>): void => {
    const {value} = event.target
    handleSetInputs(props.id, value)
  }

  return (
    <Form.Element
      htmlFor={props.id}
      label={label}
      required={required}
      // errorMessage={meta.touched && meta.error}
    >
      <Input
        {...props}
        value={inputs[props.id]}
        onChange={handleChange}
        testID={`${props.id}--input`}
      />
    </Form.Element>
  )
}

export default FormInput
