import React, {FC, useContext} from 'react'
import {
  Form,
  Input,
  InputType,
  ComponentSize,
  Dropdown,
  IconFont,
  Icon,
  ComponentColor,
} from '@influxdata/clockface'

import {PipeContext} from 'src/flows/context/pipe'
import {EndpointProps} from 'src/types'

const View: FC<EndpointProps> = ({createSecret, secrets}) => {
  const {data, update} = useContext(PipeContext)

  const updateDomain = evt => {
    update({
      endpointData: {
        ...data.endpointData,
        domain: evt.target.value,
      },
    })
  }

  const updateAPIKey = val => {
    update({
      endpointData: {
        ...data.endpointData,
        apiKey: val,
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

  return (
    <div className="slack-endpoint-details--flex">
      <Form.Element label="Domain" required={true}>
        <Input
          name="domain"
          testID="input--domain"
          type={InputType.Text}
          value={data.endpointData.domain}
          onChange={updateDomain}
          size={ComponentSize.Medium}
        />
      </Form.Element>
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
      <Form.Element label="Email" required={true}>
        <Input
          name="email"
          testID="input--email"
          type={InputType.Email}
          value={data.endpointData.email}
          onChange={updateEmail}
          size={ComponentSize.Medium}
        />
      </Form.Element>
    </div>
  )
}

export default View
