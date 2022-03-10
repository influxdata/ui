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
} from '@influxdata/clockface'
import JsonPathInput from 'src/writeData/subscriptions/components/JsonPathInput'

// Styles
import 'src/writeData/subscriptions/components/JsonParsingForm.scss'

// Types
import {Subscription} from 'src/types/subscriptions'

// Utils
import {handleValidation} from 'src/writeData/subscriptions/utils/form'

interface Props {
  formContent: Subscription
  updateForm: (any) => void
}

const JsonParsingForm: FC<Props> = ({formContent, updateForm}) => {
  const [form, setForm] = useState(formContent)
  const stringType = 'String'
  const numberType = 'Number'
  const dataTypeList = [stringType, numberType]
  const [dataTypeM, setDataTypeM] = useState(stringType)
  const [firstRender, setRender] = useState(false)
  useEffect(() => {
    updateForm(form)
  }, [form])
  useEffect(() => {
    setRender(true)
  }, [])
  const ruleList = ['field', 'tag']
  const [rule, setRule] = useState('')
  useEffect(() => {
    if (rule === 'field') {
      form.jsonFieldKeys = [
        ...form.jsonFieldKeys,
        {
          name: '',
          path: '',
          type: 'string',
        },
      ]
    }
    if (rule === 'tag') {
      form.jsonTagKeys = [
        ...form.jsonTagKeys,
        {
          name: '',
          path: '',
          type: 'string',
        },
      ]
    }
    setForm({...form})
    setRule('')
  }, [rule])
  return (
    <div className="json-parsing-form">
      <Grid.Column>
        <Form.Label label="JSON Path to Timestamp" />
        <Input
          type={InputType.Text}
          placeholder="eg. myJSON.myObject[0].timestampKey"
          name="timestamp"
          autoFocus={true}
          value={form.jsonTimestamp.path}
          onChange={e => {
            form.jsonTimestamp.path = e.target.value
            setForm({...formContent})
          }}
          maxLength={16}
          testID="json-parsing--timestamp"
        />
      </Grid.Column>
      <Grid.Column>
        <div className="section">
          <div className="header-wrap">
            <h2 className="form-header">Measurement</h2>
          </div>
          <div className="container">
            <Form.ValidationElement
              label="Name"
              value={form.jsonMeasurementKey.name}
              required={true}
              validationFunc={() =>
                !firstRender &&
                handleValidation(
                  'Measurement Name',
                  form.jsonMeasurementKey.name
                )
              }
            >
              {status => (
                <Input
                  type={InputType.Text}
                  placeholder="nonDescriptName"
                  name="name"
                  autoFocus={true}
                  value={form.jsonMeasurementKey.name}
                  onChange={e => {
                    setRender(false)
                    form.jsonMeasurementKey.name = e.target.value
                    setForm({...formContent})
                  }}
                  status={status}
                  maxLength={16}
                  testID="json-parsing--name"
                />
              )}
            </Form.ValidationElement>
            <div className="dropdown-container">
              <Form.Label label="Data Type" />
              <Dropdown
                button={(active, onClick) => (
                  <Dropdown.Button
                    active={active}
                    onClick={onClick}
                    testID="variable-type-dropdown--button"
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
                          setDataTypeM(d)
                          form.jsonMeasurementKey.type = d
                        }}
                        selected={dataTypeM === d}
                        testID={`variable-type-dropdown-${1}`}
                      >
                        {d}
                      </Dropdown.Item>
                    ))}
                  </Dropdown.Menu>
                )}
              />
            </div>
          </div>
        </div>
      </Grid.Column>
      <Grid.Column>
        <Form.ValidationElement
          label="JSON Path"
          value={form.jsonMeasurementKey.path}
          required={true}
          validationFunc={() =>
            !firstRender &&
            handleValidation('Measurement Path', form.jsonMeasurementKey.path)
          }
        >
          {status => (
            <Input
              type={InputType.Text}
              placeholder="eg. myJSON.myObject[0].myKey"
              name="jsonpath"
              autoFocus={true}
              value={form.jsonMeasurementKey.path}
              onChange={e => {
                setRender(false)
                form.jsonMeasurementKey.path = e.target.value
                setForm({...formContent})
              }}
              status={status}
              maxLength={16}
              testID="json-parsing--jsonpath"
            />
          )}
        </Form.ValidationElement>
        <div className="line"></div>
      </Grid.Column>
      {form.jsonTagKeys.map((_, key) => (
        <JsonPathInput
          key={key}
          setForm={setForm}
          form={form}
          name="Tag"
          firstRender={firstRender}
          setRender={setRender}
          itemNum={key}
        />
      ))}
      {form.jsonFieldKeys.map((_, key) => (
        <JsonPathInput
          key={key}
          setForm={setForm}
          form={form}
          name="Field"
          firstRender={firstRender}
          setRender={setRender}
          itemNum={key}
        />
      ))}
      <Grid.Column>
        <Dropdown
          button={(active, onClick) => (
            <Dropdown.Button
              active={active}
              onClick={onClick}
              testID="variable-type-dropdown--button"
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
                    setRule(r)
                  }}
                  selected={rule === r}
                  testID={`variable-type-dropdown-${1}`}
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
          maxLength={255}
          testID="json-validate"
        />
      </Grid.Column> */}
    </div>
  )
}
export default JsonParsingForm
