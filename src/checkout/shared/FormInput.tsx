import React, {ChangeEvent, FC, useContext} from 'react'
import {Form, FormElementProps, Input, InputProps} from '@influxdata/clockface'

// Context
import {CheckoutContext} from 'src/checkout/context/checkout'

type Props = FormElementProps & InputProps

let requiredMessage = 'This is a required field'

const FormInput: FC<Props> = ({label, required, ...props}) => {
  const {errors, inputs, handleSetInputs, handleSetError} = useContext(
    CheckoutContext
  )

  const handleChange = (event: ChangeEvent<HTMLInputElement>): void => {
    const {value} = event.target

    handleSetInputs(props.id, value)

    if (props.id !== 'balanceThreshold' && errors[props.id] && value !== '') {
      handleSetError(props.id, false)
    }

    if (props.id === 'balanceThreshold' && value.length && Number(value) < 1) {
      handleSetError(props.id, true)

      requiredMessage = 'Please enter a value of 1 or greater'
    }

    if (
      props.id === 'balanceThreshold' &&
      errors[props.id] &&
      Number(value) >= 1
    ) {
      handleSetError(props.id, false)
    }
  }

  return (
    <Form.Element
      htmlFor={props.id}
      label={label}
      required={required}
      testID={`${props.id}--form-element`}
      errorMessage={errors[props.id] && requiredMessage}
      errorMessageTestId={`${props.id}--form-element-error`}
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
