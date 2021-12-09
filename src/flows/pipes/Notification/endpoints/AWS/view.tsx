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

  const updateURL = evt => {
    update({
      endpointData: {
        ...data.endpointData,
        url: evt.target.value,
      },
    })
  }

  const updateAccessKey = val => {
    update({
      endpointData: {
        ...data.endpointData,
        accessKey: val,
      },
    })
  }

  const updateAuthAlgo = val => {
    update({
      endpointData: {
        ...data.endpointData,
        authAlgo: val,
      },
    })
  }

  const updateCredScope = val => {
    update({
      endpointData: {
        ...data.endpointData,
        credScope: val,
      },
    })
  }

  const updateSignedHeaders = val => {
    update({
      endpointData: {
        ...data.endpointData,
        signedHeaders: val,
      },
    })
  }

  const updateCalcSignature = val => {
    update({
      endpointData: {
        ...data.endpointData,
        calcSignature: val,
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
      <Form.Element label="Authorization Access Key" required={true}>
        <Dropdown
          testID="dropdown--accessKey"
          style={{width: '180px'}}
          button={(active, onClick) => (
            <Dropdown.Button
              active={active}
              onClick={onClick}
              icon={IconFont.Lock}
              color={ComponentColor.Default}
              testID="dropdown-button--accessKey"
            >
              {data.endpointData.accessKey !== ''
                ? data.endpointData.accessKey
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
                onClick={() => createSecret(updateAccessKey)}
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
                  onClick={updateAccessKey}
                >
                  {s.id}
                </Dropdown.Item>
              ))}
            </Dropdown.Menu>
          )}
        />
      </Form.Element>
      <Form.Element label="Authorization Algorithm" required={true}>
        <Dropdown
          testID="dropdown--authAlgo"
          style={{width: '180px'}}
          button={(active, onClick) => (
            <Dropdown.Button
              active={active}
              onClick={onClick}
              icon={IconFont.Lock}
              color={ComponentColor.Default}
              testID="dropdown-button--authAlgo"
            >
              {data.endpointData.authAlgo !== ''
                ? data.endpointData.authAlgo
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
                onClick={() => createSecret(updateAuthAlgo)}
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
                  onClick={updateAuthAlgo}
                >
                  {s.id}
                </Dropdown.Item>
              ))}
            </Dropdown.Menu>
          )}
        />
      </Form.Element>
      <Form.Element label="Authorization Credential Scope" required={true}>
        <Dropdown
          testID="dropdown--credScope"
          style={{width: '180px'}}
          button={(active, onClick) => (
            <Dropdown.Button
              active={active}
              onClick={onClick}
              icon={IconFont.Lock}
              color={ComponentColor.Default}
              testID="dropdown-button--credScope"
            >
              {data.endpointData.credScope !== ''
                ? data.endpointData.credScope
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
                onClick={() => createSecret(updateCredScope)}
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
                  onClick={updateCredScope}
                >
                  {s.id}
                </Dropdown.Item>
              ))}
            </Dropdown.Menu>
          )}
        />
      </Form.Element>
      <Form.Element label="Authorization Signed Headers" required={true}>
        <Dropdown
          testID="dropdown--signedHeaders"
          style={{width: '180px'}}
          button={(active, onClick) => (
            <Dropdown.Button
              active={active}
              onClick={onClick}
              icon={IconFont.Lock}
              color={ComponentColor.Default}
              testID="dropdown-button--signedHeaders"
            >
              {data.endpointData.signedHeaders !== ''
                ? data.endpointData.signedHeaders
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
                onClick={() => createSecret(updateSignedHeaders)}
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
                  onClick={updateSignedHeaders}
                >
                  {s.id}
                </Dropdown.Item>
              ))}
            </Dropdown.Menu>
          )}
        />
      </Form.Element>
      <Form.Element label="Authorization Calculated Signature" required={true}>
        <Dropdown
          testID="dropdown--calcSignature"
          style={{width: '180px'}}
          button={(active, onClick) => (
            <Dropdown.Button
              active={active}
              onClick={onClick}
              icon={IconFont.Lock}
              color={ComponentColor.Default}
              testID="dropdown-button--calcSignature"
            >
              {data.endpointData.calcSignature !== ''
                ? data.endpointData.calcSignature
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
                onClick={() => createSecret(updateCalcSignature)}
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
                  onClick={updateCalcSignature}
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
