import React, {FC} from 'react'
import {useField} from 'formik'
import {InputLabel, Toggle, ToggleProps} from '@influxdata/clockface'

interface FormToggleProps extends Omit<ToggleProps, 'onChange'> {
  label: string
}

const FormToggle: FC<FormToggleProps> = ({label, ...props}) => {
  const [field, meta, helpers] = useField(props.id)
  const {value} = meta
  const {setTouched, setValue} = helpers

  // Formik's standard handleBlur doesn't work with a Clockface Toggle because
  // the field's ID is assigned to a hidden input, but the onBlur handler is
  // placed on a label instead. That means that Formik can't figure out which
  // field has been touched.
  //
  // This replacement does what Formik's built-in would do if it could figure
  // out the field's ID.
  const handleBlur = () => setTouched(true)

  // Toggle calls our `onChange` callback with an empty string because the handler
  // is attached to a label rather than the hidden checkbox input. Because of this,
  // Formik's built-in `onChange` callback can't figure out what to do.
  const handleChange = _ => setValue(!value)

  return (
    <Toggle
      {...field}
      {...props}
      checked={value}
      onBlur={handleBlur}
      onChange={handleChange}
      testID={`${props.id}--checkbox`}
    >
      <InputLabel wrapText={true}>{label}</InputLabel>
    </Toggle>
  )
}

export default FormToggle
