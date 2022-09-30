// Libraries
import React, {FC, useState, useEffect} from 'react'

// Components
import {
  Grid,
  Form,
  Dropdown,
  IconFont,
  Icon,
  Heading,
  HeadingElement,
  FontWeight,
  AlignItems,
  ComponentSize,
  FlexDirection,
  FlexBox,
  InputLabel,
  SlideToggle,
} from '@influxdata/clockface'
import StringPatternInput from 'src/writeData/subscriptions/components/StringPatternInput'

// Types
import {Subscription, PrecisionTypes} from 'src/types/subscriptions'

// Utils
import {
  handleRegexValidation,
  handleValidation,
  REGEX_TOOLTIP,
} from 'src/writeData/subscriptions/utils/form'

// Styles
import 'src/writeData/subscriptions/components/StringParsingForm.scss'
import {event} from 'src/cloud/utils/reporting'
import {ComponentStatus} from '@influxdata/clockface'
import ValidationInputWithTooltip from './ValidationInputWithTooltip'

interface Props {
  formContent: Subscription
  updateForm: (any) => void
  edit: boolean
}

const StringParsingForm: FC<Props> = ({formContent, updateForm, edit}) => {
  const ruleList = ['field', 'tag']
  const [rule, setRule] = useState('')
  const [useStaticMeasurement, setUseStaticMeasurement] = useState(
    !!formContent.stringMeasurement.name
  )
  const defaultStringFieldTag = {
    name: '',
    pattern: '',
  }
  useEffect(() => {
    if (rule === 'field') {
      formContent.stringFields = [
        ...formContent.stringFields,
        defaultStringFieldTag,
      ]
    }
    if (rule === 'tag') {
      formContent.stringTags = [
        ...formContent.stringTags,
        defaultStringFieldTag,
      ]
    }
    updateForm({...formContent})
    setRule('')
  }, [rule])
  return (
    <div className="string-parsing-form">
      <Grid.Column>
        {edit && (
          <p className="string-parsing-form__link">
            See our{' '}
            <a
              href="https://docs.influxdata.com/influxdb/cloud/write-data/no-code/load-data/?t=String#define-parsing-rules"
              target="_blank"
              rel="noreferrer"
            >
              parsing documentation
            </a>{' '}
            for examples, or validate your parsing rules using{' '}
            <a href="https://regex101.com/" target="_blank" rel="noreferrer">
              regex 101.
            </a>{' '}
          </p>
        )}
        <Heading
          element={HeadingElement.H3}
          weight={FontWeight.Bold}
          className="string-parsing-form__header"
        >
          Timestamp
        </Heading>
        <FlexBox
          alignItems={AlignItems.FlexStart}
          direction={FlexDirection.Row}
          margin={ComponentSize.Large}
          className="string-parsing-form__container"
        >
          <ValidationInputWithTooltip
            label="Regex Pattern to find Timestamp"
            value={formContent?.stringTimestamp?.pattern}
            required={false}
            validationFunc={() =>
              !!formContent?.stringTimestamp?.pattern
                ? handleRegexValidation(formContent.stringTimestamp.pattern)
                : null
            }
            placeholder="eg.(\d{10})"
            name="timestamp"
            onChange={e => {
              updateForm({
                ...formContent,
                stringTimestamp: {
                  ...formContent.stringTimestamp,
                  pattern: e.target.value,
                },
              })
            }}
            onBlur={() =>
              event(
                'completed form field',
                {
                  formField: 'stringTimestamp.pattern',
                },
                {feature: 'subscriptions'}
              )
            }
            maxLength={255}
            testID="timestamp-string-parsing"
            edit={edit}
            tooltip={REGEX_TOOLTIP}
            width="75%"
          />
          <div className="string-parsing-form__container__dropdown">
            <Form.Label label="Timestamp precision" />
            <Dropdown
              button={(active, onClick) => (
                <Dropdown.Button
                  active={active}
                  onClick={onClick}
                  testID="string-timestamp-precision"
                  status={
                    edit ? ComponentStatus.Default : ComponentStatus.Disabled
                  }
                >
                  {Object.keys(PrecisionTypes).find(
                    k => PrecisionTypes[k] === formContent.timestampPrecision
                  )}
                </Dropdown.Button>
              )}
              menu={onCollapse => (
                <Dropdown.Menu onCollapse={onCollapse}>
                  {Object.keys(PrecisionTypes).map(key => (
                    <Dropdown.Item
                      key={key}
                      id={key}
                      value={key}
                      onClick={() => {
                        event(
                          'completed form field',
                          {
                            formField: 'timestampPrecision',
                            selected: PrecisionTypes[key],
                          },
                          {feature: 'subscriptions'}
                        )
                        formContent.timestampPrecision = PrecisionTypes[key]
                      }}
                      selected={
                        formContent.timestampPrecision === PrecisionTypes[key]
                      }
                      testID={`string-timestamp-precision-${key}`}
                    >
                      {key}
                    </Dropdown.Item>
                  ))}
                </Dropdown.Menu>
              )}
            />
          </div>
        </FlexBox>
      </Grid.Column>
      <Grid.Column>
        <Heading
          element={HeadingElement.H3}
          weight={FontWeight.Bold}
          className="string-parsing-form__header"
        >
          Measurement
        </Heading>
        <FlexBox
          direction={FlexDirection.Row}
          alignItems={AlignItems.Center}
          margin={ComponentSize.Medium}
          className="static-toggle"
        >
          <InputLabel>Regex</InputLabel>
          <SlideToggle
            active={useStaticMeasurement}
            onChange={() => {
              setUseStaticMeasurement(!useStaticMeasurement)
              updateForm({
                ...formContent,
                stringMeasurement: {
                  ...formContent.stringMeasurement,
                  name: '',
                  pattern: '',
                },
              })
            }}
            disabled={!edit}
          />
          <InputLabel>Name</InputLabel>
        </FlexBox>
        {useStaticMeasurement ? (
          <ValidationInputWithTooltip
            label="Name"
            value={formContent.stringMeasurement.name}
            required={true}
            validationFunc={() => {
              return handleValidation(
                'Measurement Name',
                formContent.stringMeasurement.name
              )
            }}
            placeholder="measurement_name"
            name="name"
            onChange={e => {
              updateForm({
                ...formContent,
                stringMeasurement: {
                  ...formContent.stringMeasurement,
                  name: e.target.value,
                },
              })
            }}
            onBlur={() =>
              event(
                'completed form field',
                {
                  formField: 'stringMeasurement.name',
                },
                {feature: 'subscriptions'}
              )
            }
            edit={edit}
            maxLength={255}
            testID="measurment-string-parsing-name"
            tooltip="Provide a static measurement for your messages."
          />
        ) : (
          <ValidationInputWithTooltip
            label="Regex Pattern to find Measurement"
            value={formContent.stringMeasurement.pattern}
            required={true}
            validationFunc={() => {
              const pattern = formContent.stringMeasurement.pattern
              return (
                handleValidation('Pattern', pattern) ??
                handleRegexValidation(pattern)
              )
            }}
            placeholder="eg. a=(\d)"
            name="regex"
            onChange={e => {
              updateForm({
                ...formContent,
                stringMeasurement: {
                  ...formContent.stringMeasurement,
                  pattern: e.target.value,
                },
              })
            }}
            onBlur={() =>
              event(
                'completed form field',
                {
                  formField: 'stringMeasurement.pattern',
                },
                {feature: 'subscriptions'}
              )
            }
            edit={edit}
            maxLength={255}
            testID="measurment-string-parsing-pattern"
            tooltip={REGEX_TOOLTIP}
          />
        )}
        <div className="line"></div>
      </Grid.Column>
      {formContent.stringTags.map((_, key) => (
        <StringPatternInput
          key={key}
          name="Tag"
          formContent={formContent}
          updateForm={updateForm}
          itemNum={key}
          edit={edit}
        />
      ))}
      {formContent.stringFields.map((_, key) => (
        <StringPatternInput
          key={key}
          formContent={formContent}
          updateForm={updateForm}
          name="Field"
          itemNum={key}
          edit={edit}
        />
      ))}
      <Grid.Column>
        <Dropdown
          button={(active, onClick) => (
            <Dropdown.Button
              active={active}
              onClick={onClick}
              testID="string-parsing-add-rule"
              status={edit ? ComponentStatus.Default : ComponentStatus.Disabled}
            >
              <Icon glyph={IconFont.Plus_New} /> Add Rule
            </Dropdown.Button>
          )}
          menu={onCollapse => (
            <Dropdown.Menu onCollapse={onCollapse}>
              {ruleList.map((r, key) => (
                <Dropdown.Item
                  key={key}
                  id={r}
                  value={r}
                  onClick={() => {
                    event(
                      'added string parsing rule',
                      {ruleType: r},
                      {feature: 'subscriptions'}
                    )
                    setRule(r)
                  }}
                  selected={rule === r}
                  testID={`string-parsing-add-rule-${key}`}
                >
                  {r}
                </Dropdown.Item>
              ))}
            </Dropdown.Menu>
          )}
        />
      </Grid.Column>
      {/* For a later iteration */}
      {/* <Grid.Column>
        <h2 className="form-header">Validate your Parsing Rules</h2>
        <TextArea
          name="validate"
          value={string}
          placeholder={
            'Enter a string snippet of your data to verify that your regex parsing rules correctly apply.'
          }
          onChange={e => {
            setString(e.target.value)
          }}
          style={{height: '146px', minHeight: '146px'}}
          ref={null}
          maxLength={255}
          testID="json-validate"
        />
      </Grid.Column> */}
    </div>
  )
}

export default StringParsingForm
