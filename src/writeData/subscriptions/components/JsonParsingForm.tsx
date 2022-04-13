// Libraries
import React, {FC, useState, useEffect} from 'react'

// Components
import {
  Input,
  Grid,
  Form,
  InputType,
  Dropdown,
  Icon,
  IconFont,
  Heading,
  HeadingElement,
  FontWeight,
  AlignItems,
  ComponentSize,
  FlexDirection,
  FlexBox,
} from '@influxdata/clockface'
import JsonPathInput from 'src/writeData/subscriptions/components/JsonPathInput'

// Types
import {Subscription} from 'src/types/subscriptions'

// Utils
import {handleValidation} from 'src/writeData/subscriptions/utils/form'

// Styles
import 'src/writeData/subscriptions/components/JsonParsingForm.scss'
import {event} from 'src/cloud/utils/reporting'

interface Props {
  formContent: Subscription
  updateForm: (any) => void
}

const JsonParsingForm: FC<Props> = ({formContent, updateForm}) => {
  const stringType = 'String'
  const numberType = 'Number'
  const dataTypeList = [stringType, numberType]
  const [dataTypeM, setDataTypeM] = useState(stringType)
  const ruleList = ['field', 'tag']
  const [rule, setRule] = useState('')
  const defaultJsonFieldTag = {
    name: '',
    path: '',
    type: 'string',
  }
  useEffect(() => {
    if (rule === 'field') {
      formContent.jsonFieldKeys = [
        ...formContent.jsonFieldKeys,
        defaultJsonFieldTag,
      ]
    }
    if (rule === 'tag') {
      formContent.jsonTagKeys = [
        ...formContent.jsonTagKeys,
        defaultJsonFieldTag,
      ]
    }
    updateForm({...formContent})
    setRule('')
  }, [rule])
  return (
    <div className="json-parsing-form">
      <Grid.Column>
        <Form.Label label="JSON Path to Timestamp" />
        <Input
          type={InputType.Text}
          placeholder="eg. $.myJSON.myObject[0].timestampKey"
          name="timestamp"
          autoFocus={true}
          value={
            formContent.jsonTimestamp && formContent.jsonTimestamp.path
              ? formContent.jsonTimestamp.path
              : ''
          }
          onChange={e => {
            formContent.jsonTimestamp.path = e.target.value
            updateForm({...formContent})
          }}
          onBlur={() =>
            event(
              'completed form field',
              {formField: 'jsonTimestamp.path'},
              {feature: 'subscriptions'}
            )
          }
          testID="timestamp-json-parsing"
        />
      </Grid.Column>
      <Grid.Column>
        <FlexBox
          alignItems={AlignItems.Center}
          direction={FlexDirection.Row}
          margin={ComponentSize.Large}
          className="json-parsing-form__header-wrap"
        >
          <Heading
            element={HeadingElement.H3}
            weight={FontWeight.Bold}
            className="json-parsing-form__header-wrap__header"
          >
            Measurement
          </Heading>
        </FlexBox>
        <FlexBox
          alignItems={AlignItems.FlexStart}
          direction={FlexDirection.Row}
          margin={ComponentSize.Large}
          className="json-parsing-form__container"
        >
          <Form.ValidationElement
            label="Name"
            value={formContent.jsonMeasurementKey.name}
            required={true}
            validationFunc={() =>
              handleValidation(
                'Measurement Name',
                formContent.jsonMeasurementKey.name
              )
            }
          >
            {status => (
              <Input
                type={InputType.Text}
                placeholder="nonDescriptName"
                name="name"
                autoFocus={true}
                value={formContent.jsonMeasurementKey.name}
                onChange={e => {
                  formContent.jsonMeasurementKey.name = e.target.value
                  updateForm({...formContent})
                }}
                onBlur={() =>
                  event(
                    'completed form field',
                    {formField: 'jsonMeasurementKey.name'},
                    {feature: 'subscriptions'}
                  )
                }
                status={status}
                testID="measurement-json-parsing-name"
              />
            )}
          </Form.ValidationElement>
          <div className="json-parsing-form__container__dropdown">
            <Form.Label label="Data Type" />
            <Dropdown
              button={(active, onClick) => (
                <Dropdown.Button
                  active={active}
                  onClick={onClick}
                  testID="measurement-json-parsing-type"
                >
                  {dataTypeM}
                </Dropdown.Button>
              )}
              menu={onCollapse => (
                <Dropdown.Menu onCollapse={onCollapse}>
                  {dataTypeList.map((d, key) => (
                    <Dropdown.Item
                      key={key}
                      id={d}
                      value={d}
                      onClick={() => {
                        event(
                          'completed form field',
                          {formField: 'jsonMeasurementKey.type', selected: d},
                          {feature: 'subscriptions'}
                        )
                        setDataTypeM(d)
                        formContent.jsonMeasurementKey.type = d.toLowerCase()
                      }}
                      selected={dataTypeM === d}
                      testID={`measurement-json-parsing-type-${key}`}
                    >
                      {d}
                    </Dropdown.Item>
                  ))}
                </Dropdown.Menu>
              )}
            />
          </div>
        </FlexBox>
      </Grid.Column>
      <Grid.Column>
        <Form.ValidationElement
          label="JSON Path"
          value={formContent.jsonMeasurementKey.path}
          required={true}
          validationFunc={() =>
            handleValidation(
              'Measurement Path',
              formContent.jsonMeasurementKey.path
            )
          }
        >
          {status => (
            <Input
              type={InputType.Text}
              placeholder="eg. $.myJSON.myObject[0].myKey"
              name="jsonpath"
              autoFocus={true}
              value={formContent.jsonMeasurementKey.path}
              onChange={e => {
                formContent.jsonMeasurementKey.path = e.target.value
                updateForm({...formContent})
              }}
              onBlur={() =>
                event(
                  'completed form field',
                  {formField: 'jsonMeasurementKey.path'},
                  {feature: 'subscriptions'}
                )
              }
              status={status}
              testID="measurement-json-parsing-path"
            />
          )}
        </Form.ValidationElement>
        <div className="line"></div>
      </Grid.Column>
      {formContent.jsonTagKeys.map((_, key) => (
        <JsonPathInput
          key={key}
          updateForm={updateForm}
          formContent={formContent}
          name="Tag"
          itemNum={key}
        />
      ))}
      {formContent.jsonFieldKeys.map((_, key) => (
        <JsonPathInput
          key={key}
          updateForm={updateForm}
          formContent={formContent}
          name="Field"
          itemNum={key}
        />
      ))}
      <Grid.Column>
        <Dropdown
          button={(active, onClick) => (
            <Dropdown.Button
              active={active}
              onClick={onClick}
              testID="json-parsing-add-rule"
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
                      'added json parsing rule',
                      {ruleType: r},
                      {feature: 'subscriptions'}
                    )
                    setRule(r)
                  }}
                  selected={rule === r}
                  testID={`json-parsing-add-rule-${key}`}
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
          value={json}
          placeholder={
            'Enter a JSON object to verify that your parsing rules are finding the correct keys.'
          }
          onChange={e => {
            setJson(e.target.value)
          }}
          style={{height: '146px', minHeight: '146px'}}
          ref={null}
          testID="json-validate"
        />
      </Grid.Column> */}
    </div>
  )
}
export default JsonParsingForm
