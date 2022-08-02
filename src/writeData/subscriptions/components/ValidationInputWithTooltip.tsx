// Libraries
import React, {FC} from 'react'

// Components
import {
  Input,
  Form,
  InputType,
  ComponentSize,
  ComponentStatus,
  InputLabel,
  QuestionMarkTooltip,
} from '@influxdata/clockface'

// Styles
import 'src/writeData/subscriptions/components/ValidationInputWithTooltip.scss'

interface Props {
  label: string
  name: string
  value: string
  required: boolean
  tooltip: string
  placeholder: string
  maxLength?: number
  edit: boolean
  validationFunc: Function
  onChange: Function
  onBlur: Function
  testID: string
  width?: string
}

const ValidationInputWithTooltip: FC<Props> = ({
  label,
  value,
  required,
  tooltip,
  placeholder,
  name,
  maxLength,
  edit,
  validationFunc,
  onChange,
  onBlur,
  testID,
  width,
}) => (
  <div style={{width: width ?? '100%'}}>
    <InputLabel size={ComponentSize.Medium}>{label}</InputLabel>
    {required && (
      <InputLabel className="required-indicator" size={ComponentSize.Large}>
        *
      </InputLabel>
    )}
    <QuestionMarkTooltip
      className="validation-tooltip"
      tooltipContents={tooltip}
      diameter={14}
    />
    <Form.ValidationElement
      label=""
      value={value}
      required={required}
      validationFunc={() => validationFunc()}
    >
      {status => (
        <div>
          <Input
            className="validation-input"
            type={InputType.Text}
            placeholder={placeholder}
            name={name}
            autoFocus={true}
            value={value}
            onChange={e => onChange(e)}
            onBlur={e => onBlur(e)}
            status={edit ? status : ComponentStatus.Disabled}
            maxLength={maxLength}
            testID={testID}
          />
        </div>
      )}
    </Form.ValidationElement>
  </div>
)

export default ValidationInputWithTooltip
