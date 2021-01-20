import React, {FC} from 'react'
import {useField} from 'formik'
import {Form, FormElementProps, Input, InputProps} from '@influxdata/clockface'

type Props = FormElementProps & InputProps

const FormInput: FC<Props> = ({label, required, ...props}) => {
  const [field, meta] = useField(props.id)

  return (
    <Form.Element
      htmlFor={props.id}
      label={label}
      required={required}
      errorMessage={meta.touched && meta.error}
    >
      <Input {...field} {...props} testID={`${props.id}--input`} />
    </Form.Element>
  )
}

export default FormInput
