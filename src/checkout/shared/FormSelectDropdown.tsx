import React, {FC} from 'react'
import {useField} from 'formik'
import {
  Form,
  FormElementProps,
  SelectDropdown,
  SelectDropdownProps,
} from '@influxdata/clockface'

type Props = FormElementProps &
  Omit<SelectDropdownProps, 'onSelect' | 'selectedOption'>

const FormSelectDropdown: FC<Props> = ({label, required, ...props}) => {
  const [field, meta, helpers] = useField(props.id)

  return (
    <Form.Element
      htmlFor={props.id}
      label={label}
      required={required}
      errorMessage={meta.touched && meta.error}
    >
      <SelectDropdown
        {...field}
        {...props}
        onSelect={helpers.setValue}
        selectedOption={meta.value}
        testID={`${props.id}--dropdown`}
      />
    </Form.Element>
  )
}

export default FormSelectDropdown
