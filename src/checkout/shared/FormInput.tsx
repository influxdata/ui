import React, {ChangeEvent, FC, useContext, useState} from 'react'
import {Form, FormElementProps, Input, InputProps} from '@influxdata/clockface'

// Context
import {CheckoutContext} from 'src/checkout/context/checkout'

type Props = FormElementProps & InputProps

const FormInput: FC<Props> = ({label, required, id, ...args}) => {
  const {errors, handleSetInputs, handleSetError, inputs, isDirty, setIsDirty} =
    useContext(CheckoutContext)

  const [requiredMessage, setRequiredMessage] = useState(
    'This is a required field'
  )

  const handleChange = (event: ChangeEvent<HTMLInputElement>): void => {
    const {value} = event.target

    handleSetInputs(id, value)

    if (id !== 'balanceThreshold' && errors[id] && value !== '') {
      handleSetError(id, false)
    }

    if (id === 'balanceThreshold' && value.length && Number(value) < 1) {
      handleSetError(id, true)

      setRequiredMessage('Please enter a value of 1 or greater')
    }

    if (id === 'balanceThreshold' && errors[id] && Number(value) >= 1) {
      handleSetError(id, false)
    }
  }

  const handleOnFocus = () => {
    if (isDirty === false) {
      setIsDirty(true)
    }
  }

  return (
    <Form.Element
      htmlFor={id}
      label={label}
      required={required}
      testID={`${id}--form-element`}
      errorMessage={errors[id] && requiredMessage}
      errorMessageTestId={`${id}--form-element-error`}
    >
      <Input
        id={id}
        value={inputs[id]}
        onChange={handleChange}
        testID={`${id}--input`}
        onFocus={handleOnFocus}
        // The args we're spreading here are optional parameters that may or may not exist:
        // 1. type
        // 2. min
        // 3. step
        // 4. icon
        {...args}
      />
    </Form.Element>
  )
}

export default FormInput
