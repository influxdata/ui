// Libraries
import React, {FC, useState, useEffect} from 'react'

// Components
import {
  Input,
  Grid,
  Form,
  InputType,
  Dropdown,
  Button,
  ComponentColor,
  ButtonType,
  TextArea,
} from '@influxdata/clockface'

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
  const [dataTypeF, setDataTypeF] = useState(stringType)
  const [dataTypeT, setDataTypeT] = useState(stringType)
  useEffect(() => {
    updateForm(form)
  }, [form])
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
          <h2 className="form-header">Measurement</h2>
          <Form.ValidationElement
            label="Name"
            value={form.jsonMeasurementKey.name}
            required={true}
            validationFunc={() =>
              handleValidation('Measurement Name', form.jsonMeasurementKey.name)
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
                  form.jsonMeasurementKey.name = e.target.value
                  setForm({...formContent})
                }}
                status={status}
                maxLength={16}
                testID="json-parsing--name"
              />
            )}
          </Form.ValidationElement>
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
      </Grid.Column>
      <Grid.Column>
        <Form.ValidationElement
          label="JSON Path"
          value={form.jsonMeasurementKey.path}
          required={true}
          validationFunc={() =>
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
      <Grid.Column>
        <div className="section">
          <h2 className="form-header">Tag</h2>
          <Form.ValidationElement
            label="Name"
            value={form.jsonTagKeys[0].name}
            validationFunc={() =>
              handleValidation('Measurement Path', form.jsonTagKeys[0].name)
            }
          >
            {status => (
              <Input
                type={InputType.Text}
                placeholder="nonDescriptName"
                name="name"
                autoFocus={true}
                value={form.jsonTagKeys[0].name}
                onChange={e => {
                  form.jsonTagKeys[0].name = e.target.value
                  setForm({...formContent})
                }}
                status={status}
                maxLength={16}
                testID="json-parsing--name"
              />
            )}
          </Form.ValidationElement>
          <Form.Label label="Data Type" />
          <Dropdown
            button={(active, onClick) => (
              <Dropdown.Button
                active={active}
                onClick={onClick}
                testID="variable-type-dropdown--button"
              >
                {dataTypeT}
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
                      setDataTypeT(d)
                      form.jsonTagKeys[0].type = d
                    }}
                    selected={dataTypeT === d}
                    testID={`variable-type-dropdown-${1}`}
                  >
                    {d}
                  </Dropdown.Item>
                ))}
              </Dropdown.Menu>
            )}
          />
        </div>
      </Grid.Column>
      <Grid.Column>
        <Form.ValidationElement
          label="JSON Path"
          value={form.jsonTagKeys[0].path}
          required={true}
          validationFunc={() =>
            handleValidation('Measurement Path', form.jsonTagKeys[0].path)
          }
        >
          {status => (
            <Input
              type={InputType.Text}
              placeholder="eg. myJSON.myObject[0].myKey"
              name="jsonpath"
              autoFocus={true}
              value={form.jsonTagKeys[0].path}
              onChange={e => {
                form.jsonTagKeys[0].path = e.target.value
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
      <Grid.Column>
        <div className="section">
          <h2 className="form-header">Field</h2>
          <Form.ValidationElement
            label="Name"
            value={form.jsonFieldKeys[0].name}
            required={true}
            validationFunc={() =>
              handleValidation('Measurement Path', form.jsonFieldKeys[0].name)
            }
          >
            {status => (
              <Input
                type={InputType.Text}
                placeholder="nonDescriptName"
                name="name"
                autoFocus={true}
                value={form.jsonFieldKeys[0].name}
                onChange={e => {
                  form.jsonFieldKeys[0].name = e.target.value
                  setForm({...formContent})
                }}
                status={status}
                maxLength={16}
                testID="json-parsing--name"
              />
            )}
          </Form.ValidationElement>
          <Form.Label label="Data Type" />
          <Dropdown
            button={(active, onClick) => (
              <Dropdown.Button
                active={active}
                onClick={onClick}
                testID="variable-type-dropdown--button"
              >
                {dataTypeF}
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
                      setDataTypeF(d)
                      form.jsonFieldKeys[0].type = d
                    }}
                    selected={dataTypeF === d}
                    testID={`variable-type-dropdown-${1}`}
                  >
                    {d}
                  </Dropdown.Item>
                ))}
              </Dropdown.Menu>
            )}
          />
        </div>
      </Grid.Column>
      <Grid.Column>
        <Form.ValidationElement
          label="JSON Path"
          value={form.jsonFieldKeys[0].path}
          required={true}
          validationFunc={() =>
            handleValidation('Measurement Path', form.jsonFieldKeys[0].path)
          }
        >
          {status => (
            <Input
              type={InputType.Text}
              placeholder="eg. myJSON.myObject[0].myKey"
              name="jsonpath"
              autoFocus={true}
              value={form.jsonFieldKeys[0].path}
              onChange={e => {
                form.jsonFieldKeys[0].path = e.target.value
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
      <Grid.Column>
        <Button
          text="Add Rule"
          color={ComponentColor.Tertiary}
          onClick={() => {}}
          titleText="Cancel creation of Label and return to list"
          type={ButtonType.Button}
          testID="create-label-form--cancel"
        />
      </Grid.Column>
      <Grid.Column>
        <div className="form-text">Validate your Parsing RUles</div>
        <h2 className="form-header">Validate your Line Protocol</h2>
        <TextArea
          name="validate"
          value={''}
          placeholder={
            'Enter a JSON object to verify that your parsing rules are finding the correct keys.'
          }
          onChange={() => {}}
          style={{height: '146px', minHeight: '146px'}}
          ref={null}
          maxLength={255}
          testID="json-validate"
        />
      </Grid.Column>
    </div>
  )
}
export default JsonParsingForm
