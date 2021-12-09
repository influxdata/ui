import React, {FC, useContext} from 'react'
import {
  Form,
  Input,
  InputType,
  ComponentSize,
  ComponentColor,
  IconFont,
  Dropdown,
  Icon,
} from '@influxdata/clockface'
import {EndpointProps} from 'src/types'
import {PipeContext} from 'src/flows/context/pipe'

const View: FC<EndpointProps> = ({createSecret, secrets}) => {
  const {data, update} = useContext(PipeContext)
  const severities = ['Critical', 'Warning', 'Info', 'Clear']

  const updateURL = evt => {
    update({
      endpointData: {
        ...data.endpointData,
        url: evt.target.value,
      },
    })
  }

  const updateUsername = val => {
    update({
      endpointData: {
        ...data.endpointData,
        username: val,
      },
    })
  }

  const updatePassword = val => {
    update({
      endpointData: {
        ...data.endpointData,
        password: val,
      },
    })
  }

  const updateAction = evt => {
    update({
      endpointData: {
        ...data.endpointData,
        action: evt.target.value,
      },
    })
  }

  const updateMethod = evt => {
    update({
      endpointData: {
        ...data.endpointData,
        method: evt.target.value,
      },
    })
  }

  const updateSeverity = val => {
    update({
      endpointData: {
        ...data.endpointData,
        severity: val,
      },
    })
  }

  return (
    <div className="slack-endpoint-details--flex">
      <Form.Element label="URL" required={true}>
        <Input
          name="url"
          testID="input--url"
          type={InputType.Text}
          value={data.endpointData.url}
          onChange={updateURL}
          size={ComponentSize.Medium}
        />
      </Form.Element>
      <Form.Element label="Username" required={true}>
        <Dropdown
          testID="dropdown--username"
          style={{width: '180px'}}
          button={(active, onClick) => (
            <Dropdown.Button
              active={active}
              onClick={onClick}
              icon={IconFont.Lock}
              color={ComponentColor.Default}
              testID="dropdown-button--username"
            >
              {data.endpointData.username !== ''
                ? data.endpointData.username
                : 'Choose a secret'}
            </Dropdown.Button>
          )}
          menu={onCollapse => (
            <Dropdown.Menu onCollapse={onCollapse}>
              <Dropdown.Item
                testID="dropdown-item--create-secret"
                id="create"
                key="create"
                value="create"
                onClick={() => createSecret(updateUsername)}
              >
                <Icon style={{marginRight: '4px'}} glyph={IconFont.Plus} />
                Create Secret
              </Dropdown.Item>
              {secrets.map(s => (
                <Dropdown.Item
                  testID={`dropdown-item--${s.id}`}
                  id={s.id}
                  key={s.id}
                  value={s.id}
                  onClick={updateUsername}
                >
                  {s.id}
                </Dropdown.Item>
              ))}
            </Dropdown.Menu>
          )}
        />
      </Form.Element>
      <Form.Element label="Password" required={true}>
        <Dropdown
          testID="dropdown--password"
          style={{width: '180px'}}
          button={(active, onClick) => (
            <Dropdown.Button
              active={active}
              onClick={onClick}
              icon={IconFont.Lock}
              color={ComponentColor.Default}
              testID="dropdown-button--password"
            >
              {data.endpointData.password !== ''
                ? data.endpointData.password
                : 'Choose a secret'}
            </Dropdown.Button>
          )}
          menu={onCollapse => (
            <Dropdown.Menu onCollapse={onCollapse}>
              <Dropdown.Item
                testID="dropdown-item--create-secret"
                id="create"
                key="create"
                value="create"
                onClick={() => createSecret(updatePassword)}
              >
                <Icon style={{marginRight: '4px'}} glyph={IconFont.Plus} />
                Create Secret
              </Dropdown.Item>
              {secrets.map(s => (
                <Dropdown.Item
                  testID={`dropdown-item--${s.id}`}
                  id={s.id}
                  key={s.id}
                  value={s.id}
                  onClick={updatePassword}
                >
                  {s.id}
                </Dropdown.Item>
              ))}
            </Dropdown.Menu>
          )}
        />
      </Form.Element>
      <Form.Element label="Severity" required={true}>
        <Dropdown
          testID="dropdown--severity"
          style={{width: '180px'}}
          button={(active, onClick) => (
            <Dropdown.Button
              active={active}
              onClick={onClick}
              icon={IconFont.Bell}
              color={ComponentColor.Default}
              testID="dropdown-button--severity"
            >
              {data.endpointData.severity !== ''
                ? data.endpointData.severity
                : 'Choose a severity'}
            </Dropdown.Button>
          )}
          menu={onCollapse => (
            <Dropdown.Menu onCollapse={onCollapse}>
              {severities.map(s => (
                <Dropdown.Item
                  testID={`dropdown-item--${s}`}
                  id={s}
                  key={s}
                  value={s}
                  onClick={updateSeverity}
                >
                  {s}
                </Dropdown.Item>
              ))}
            </Dropdown.Menu>
          )}
        />
      </Form.Element>
      <Form.Element label="Action">
        <Input
          name="action"
          testID="input--action"
          type={InputType.Email}
          value={data.endpointData.action}
          onChange={updateAction}
          size={ComponentSize.Medium}
        />
      </Form.Element>
      <Form.Element label="Method">
        <Input
          name="method"
          testID="input--method"
          type={InputType.Email}
          value={data.endpointData.method}
          onChange={updateMethod}
          size={ComponentSize.Medium}
        />
      </Form.Element>
    </div>
  )
}

export default View
