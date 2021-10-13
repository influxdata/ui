import React, {FC, useContext} from 'react'
import {useSelector} from 'react-redux'
import {
  Form,
  Input,
  InputType,
  ComponentSize,
  ComponentStatus,
  ComponentColor,
  IconFont,
  Dropdown,
} from '@influxdata/clockface'
import {getAllSecrets} from 'src/resources/selectors'
import {PipeContext} from 'src/flows/context/pipe'

const View: FC = () => {
  const {data, update} = useContext(PipeContext)
  const secrets = useSelector(getAllSecrets)

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
                : 'Select a Secret'}
            </Dropdown.Button>
          )}
          menu={onCollapse => (
            <Dropdown.Menu onCollapse={onCollapse}>
              {secrets.map(s => (
                <Dropdown.Item
                  testID={`dropdown-item--${s.key}`}
                  id={s.id}
                  key={s.key}
                  value={s.key}
                  onClick={updateAPIKey}
                >
                  {s.key}
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
                : 'Select a Secret'}
            </Dropdown.Button>
          )}
          menu={onCollapse => (
            <Dropdown.Menu onCollapse={onCollapse}>
              {secrets.map(s => (
                <Dropdown.Item
                  testID={`dropdown-item--${s.key}`}
                  id={s.id}
                  key={s.key}
                  value={s.key}
                  onClick={updateAPISecret}
                >
                  {s.key}
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
        />
      </Form.Element>
    </div>
  )
}

export default View
