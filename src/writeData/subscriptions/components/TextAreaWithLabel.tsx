import React, {FC} from 'react'
import {
  AlignItems,
  ComponentSize,
  FlexBox,
  FlexDirection,
  InputLabel,
  JustifyContent,
  TextArea,
  TextAreaProps,
} from '@influxdata/clockface'

// Style
import 'src/writeData/subscriptions/components/TextAreaWithLabel.scss'

interface OwnProps {
  label: string
  description?: string
}

type Props = OwnProps & TextAreaProps

const TextAreaWithLabel: FC<Props> = ({
  label,
  description,
  value,
  required,
  onChange,
  rows,
  ...args
}) => {
  return (
    <FlexBox
      alignItems={AlignItems.FlexStart}
      justifyContent={JustifyContent.Center}
      direction={FlexDirection.Column}
      margin={ComponentSize.Large}
      stretchToFitWidth={true}
    >
      <div className="textareawithlabel-label">
        <InputLabel className="label" size={ComponentSize.Medium}>
          {label}
        </InputLabel>
        {required && <span className="required">*</span>}
      </div>
      {!!description && (
        <InputLabel
          className="textareawithlabel-description"
          size={ComponentSize.Small}
        >
          {description}
        </InputLabel>
      )}
      <TextArea
        size={ComponentSize.Medium}
        required={required}
        onChange={onChange}
        value={value}
        rows={rows}
        {...args}
      />
    </FlexBox>
  )
}

export default TextAreaWithLabel
