import React, {FC, useContext} from 'react'
import {useSelector} from 'react-redux'
import {
  Form,
  Input,
  InputType,
  ComponentSize,
  ComponentColor,
  IconFont,
  Dropdown,
} from '@influxdata/clockface'
import {getAllSecrets} from 'src/resources/selectors'

import {PipeContext} from 'src/flows/context/pipe'

const View: FC = () => {
  const {data, update} = useContext(PipeContext)
  const secrets = useSelector(getAllSecrets)

  const updateURL = evt => {
    update({
      endpointData: {
        ...data.endpointData,
        url: evt.target.value,
      },
    })
  }

  const updateChannel = evt => {
    update({
      endpointData: {
        ...data.endpointData,
        channel: evt.target.value,
      },
    })
  }

  const updateToken = val => {
    update({
      endpointData: {
        ...data.endpointData,
        token: val,
      },
    })
  }

  const updateParseMode = evt => {
    update({
      endpointData: {
        ...data.endpointData,
        parseMode: evt.target.value,
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
      <Form.Element label="Channel" required={true}>
        <Input
          name="channel"
          testID="input--channel"
          type={InputType.Text}
          value={data.endpointData.channel}
          onChange={updateChannel}
          size={ComponentSize.Medium}
        />
      </Form.Element>
      <Form.Element label="Token" required={true}>
        <Dropdown
          testID="dropdown--token"
          style={{width: '180px'}}
          button={(active, onClick) => (
            <Dropdown.Button
              active={active}
              onClick={onClick}
              icon={IconFont.Lock}
              color={ComponentColor.Default}
              testID="dropdown-button--token"
            >
              {data.endpointData.token !== ''
                ? data.endpointData.token
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
                  onClick={updateToken}
                >
                  {s.key}
                </Dropdown.Item>
              ))}
            </Dropdown.Menu>
          )}
        />
      </Form.Element>
      <Form.Element label="Parse Mode">
        <Input
          name="parseMode"
          testID="input--parseMode"
          type={InputType.Email}
          value={data.endpointData.parseMode}
          onChange={updateParseMode}
          size={ComponentSize.Medium}
        />
      </Form.Element>
    </div>
  )
}

export default View
