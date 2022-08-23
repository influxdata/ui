import React, {FC} from 'react'
import {
  AlignItems,
  ComponentSize,
  FlexBox,
  FlexDirection,
  Form,
  InputLabel,
  JustifyContent,
  TextArea,
  TextAreaProps,
  ValidationFunction,
} from '@influxdata/clockface'

// Style
import 'src/writeData/subscriptions/components/TextAreaWithLabel.scss'
import {handleValidation} from 'src/writeData/subscriptions/utils/form'

interface OwnProps {
  description?: string
  label: string
  validationFunc?: ValidationFunction
}

type Props = OwnProps & TextAreaProps

const DEFAULT_VALIDATION_FUNC: ValidationFunction = _ => ''

const TextAreaWithLabel: FC<Props> = ({
  label,
  description,
  value,
  onChange,
  rows,
  required = false,
  ...args
}) => {
  let validationFunc = DEFAULT_VALIDATION_FUNC
  if (required) {
    validationFunc = v => {
      return handleValidation(label, v)
    }
  }

  return (
    <FlexBox
      alignItems={AlignItems.FlexStart}
      justifyContent={JustifyContent.Center}
      direction={FlexDirection.Column}
      margin={ComponentSize.Large}
      stretchToFitWidth={true}
      className="textareawithlabel-label"
    >
      <Form.ValidationElement
        label={label}
        value={value}
        required={required}
        validationFunc={validationFunc}
        prevalidate={false}
      >
        {status => (
          <>
            {description && (
              <InputLabel
                className="textareawithlabel-description"
                size={ComponentSize.Small}
              >
                {description}
              </InputLabel>
            )}
            <TextArea
              size={ComponentSize.Medium}
              status={status}
              onChange={onChange}
              value={value}
              rows={rows}
              {...args}
            />
          </>
        )}
      </Form.ValidationElement>
    </FlexBox>
  )
}

export default TextAreaWithLabel
