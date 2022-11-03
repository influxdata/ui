import React, {FC, useCallback, useEffect, useState} from 'react'
import {
  AlignItems,
  ComponentSize,
  FlexBox,
  FlexDirection,
  Form,
  FormElementProps,
  Input,
  InputLabel,
  InputProps,
  JustifyContent,
} from '@influxdata/clockface'

// Style
import './InputWithLabel.scss'

interface OwnProps {
  description?: string
  errorMessage?: string
  showError?: boolean
}

type Props = OwnProps & FormElementProps & InputProps

const DEFAULT_ERROR_MESSAGE = 'This is a required field'

export const InputWithLabel: FC<Props> = ({
  label,
  required,
  onChange,
  description,
  value,
  errorMessage = DEFAULT_ERROR_MESSAGE,
  showError = false,
  ...args
}) => {
  const [isInputFormTouched, setIsInputFormTouched] = useState(false)
  const [inputVal, setInputVal] = useState(value)
  const [hasError, setHasError] = useState(showError)

  const handleChange = useCallback(
    e => {
      const newValue = e.target.value
      if (newValue !== inputVal) {
        setIsInputFormTouched(true)
      }

      setInputVal(newValue)
      onChange && onChange(e)
    },
    [inputVal, onChange]
  )

  useEffect(() => {
    if (!isInputFormTouched || !!inputVal) {
      setHasError(false)
      return
    }

    required && setHasError(true)
  }, [inputVal, isInputFormTouched, required])

  useEffect(() => {
    if (showError) {
      setHasError(showError)
    }
  }, [showError])

  const inputStyle = {}
  if (required && hasError) {
    inputStyle['borderColor'] = '#DC4E58'
  }

  return (
    <FlexBox
      alignItems={AlignItems.FlexStart}
      justifyContent={JustifyContent.Center}
      direction={FlexDirection.Column}
      stretchToFitWidth={true}
      className="inputwithlabel-label"
    >
      <Form.Element
        htmlFor={label}
        label={label}
        required={required}
        errorMessage={required && hasError && errorMessage}
      >
        {description && (
          <InputLabel
            className="inputwithlabel-description"
            size={ComponentSize.Small}
          >
            {description}
          </InputLabel>
        )}
        <Input
          size={ComponentSize.Medium}
          onChange={handleChange}
          value={inputVal}
          {...args}
          inputStyle={inputStyle}
        />
      </Form.Element>
      {!(required && hasError) && <div className="error-field-hack" />}
    </FlexBox>
  )
}
