import React, {FC, useContext} from 'react'
import {
  Form,
  Input,
  InputType,
  ComponentSize,
  ComponentColor,
  IconFont,
  Icon,
  Dropdown,
} from '@influxdata/clockface'
import {PipeContext} from 'src/flows/context/pipe'
import {EndpointProps} from 'src/types'

const View: FC<EndpointProps> = ({createSecret, secrets}) => {
  const {data, update} = useContext(PipeContext)

  const updateAPIKey = val => {
    update({
      endpointData: {
        ...data.endpointData,
        apiKey: val,
      },
    })
  }

  const updateAPISecret = val => {
    update({
      endpointData: {
        ...data.endpointData,
        apiSecret: val,
      },
    })
  }

  const updateEmail = evt => {
    update({
      endpointData: {
        ...data.endpointData,
        email: evt.target.value,
      },
    })
  }

  const updateFromEmail = evt => {
    update({
      endpointData: {
        ...data.endpointData,
        fromEmail: evt.target.value,
      },
    })
  }

  return (
    <div className="slack-endpoint-details--flex">
      <Form.Element label="API Key" required={true}>
        <Dropdown
          testID="dropdown--apiKey"
          style={{width: '180px'}}
          button={(active, onClick) => (
            <Dropdown.Button
              active={active}
              onClick={onClick}
              icon={IconFont.Lock}
              color={ComponentColor.Default}
              testID="dropdown-button--apiKey"
            >
              {data.endpointData.apiKey !== ''
                ? data.endpointData.apiKey
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
                onClick={() => createSecret(updateAPIKey)}
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
                  onClick={updateAPIKey}
                >
                  {s.id}
                </Dropdown.Item>
              ))}
            </Dropdown.Menu>
          )}
        />
      </Form.Element>
      <Form.Element label="API Secret" required={true}>
        <Dropdown
          testID="dropdown--apiSecret"
          style={{width: '180px'}}
          button={(active, onClick) => (
            <Dropdown.Button
              active={active}
              onClick={onClick}
              icon={IconFont.Lock}
              color={ComponentColor.Default}
              testID="dropdown-button--apiSecret"
            >
              {data.endpointData.apiSecret !== ''
                ? data.endpointData.apiSecret
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
                onClick={() => createSecret(updateAPISecret)}
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
                  onClick={updateAPISecret}
                >
                  {s.id}
                </Dropdown.Item>
              ))}
            </Dropdown.Menu>
          )}
        />
      </Form.Element>
      <Form.Element label="To Email" required={true}>
        <Input
          name="email"
          testID="input--email"
          type={InputType.Email}
          value={data.endpointData.email}
          onChange={updateEmail}
          size={ComponentSize.Medium}
        />
      </Form.Element>
      <Form.Element label="From Email" required={true}>
        <Input
          name="fromEmail"
          testID="input--fromEmail"
          type={InputType.Text}
          value={data.endpointData.fromEmail}
          size={ComponentSize.Medium}
          onChange={updateFromEmail}
        />
      </Form.Element>
    </div>
  )
}

export default View
