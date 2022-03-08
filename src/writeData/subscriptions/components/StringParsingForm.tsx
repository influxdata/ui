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
import 'src/writeData/subscriptions/components/StringParsingForm.scss'

// Types
import {Subscription} from 'src/types/subscriptions'

// Utils
import {handleValidation} from 'src/writeData/subscriptions/utils/form'

interface Props {
  formContent: Subscription
  updateForm: (any) => void
}

const StringParsingForm: FC<Props> = ({formContent, updateForm}) => {
  const [form, setForm] = useState(formContent)
  const stringType = 'String'
  const numberType = 'Number'
  const dataTypeList = [stringType, numberType]
  const [dataTypeM, setDataTypeM] = useState(stringType)
  const [dataTypeF, setDataTypeF] = useState(stringType)
  const [dataTypeT, setDataTypeT] = useState(stringType)
  const [firstRender, setRender] = useState(false)
  useEffect(() => {
    updateForm(form)
  }, [form])
  useEffect(() => {
    setRender(true)
  }, [])
  console.log('formcontent', formContent)
  return (
    <div className="string-parsing-form">
      <Grid.Column>
        <Form.Label label="Regex to find Timestamp" />
        <Input
          type={InputType.Text}
          placeholder="eg. regexExample"
          name="timestamp"
          autoFocus={true}
          value={form.stringTimestamp.pattern}
          onChange={e => {
            form.stringTimestamp.pattern = e.target.value
            setForm({...formContent})
          }}
          maxLength={56}
          testID="string-parsing--timestamp"
        />
      </Grid.Column>
      <Grid.Column>
        <div className="section">
          <h2 className="form-header">Measurement</h2>
          <Form.ValidationElement
            label="Name"
            value={form.stringMeasurement.name}
            required={true}
            validationFunc={() =>
              !firstRender &&
              handleValidation('Measurement Name', form.stringMeasurement.name)
            }
          >
            {status => (
              <Input
                type={InputType.Text}
                placeholder="nonDescriptName"
                name="name"
                autoFocus={true}
                value={form.stringMeasurement.name}
                onChange={e => {
                  setRender(false)
                  form.stringMeasurement.name = e.target.value
                  setForm({...formContent})
                }}
                status={status}
                maxLength={16}
                testID="string-parsing--name"
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
                      // form.stringMeasurement.type = d
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
          label="Regex Pattern"
          value={form.stringMeasurement.pattern}
          required={true}
          validationFunc={() =>
            !firstRender &&
            handleValidation('Pattern', form.stringMeasurement.pattern)
          }
        >
          {status => (
            <Input
              type={InputType.Text}
              placeholder="eg. a=(\\d)"
              name="regex"
              autoFocus={true}
              value={form.stringMeasurement.pattern}
              onChange={e => {
                setRender(false)
                form.stringMeasurement.pattern = e.target.value
                setForm({...formContent})
              }}
              status={status}
              maxLength={56}
              testID="string-parsing--regex"
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
            value={form.stringTags[0].name}
            required={true}
            validationFunc={() =>
              !firstRender && handleValidation('Name', form.stringTags[0].name)
            }
          >
            {status => (
              <Input
                type={InputType.Text}
                placeholder="nonDescriptName"
                name="name"
                autoFocus={true}
                value={form.stringTags[0].name}
                onChange={e => {
                  setRender(false)
                  form.stringTags[0].name = e.target.value
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
                      // form.stringMeasurement.type = d
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
          label="Regex pattern"
          value={form.stringTags[0].pattern}
          required={true}
          validationFunc={() =>
            !firstRender &&
            handleValidation('Pattern', form.stringTags[0].pattern)
          }
        >
          {status => (
            <Input
              type={InputType.Text}
              placeholder="eg. a=(\\d)"
              name="regex"
              autoFocus={true}
              value={form.stringTags[0].pattern}
              onChange={e => {
                setRender(false)
                form.stringTags[0].pattern = e.target.value
                setForm({...formContent})
              }}
              status={status}
              maxLength={56}
              testID="string-parsing--regex"
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
            value={form.stringFields[0].name}
            required={true}
            validationFunc={() =>
              !firstRender &&
              handleValidation('Name', form.stringFields[0].name)
            }
          >
            {status => (
              <Input
                type={InputType.Text}
                placeholder="nonDescriptName"
                name="name"
                autoFocus={true}
                value={form.stringFields[0].name}
                onChange={e => {
                  setRender(false)
                  form.stringFields[0].name = e.target.value
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
                      // form.stringMeasurement.type = d
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
          label="Regex pattern"
          value={form.stringFields[0].pattern}
          required={true}
          validationFunc={() =>
            !firstRender &&
            handleValidation('Name', form.stringFields[0].pattern)
          }
        >
          {status => (
            <Input
              type={InputType.Text}
              placeholder="eg. a=(\\d)"
              name="regex"
              autoFocus={true}
              value={form.stringFields[0].pattern}
              onChange={e => {
                setRender(false)
                form.stringFields[0].pattern = e.target.value
                setForm({...formContent})
              }}
              status={status}
              maxLength={16}
              testID="string-parsing--regex"
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
            'Enter a string snippet of your data to verify that your regex parsing rules correctly apply.'
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

export default StringParsingForm
