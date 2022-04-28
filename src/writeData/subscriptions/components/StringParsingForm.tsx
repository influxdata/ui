// Libraries
import React, {FC, useState, useEffect} from 'react'

// Components
import {
  Input,
  Grid,
  Form,
  InputType,
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
import {Subscription} from 'src/types/subscriptions'

// Utils
import {handleValidation} from 'src/writeData/subscriptions/utils/form'

// Styles
import 'src/writeData/subscriptions/components/StringParsingForm.scss'
import {event} from 'src/cloud/utils/reporting'
import {ComponentStatus} from 'src/clockface'

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
        <Form.Label label="Regex to find Timestamp" />
        <Input
          type={InputType.Text}
          placeholder="eg. regexExample"
          name="timestamp"
          autoFocus={true}
          value={formContent.stringTimestamp.pattern}
          onChange={e => {
            formContent.stringTimestamp.pattern = e.target.value
            updateForm({...formContent})
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
          status={edit ? ComponentStatus.Default : ComponentStatus.Disabled}
        />
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
        <Form.ValidationElement
          label="Regex Pattern to find Measurement"
          value={formContent.stringMeasurement.pattern}
          required={true}
          validationFunc={() =>
            handleValidation('Pattern', formContent.stringMeasurement.pattern)
          }
        >
          {status => (
            <Input
              type={InputType.Text}
              placeholder="eg. a=(\\d)"
              name="regex"
              autoFocus={true}
              value={formContent.stringMeasurement.pattern}
              onChange={e => {
                formContent.stringMeasurement.pattern = e.target.value
                updateForm({...formContent})
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
              status={edit ? status : ComponentStatus.Disabled}
              maxLength={255}
              testID="measurment-string-parsing-pattern"
            />
          )}
        </Form.ValidationElement>
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
