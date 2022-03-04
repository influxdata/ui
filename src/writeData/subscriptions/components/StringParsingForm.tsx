// Libraries
import React, {FC, useState} from 'react'

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

interface Props {
  form: Subscription
  formContent: Subscription
  setForm: (any) => void
}

const StringParsingForm: FC<Props> = ({form, setForm, formContent}) => {
  const dt = {
    key: '1',
    value: 'string',
    id: '1',
  }
  const dataTypeList = [dt]
  const [dataType, setDataType] = useState(dt)
  return (
    <div className="string-parsing-form">
      <Grid.Column>
        <Form.ValidationElement
          label="Regex to find Timestamp*"
          value={form.stringTimestamp}
          required={true}
          validationFunc={() => 'true'}
        >
          {status => (
            <Input
              type={InputType.Text}
              placeholder="eg. regexExample"
              name="timestamp"
              autoFocus={true}
              value={form.stringTimestamp}
              onChange={e =>
                setForm({...formContent, stringTimestamp: e.target.value})
              }
              status={status}
              maxLength={16}
              testID="string-parsing--timestamp"
            />
          )}
        </Form.ValidationElement>
      </Grid.Column>
      <Grid.Column>
        <div className="section">
          <h2 className="form-header">Measurement</h2>
          <Form.ValidationElement
            label="Name"
            value={form.stringMeasurement}
            required={true}
            validationFunc={() => 'true'}
          >
            {status => (
              <Input
                type={InputType.Text}
                placeholder="nonDescriptName"
                name="name"
                autoFocus={true}
                value={form.stringMeasurement}
                onChange={e =>
                  setForm({...formContent, stringMeasurement: e.target.value})
                }
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
                string
              </Dropdown.Button>
            )}
            menu={onCollapse => (
              <Dropdown.Menu onCollapse={onCollapse}>
                {dataTypeList.map(d => (
                  <Dropdown.Item
                    key={d.key}
                    id={d.id}
                    value={d.value}
                    onClick={() => setDataType(d)}
                    selected={dataType.value === d.value}
                    testID={`variable-type-dropdown-${1}`}
                  >
                    {formContent.protocol}
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
          value={form.stringTags}
          required={true}
          validationFunc={() => 'true'}
        >
          {status => (
            <Input
              type={InputType.Text}
              placeholder="eg. a=(\\d)"
              name="regex"
              autoFocus={true}
              value={form.stringTags}
              onChange={e =>
                setForm({...formContent, stringTags: e.target.value})
              }
              status={status}
              maxLength={16}
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
            value={form.stringTags}
            required={true}
            validationFunc={() => 'true'}
          >
            {status => (
              <Input
                type={InputType.Text}
                placeholder="nonDescriptName"
                name="name"
                autoFocus={true}
                value={form.stringTags}
                onChange={e =>
                  setForm({...formContent, stringTags: e.target.value})
                }
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
                string
              </Dropdown.Button>
            )}
            menu={onCollapse => (
              <Dropdown.Menu onCollapse={onCollapse}>
                {dataTypeList.map(d => (
                  <Dropdown.Item
                    key={d.key}
                    id={d.id}
                    value={d.value}
                    onClick={() => setDataType(d)}
                    selected={dataType.value === d.value}
                    testID={`variable-type-dropdown-${1}`}
                  >
                    {formContent.protocol}
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
          value={form.stringFields}
          required={true}
          validationFunc={() => 'true'}
        >
          {status => (
            <Input
              type={InputType.Text}
              placeholder="eg. a=(\\d)"
              name="regex"
              autoFocus={true}
              value={form.stringFields}
              onChange={e =>
                setForm({...formContent, stringFields: e.target.value})
              }
              status={status}
              maxLength={16}
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
            value={form.stringFields}
            required={true}
            validationFunc={() => 'true'}
          >
            {status => (
              <Input
                type={InputType.Text}
                placeholder="nonDescriptName"
                name="name"
                autoFocus={true}
                value={form.stringFields}
                onChange={e =>
                  setForm({...formContent, stringFields: e.target.value})
                }
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
                string
              </Dropdown.Button>
            )}
            menu={onCollapse => (
              <Dropdown.Menu onCollapse={onCollapse}>
                {dataTypeList.map(d => (
                  <Dropdown.Item
                    key={d.key}
                    id={d.id}
                    value={d.value}
                    onClick={() => setDataType(d)}
                    selected={dataType.value === d.value}
                    testID={`variable-type-dropdown-${1}`}
                  >
                    {formContent.protocol}
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
          value={form.stringFields}
          required={true}
          validationFunc={() => 'true'}
        >
          {status => (
            <Input
              type={InputType.Text}
              placeholder="eg. a=(\\d)"
              name="regex"
              autoFocus={true}
              value={form.stringFields}
              onChange={e =>
                setForm({...formContent, stringFields: e.target.value})
              }
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
