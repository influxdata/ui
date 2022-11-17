import React, {FC, useCallback, useEffect, useState} from 'react'
import {
  AlignItems,
  ComponentSize,
  ComponentStatus,
  FlexBox,
  FlexDirection,
  Form,
  FormElementProps,
  Input,
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
    if (!isInputFormTouched || Boolean(inputVal)) {
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
        className="inputwithlabel-element"
      >
        {description && (
          <Form.HelpText
            text={description}
            className="inputwithlabel-description"
          />
        )}
        <Input
          size={ComponentSize.Medium}
          onChange={handleChange}
          value={inputVal}
          {...args}
          status={
            required && hasError
              ? ComponentStatus.Error
              : ComponentStatus.Default
          }
        />
      </Form.Element>
      {!(required && hasError) && <div className="error-field-hack" />}
    </FlexBox>
  )
}
