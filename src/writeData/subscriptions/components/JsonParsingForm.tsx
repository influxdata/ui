// Libraries
import React, {FC, useState, useEffect} from 'react'

// Components
import {
  Grid,
  Form,
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
  ComponentStatus,
  SlideToggle,
  InputLabel,
} from '@influxdata/clockface'
import JsonPathInput from 'src/writeData/subscriptions/components/JsonPathInput'

// Types
import {Subscription, PrecisionTypes} from 'src/types/subscriptions'

// Utils
import {
  sanitizeType,
  handleValidation,
  handleJsonPathValidation,
  JSON_TOOLTIP,
  dataTypeList,
} from 'src/writeData/subscriptions/utils/form'
import {event} from 'src/cloud/utils/reporting'

// Styles
import 'src/writeData/subscriptions/components/JsonParsingForm.scss'
import ValidationInputWithTooltip from './ValidationInputWithTooltip'

interface Props {
  formContent: Subscription
  updateForm: (any) => void
  edit: boolean
}

const JsonParsingForm: FC<Props> = ({formContent, updateForm, edit}) => {
  const [dataTypeM, setDataTypeM] = useState(dataTypeList[0])
  const [useStaticMeasurement, setUseStaticMeasurement] = useState(
    !!formContent.jsonMeasurementKey.name
  )
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
        {edit && (
          <p className="json-parsing-form__link">
            See our{' '}
            <a
              href="https://docs.influxdata.com/influxdb/cloud/write-data/no-code/load-data/?t=JSON#define-parsing-rules"
              target="_blank"
              rel="noreferrer"
            >
              parsing documentation
            </a>{' '}
            for examples, or validate your parsing rules using{' '}
            <a href="https://jsonpath.com/" target="_blank" rel="noreferrer">
              JSONPath.
            </a>{' '}
          </p>
        )}
        <Heading
          element={HeadingElement.H3}
          weight={FontWeight.Bold}
          className="json-parsing-form__header"
        >
          Timestamp
        </Heading>
        <FlexBox
          alignItems={AlignItems.FlexStart}
          direction={FlexDirection.Row}
          margin={ComponentSize.Large}
          className="json-parsing-form__container"
        >
          <ValidationInputWithTooltip
            label="JSON Path to Timestamp"
            value={formContent.jsonTimestamp?.path}
            required={false}
            validationFunc={() =>
              !!formContent.jsonTimestamp?.path
                ? handleJsonPathValidation(formContent.jsonTimestamp?.path)
                : null
            }
            placeholder="eg. $.myJSON.myObject[0].timestampKey"
            name="timestamp"
            onChange={e => {
              updateForm({
                ...formContent,
                jsonTimestamp: {
                  ...formContent.jsonTimestamp,
                  path: e.target.value,
                },
              })
            }}
            onBlur={() =>
              event(
                'completed form field',
                {formField: 'jsonTimestamp.path'},
                {feature: 'subscriptions'}
              )
            }
            testID="timestamp-json-parsing"
            edit={edit}
            tooltip={JSON_TOOLTIP}
            width="75%"
          />
          <div className="json-parsing-form__container__dropdown">
            <Form.Label label="Timestamp precision" />
            <Dropdown
              button={(active, onClick) => (
                <Dropdown.Button
                  active={active}
                  onClick={onClick}
                  testID="json-timestamp-precision"
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
                      testID={`json-timestamp-precision-${key}`}
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
        <Heading
          element={HeadingElement.H3}
          weight={FontWeight.Bold}
          className="json-parsing-form__header"
        >
          Measurement
        </Heading>
        <FlexBox
          direction={FlexDirection.Row}
          alignItems={AlignItems.Center}
          margin={ComponentSize.Medium}
          className="static-toggle"
        >
          <InputLabel>JSON Path</InputLabel>
          <SlideToggle
            active={useStaticMeasurement}
            onChange={() => {
              setUseStaticMeasurement(!useStaticMeasurement)
              updateForm({
                ...formContent,
                jsonMeasurementKey: {
                  ...formContent.jsonMeasurementKey,
                  name: '',
                  path: '',
                },
              })
            }}
            disabled={!edit}
          />
          <InputLabel>Name</InputLabel>
        </FlexBox>
        <FlexBox
          alignItems={AlignItems.FlexStart}
          direction={FlexDirection.Row}
          margin={ComponentSize.Large}
          className="json-parsing-form__container"
        >
          {useStaticMeasurement ? (
            <ValidationInputWithTooltip
              label="Name"
              value={formContent.jsonMeasurementKey.name}
              required={true}
              validationFunc={() => {
                return handleValidation(
                  'Measurement Name',
                  formContent.jsonMeasurementKey.name
                )
              }}
              placeholder="nonDescriptName"
              name="name"
              onChange={e => {
                updateForm({
                  ...formContent,
                  jsonMeasurementKey: {
                    ...formContent.jsonMeasurementKey,
                    name: e.target.value,
                  },
                })
              }}
              onBlur={() =>
                event(
                  'completed form field',
                  {formField: 'jsonMeasurementKey.name'},
                  {feature: 'subscriptions'}
                )
              }
              edit={edit}
              testID="measurement-json-parsing-name"
              tooltip="Provide a static measurement for your messages."
              width="75%"
            />
          ) : (
            <ValidationInputWithTooltip
              label="JSON Path"
              value={formContent.jsonMeasurementKey.path}
              required={true}
              validationFunc={() => {
                const path = formContent.jsonMeasurementKey.path
                return (
                  handleValidation('Measurement Path', path) ??
                  handleJsonPathValidation(path)
                )
              }}
              placeholder="eg. $.myJSON.myObject[0].myKey"
              name="jsonpath"
              onChange={e => {
                updateForm({
                  ...formContent,
                  jsonMeasurementKey: {
                    ...formContent.jsonMeasurementKey,
                    path: e.target.value,
                  },
                })
              }}
              onBlur={() =>
                event(
                  'completed form field',
                  {formField: 'jsonMeasurementKey.path'},
                  {feature: 'subscriptions'}
                )
              }
              edit={edit}
              testID="measurement-json-parsing-path"
              tooltip={JSON_TOOLTIP}
              width="75%"
            />
          )}
          <div className="json-parsing-form__container__dropdown">
            <Form.Label label="Data Type" />
            <Dropdown
              button={(active, onClick) => (
                <Dropdown.Button
                  active={active}
                  onClick={onClick}
                  testID="measurement-json-parsing-type"
                  status={
                    edit && !useStaticMeasurement
                      ? ComponentStatus.Default
                      : ComponentStatus.Disabled
                  }
                >
                  {sanitizeType(formContent.jsonMeasurementKey.type) ??
                    dataTypeM}
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
        <div className="line"></div>
      </Grid.Column>
      {formContent.jsonTagKeys.map((_, key) => (
        <JsonPathInput
          key={key}
          updateForm={updateForm}
          formContent={formContent}
          name="Tag"
          itemNum={key}
          edit={edit}
        />
      ))}
      {formContent.jsonFieldKeys.map((_, key) => (
        <JsonPathInput
          key={key}
          updateForm={updateForm}
          formContent={formContent}
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
              testID="json-parsing-add-rule"
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
