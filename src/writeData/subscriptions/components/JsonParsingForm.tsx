// Libraries
import React, {FC} from 'react'

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

const JsonParsingForm: FC = () => (
  <div className="json-parsing-form">
    <Grid.Column>
      <Form.ValidationElement
        label="JSON Path to Timestamp*"
        value={''}
        required={true}
        validationFunc={() => 'true'}
      >
        {status => (
          <Input
            type={InputType.Text}
            placeholder="eg. myJSON.myObject[0].timestampKey"
            name="timestamp"
            autoFocus={true}
            value={''}
            onChange={() => {}}
            status={status}
            maxLength={16}
            testID="json-parsing--timestamp"
          />
        )}
      </Form.ValidationElement>
    </Grid.Column>
    <Grid.Column>
      <div className="section">
        <h2 className="form-header">Measurement</h2>
        <Form.ValidationElement
          label="Name"
          value={''}
          required={true}
          validationFunc={() => 'true'}
        >
          {status => (
            <Input
              type={InputType.Text}
              placeholder="nonDescriptName"
              name="name"
              autoFocus={true}
              value={''}
              onChange={() => {}}
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
              String
            </Dropdown.Button>
          )}
          menu={onCollapse => (
            <Dropdown.Menu onCollapse={onCollapse}>
              {/* {Object.keys(VariableItems).map(key => ( */}
              <Dropdown.Item
                key={'1'}
                id={'1'}
                value={''}
                onClick={() => {}}
                testID={`variable-type-dropdown-${1}`}
              >
                MQTT
              </Dropdown.Item>
              )
            </Dropdown.Menu>
          )}
        />
      </div>
    </Grid.Column>
    <Grid.Column>
      <Form.ValidationElement
        label="JSON Path"
        value={''}
        required={true}
        validationFunc={() => 'true'}
      >
        {status => (
          <Input
            type={InputType.Text}
            placeholder="eg. myJSON.myObject[0].myKey"
            name="jsonpath"
            autoFocus={true}
            value={''}
            onChange={() => {}}
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
          value={''}
          required={true}
          validationFunc={() => 'true'}
        >
          {status => (
            <Input
              type={InputType.Text}
              placeholder="nonDescriptName"
              name="name"
              autoFocus={true}
              value={''}
              onChange={() => {}}
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
              String
            </Dropdown.Button>
          )}
          menu={onCollapse => (
            <Dropdown.Menu onCollapse={onCollapse}>
              {/* {Object.keys(VariableItems).map(key => ( */}
              <Dropdown.Item
                key={'1'}
                id={'1'}
                value={''}
                onClick={() => {}}
                testID={`variable-type-dropdown-${1}`}
              >
                MQTT
              </Dropdown.Item>
              )
            </Dropdown.Menu>
          )}
        />
      </div>
    </Grid.Column>
    <Grid.Column>
      <Form.ValidationElement
        label="JSON Path"
        value={''}
        required={true}
        validationFunc={() => 'true'}
      >
        {status => (
          <Input
            type={InputType.Text}
            placeholder="eg. myJSON.myObject[0].myKey"
            name="jsonpath"
            autoFocus={true}
            value={''}
            onChange={() => {}}
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
          value={''}
          required={true}
          validationFunc={() => 'true'}
        >
          {status => (
            <Input
              type={InputType.Text}
              placeholder="nonDescriptName"
              name="name"
              autoFocus={true}
              value={''}
              onChange={() => {}}
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
              String
            </Dropdown.Button>
          )}
          menu={onCollapse => (
            <Dropdown.Menu onCollapse={onCollapse}>
              {/* {Object.keys(VariableItems).map(key => ( */}
              <Dropdown.Item
                key={'1'}
                id={'1'}
                value={''}
                onClick={() => {}}
                testID={`variable-type-dropdown-${1}`}
              >
                MQTT
              </Dropdown.Item>
              )
            </Dropdown.Menu>
          )}
        />
      </div>
    </Grid.Column>
    <Grid.Column>
      <Form.ValidationElement
        label="JSON Path"
        value={''}
        required={true}
        validationFunc={() => 'true'}
      >
        {status => (
          <Input
            type={InputType.Text}
            placeholder="eg. myJSON.myObject[0].myKey"
            name="jsonpath"
            autoFocus={true}
            value={''}
            onChange={() => {}}
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

export default JsonParsingForm
