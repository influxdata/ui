import React, {FC, useContext} from 'react'
import {InputLabel, Toggle, ToggleProps} from '@influxdata/clockface'

// Context
import {CheckoutContext} from 'src/checkout/context/checkout'

interface FormToggleProps extends Omit<ToggleProps, 'onChange'> {
  label: string
}

const FormToggle: FC<FormToggleProps> = ({label, ...props}) => {
  const {inputs, handleSetInputs} = useContext(CheckoutContext)
  return (
    <Toggle
      {...props}
      checked={inputs.shouldNotify}
      onChange={() => handleSetInputs('shouldNotify', !inputs.shouldNotify)}
      testID={`${props.id}--checkbox`}
    >
      <InputLabel wrapText={true}>{label}</InputLabel>
    </Toggle>
  )
}

export default FormToggle
