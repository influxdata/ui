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
import {ComponentStatus} from 'src/clockface'
import ValidationInputWithTooltip from './ValidationInputWithTooltip'

interface Props {
  formContent: Subscription
  updateForm: (any) => void
  edit: boolean
}

const StringParsingForm: FC<Props> = ({formContent, updateForm, edit}) => {
  const ruleList = ['field', 'tag']
  const [rule, setRule] = useState('')
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
        <FlexBox
          alignItems={AlignItems.FlexStart}
          direction={FlexDirection.Row}
          margin={ComponentSize.Large}
          className="string-parsing-form__container"
        >
          <ValidationInputWithTooltip
            label="Regex Pattern to find Timestamp"
            value={formContent.stringTimestamp.pattern}
            required={false}
            validationFunc={() =>
              !!formContent.stringTimestamp.pattern
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
                  {formContent.timestampPrecision}
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
                      {PrecisionTypes[key]}
                    </Dropdown.Item>
                  ))}
                </Dropdown.Menu>
              )}
            />
          </div>
        </FlexBox>
      </Grid.Column>
      <Grid.Column>
        <FlexBox
          alignItems={AlignItems.Center}
          direction={FlexDirection.Row}
          margin={ComponentSize.Medium}
          className="string-parsing-form__header-wrap"
        >
          <Heading
            element={HeadingElement.H3}
            weight={FontWeight.Bold}
            className="string-parsing-form__section__header-wrap__header"
          >
            Measurement
          </Heading>
        </FlexBox>
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
              <Icon glyph={IconFont.Plus} /> Add Rule
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
