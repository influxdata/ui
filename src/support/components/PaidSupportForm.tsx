import React, {FC, ChangeEvent} from 'react'

// Components
import {
  DropdownItemType,
  Form,
  Icon,
  IconFont,
  Input,
  QuestionMarkTooltip,
  SelectDropdown,
  TextArea,
} from '@influxdata/clockface'
import {SafeBlankLink} from 'src/utils/SafeBlankLink'

interface Props {
  subject: string
  severity: string
  description: string
  onSubjectChange: (event: ChangeEvent<HTMLInputElement>) => void
  onSeverityChange: (severity: string) => void
  onDescriptionChange: (event: ChangeEvent<HTMLTextAreaElement>) => void
  onValidation: (value: string) => string | null
}

const severityLevel = [
  '1 - Critical',
  '2 - High',
  '3 - Standard',
  '4 - Request',
]

const severityTip = (): JSX.Element => {
  const tooltipContent = (
    <div>
      Please refer to our severity levels in our
      <SafeBlankLink href="https://www.influxdata.com/legal/support-policy">
        {' '}
        support policy{' '}
      </SafeBlankLink>
      website
    </div>
  )
  return (
    <QuestionMarkTooltip
      diameter={14}
      tooltipContents={tooltipContent}
      tooltipStyle={{fontSize: '13px'}}
    />
  )
}

export const PaidSupportForm: FC<Props> = ({
  subject,
  severity,
  description,
  onSubjectChange,
  onSeverityChange,
  onDescriptionChange,
  onValidation,
}) => {
  return (
    <>
      <p className="status-page-text">
        <span>
          {' '}
          <Icon glyph={IconFont.Info_New} />{' '}
        </span>
        Check our{' '}
        <SafeBlankLink href="https://status.influxdata.com">
          status page
        </SafeBlankLink>{' '}
        to see if there is an outage impacting your region.
      </p>
      <Form.Element label="Subject" required={true}>
        <Input
          name="subject"
          value={subject}
          onChange={onSubjectChange}
          testID="contact-support-subject-input"
        />
      </Form.Element>
      <Form.Element label="Severity" required={true} labelAddOn={severityTip}>
        <SelectDropdown
          options={severityLevel}
          selectedOption={severity}
          onSelect={onSeverityChange}
          indicator={DropdownItemType.None}
          testID="severity-level-dropdown"
        />
      </Form.Element>
      <Form.ValidationElement
        label="Description"
        required={true}
        value={description}
        validationFunc={onValidation}
      >
        {status => (
          <TextArea
            status={status}
            rows={10}
            testID="contact-support-description--textarea"
            name="description"
            value={description}
            onChange={onDescriptionChange}
          />
        )}
      </Form.ValidationElement>
    </>
  )
}
