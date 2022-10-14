// Libraries
import React, {FC, useEffect, useRef, useState} from 'react'
import {v4 as uuidv4} from 'uuid'

// Components
import {
  Input,
  Grid,
  Form,
  Columns,
  InputType,
  Dropdown,
  SelectGroup,
  ButtonShape,
  Heading,
  HeadingElement,
  FontWeight,
  FlexBox,
  ComponentSize,
  AlignItems,
  FlexDirection,
  ComponentStatus,
  Toggle,
  InputToggleType,
  InputLabel,
  SlideToggle,
} from '@influxdata/clockface'
import UserInput from 'src/writeData/subscriptions/components/UserInput'
import CertificateInput from 'src/writeData/subscriptions/components/CertificateInput'

// Utils
import {
  handleValidation,
  handlePortValidation,
  getSchemaFromProtocol,
  MIN_PORT,
  MAX_PORT,
} from 'src/writeData/subscriptions/utils/form'
import {convertUserInputToNumOrNaN} from 'src/shared/utils/convertUserInput'

// Types
import {BrokerAuthTypes, Subscription} from 'src/types/subscriptions'

// Styles
import 'src/writeData/subscriptions/components/BrokerForm.scss'
import {event} from 'src/cloud/utils/reporting'
import {isFlagEnabled} from 'src/shared/utils/featureFlag'

interface Props {
  formContent: Subscription
  updateForm: (any: Subscription) => void
  className: string
  edit: boolean
}

const BrokerFormContent: FC<Props> = ({
  updateForm,
  formContent,
  className,
  edit,
}) => {
  const mqttProtocol = 'MQTT'
  const protocolList = [mqttProtocol]
  const [protocol, setProtocol] = useState(mqttProtocol)
  const [useCustomClientID, setUseCustomClientID] = useState(
    !!formContent.clientID || false
  )
  const randomClientID = useRef(uuidv4())

  useEffect(() => {
    updateForm({...formContent, protocol: protocol.toLowerCase()})
  }, [protocol])

  useEffect(() => {
    const numberInput = document.getElementById(
      `${className}-broker-form--port`
    )
    numberInput?.addEventListener('mousewheel', function (evt) {
      evt.preventDefault()
    })
  }, [])

  const showHostPortExampleText =
    !!formContent.brokerHost ||
    (!!formContent.brokerPort && !isNaN(formContent.brokerPort))
  return (
    <Grid>
      <Grid.Row>
        <Grid.Column widthSM={Columns.Twelve}>
          <Form.ValidationElement
            label="Subscription Name"
            value={formContent.name}
            required={true}
            validationFunc={() =>
              handleValidation('Subscription Name', formContent.name)
            }
            prevalidate={false}
          >
            {status => (
              <Input
                type={InputType.Text}
                placeholder="Enter a name for your connection"
                name="connection-name"
                autoFocus={true}
                value={formContent.name}
                onChange={e => {
                  updateForm({
                    ...formContent,
                    name: e.target.value,
                  })
                }}
                onBlur={() =>
                  event(
                    'completed form field',
                    {formField: 'name', step: 'broker'},
                    {feature: 'subscriptions'}
                  )
                }
                status={edit ? status : ComponentStatus.Disabled}
                testID={`${className}-broker-form--name`}
                maxLength={255}
              />
            )}
          </Form.ValidationElement>
        </Grid.Column>
        <Grid.Column widthXS={Columns.Twelve}>
          <Form.Element label="Description">
            <Input
              type={InputType.Text}
              placeholder="Describe this connection"
              name="description"
              value={formContent.description ?? ''}
              onChange={e =>
                updateForm({
                  ...formContent,
                  description: e.target.value,
                })
              }
              onBlur={() =>
                event(
                  'completed form field',
                  {formField: 'description', step: 'broker'},
                  {feature: 'subscriptions'}
                )
              }
              testID={`${className}-broker-form--description`}
              status={edit ? ComponentStatus.Default : ComponentStatus.Disabled}
              maxLength={255}
            />
          </Form.Element>
        </Grid.Column>
        <Grid.Column widthSM={Columns.Twelve}>
          <FlexBox
            alignItems={AlignItems.FlexStart}
            direction={FlexDirection.Row}
            margin={ComponentSize.Large}
            className={`${className}-broker-form__container`}
          >
            <div className={`${className}broker-form__container__protocol`}>
              <Form.Label label="Protocol" />
              <Dropdown
                button={(active, onClick) => (
                  <Dropdown.Button
                    active={active}
                    onClick={onClick}
                    testID={`${className}-broker-form--dropdown-button`}
                    status={
                      edit ? ComponentStatus.Default : ComponentStatus.Disabled
                    }
                  >
                    {protocol}
                  </Dropdown.Button>
                )}
                menu={onCollapse => (
                  <Dropdown.Menu onCollapse={onCollapse}>
                    {protocolList.map((p, key) => (
                      <Dropdown.Item
                        key={key}
                        id={p}
                        value={p}
                        onClick={() => {
                          event(
                            'completed form field',
                            {
                              formField: 'protocol',
                              selected: p,
                              step: 'broker',
                            },
                            {feature: 'subscriptions'}
                          )
                          setProtocol(p)
                        }}
                        selected={protocol === p}
                        testID={`${className}-broker-form-${key}`}
                      >
                        {p}
                      </Dropdown.Item>
                    ))}
                  </Dropdown.Menu>
                )}
              />
            </div>
            <Form.ValidationElement
              label="Hostname or IP Address"
              value={formContent.brokerHost}
              required={true}
              validationFunc={() =>
                handleValidation('Broker Host', formContent.brokerHost)
              }
              helpText={
                className !== 'create' && edit
                  ? 'Changing the hostname will require you to provide your security credentials again.'
                  : ''
              }
            >
              {status => (
                <Input
                  type={InputType.Text}
                  placeholder="e.g: broker.example.com"
                  name="host"
                  autoFocus={false}
                  value={formContent.brokerHost}
                  onChange={e => {
                    updateForm({
                      ...formContent,
                      // remove any provided schemas from hostname
                      brokerHost: e.target.value.replace(/.*:\/\//, ''),
                      // clear the password field if broker host is edited
                      brokerPassword:
                        className === 'create'
                          ? formContent?.brokerPassword
                          : '',
                    })
                  }}
                  onBlur={() =>
                    event(
                      'completed form field',
                      {formField: 'host', step: 'broker'},
                      {feature: 'subscriptions'}
                    )
                  }
                  status={edit ? status : ComponentStatus.Disabled}
                  testID={`${className}-broker-form--host`}
                  maxLength={255}
                />
              )}
            </Form.ValidationElement>
            <Form.ValidationElement
              label="Port"
              value={String(formContent.brokerPort)}
              required={true}
              validationFunc={() =>
                handleValidation(
                  'Broker Port',
                  String(formContent.brokerPort)
                ) ?? handlePortValidation(formContent.brokerPort)
              }
            >
              {status => (
                <Input
                  type={InputType.Number}
                  placeholder={`Between ${MIN_PORT} - ${MAX_PORT}`}
                  name="port"
                  autoFocus={false}
                  value={formContent.brokerPort}
                  onChange={e => {
                    updateForm({
                      ...formContent,
                      brokerPort: convertUserInputToNumOrNaN(e),
                    })
                  }}
                  onBlur={() =>
                    event(
                      'completed form field',
                      {formField: 'port', step: 'broker'},
                      {feature: 'subscriptions'}
                    )
                  }
                  status={edit ? status : ComponentStatus.Disabled}
                  maxLength={5}
                  testID={`${className}-broker-form--port`}
                  id={`${className}-broker-form--port`}
                />
              )}
            </Form.ValidationElement>
          </FlexBox>
          {isFlagEnabled('subscriptionsSSLSupport') && (
            <FlexBox
              direction={FlexDirection.Row}
              alignItems={AlignItems.Center}
              margin={ComponentSize.Medium}
              className="static-toggle"
            >
              <SlideToggle
                active={formContent.useSSL}
                onChange={() => {
                  updateForm({
                    ...formContent,
                    useSSL: !formContent.useSSL,
                  })
                }}
                disabled={!edit}
                size={ComponentSize.Medium}
              />
              <Heading
                element={HeadingElement.H4}
                weight={FontWeight.Regular}
                className={`${className}-broker-form__ssl-text`}
              >
                Enable SSL
              </Heading>
            </FlexBox>
          )}
          {showHostPortExampleText && (
            <Heading
              element={HeadingElement.H5}
              weight={FontWeight.Regular}
              className={`${className}-broker-form__example-text`}
            >
              {getSchemaFromProtocol(formContent.protocol, formContent)}
              {`${formContent.brokerHost}:${
                !!formContent.brokerPort && !isNaN(formContent.brokerPort)
                  ? formContent.brokerPort
                  : ''
              }`}
            </Heading>
          )}
          {isFlagEnabled('subscriptionsClientId') && (
            <>
              <Form.ValidationElement
                label="Client ID"
                value={formContent.brokerHost}
                required={useCustomClientID}
                validationFunc={() =>
                  useCustomClientID &&
                  handleValidation('Client ID', formContent.clientID)
                }
                helpText="We will generate a Client ID for you, but some providers require you use their Client ID. If your provider requires a specific Client ID, the connection will fail without it. Check your provider’s documentation to verify whether you need to use their Client ID."
                className="no-margin-bottom"
              >
                {status => (
                  <Input
                    type={InputType.Text}
                    placeholder={
                      useCustomClientID
                        ? 'Enter a client id'
                        : randomClientID.current
                    }
                    name="clientid"
                    autoFocus={false}
                    value={formContent.clientID}
                    onChange={e => {
                      updateForm({
                        ...formContent,
                        clientID: e.target.value,
                      })
                    }}
                    onBlur={() =>
                      event(
                        'completed form field',
                        {formField: 'clientid', step: 'broker'},
                        {feature: 'subscriptions'}
                      )
                    }
                    status={
                      edit && useCustomClientID
                        ? status
                        : ComponentStatus.Disabled
                    }
                    testID={`${className}-broker-form--clientid`}
                    maxLength={255}
                  />
                )}
              </Form.ValidationElement>
              <Toggle
                type={InputToggleType.Checkbox}
                checked={useCustomClientID}
                id="clientid-toggle"
                size={ComponentSize.Small}
                titleText="Use Custom Client ID"
                onChange={() => {
                  setUseCustomClientID(!useCustomClientID)
                  updateForm({...formContent, clientID: ''})
                }}
                disabled={!edit}
              >
                <InputLabel>Use Custom Client ID</InputLabel>
              </Toggle>
            </>
          )}
        </Grid.Column>
        <Grid.Column widthXS={Columns.Twelve}>
          <Heading
            element={HeadingElement.H3}
            weight={FontWeight.Bold}
            className={`${className}-broker-form__header`}
          >
            Security details
          </Heading>
          <SelectGroup
            shape={ButtonShape.StretchToFit}
            className="retention--radio"
          >
            <SelectGroup.Option
              name="no-security"
              id="none"
              testID={`${className}-broker-form-no-security--button`}
              active={formContent.authType === BrokerAuthTypes.None}
              onClick={() => {
                event(
                  'broker security toggle',
                  {method: 'none', step: 'broker'},
                  {feature: 'subscriptions'}
                )
                updateForm({
                  ...formContent,
                  authType: BrokerAuthTypes.None,
                  brokerUsername: null,
                  brokerPassword: null,
                  brokerCACert: null,
                  brokerClientCert: null,
                  brokerClientKey: null,
                })
              }}
              value="none"
              titleText="None"
              disabled={!edit}
            >
              None
            </SelectGroup.Option>
            <SelectGroup.Option
              name="user"
              id="user"
              testID={`${className}-broker-form--user--button`}
              active={formContent.authType === BrokerAuthTypes.User}
              onClick={() => {
                event(
                  'broker security toggle',
                  {method: 'user', step: 'broker'},
                  {feature: 'subscriptions'}
                )
                updateForm({
                  ...formContent,
                  authType: BrokerAuthTypes.User,
                  brokerCACert: null,
                  brokerClientCert: null,
                  brokerClientKey: null,
                })
              }}
              value="user"
              titleText="User"
              disabled={!edit}
            >
              Basic
            </SelectGroup.Option>
            <SelectGroup.Option
              name="certificate"
              id="certificate"
              testID="certificate--button"
              active={formContent.authType === BrokerAuthTypes.Certificate}
              onClick={() => {
                event(
                  'broker security toggle',
                  {method: 'certificate', step: 'broker'},
                  {feature: 'subscriptions'}
                )
                updateForm({
                  ...formContent,
                  brokerUsername: null,
                  brokerPassword: null,
                  authType: BrokerAuthTypes.Certificate,
                  useSSL: true,
                })
              }}
              value="certificate"
              titleText="Certificate"
              disabled={!edit}
            >
              Certificate
            </SelectGroup.Option>
          </SelectGroup>
          {formContent.authType === BrokerAuthTypes.User && (
            <UserInput
              formContent={formContent}
              updateForm={updateForm}
              className={className}
              edit={edit}
            />
          )}
          {formContent.authType === BrokerAuthTypes.Certificate && (
            <CertificateInput
              subscription={formContent}
              updateForm={updateForm}
              edit={edit}
            />
          )}
        </Grid.Column>
      </Grid.Row>
    </Grid>
  )
}

export default BrokerFormContent
