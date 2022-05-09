// Libraries
import React, {FC, useEffect, useState} from 'react'

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
} from '@influxdata/clockface'
import UserInput from 'src/writeData/subscriptions/components/UserInput'

// Utils
import {handleValidation} from 'src/writeData/subscriptions/utils/form'
import {convertUserInputToNumOrNaN} from 'src/shared/utils/convertUserInput'

// Types
import {Subscription} from 'src/types/subscriptions'

// Styles
import 'src/writeData/subscriptions/components/BrokerForm.scss'
import {event} from 'src/cloud/utils/reporting'

interface Props {
  formContent: Subscription
  updateForm: (any) => void
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
  const [security, setSecurity] = useState('none')
  useEffect(() => {
    updateForm({...formContent, protocol: protocol.toLowerCase()})
  }, [protocol])
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
              value={formContent.description}
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
            >
              {status => (
                <Input
                  type={InputType.Text}
                  placeholder="0.0.0.0"
                  name="host"
                  autoFocus={true}
                  value={formContent.brokerHost}
                  onChange={e => {
                    updateForm({
                      ...formContent,
                      brokerHost: e.target.value,
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
                />
              )}
            </Form.ValidationElement>
            <Form.ValidationElement
              label="Port"
              value={String(formContent.brokerPort)}
              required={true}
              validationFunc={() =>
                handleValidation('Broker Port', String(formContent.brokerPort))
              }
            >
              {status => (
                <Input
                  type={InputType.Number}
                  placeholder="1883"
                  name="port"
                  autoFocus={true}
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
                />
              )}
            </Form.ValidationElement>
          </FlexBox>
          <Heading
            element={HeadingElement.H5}
            weight={FontWeight.Regular}
            className={`${className}-broker-form__example-text`}
          >
            TCP://
            {formContent.protocol ? formContent.protocol : 'MQTT'}:
            {formContent.brokerHost ? formContent.brokerHost : '0.0.0.0'}:
            {formContent.brokerPort ? formContent.brokerPort : '1883'}
          </Heading>
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
              active={security === 'none'}
              onClick={() => {
                event(
                  'broker security toggle',
                  {method: 'none', step: 'broker'},
                  {feature: 'subscriptions'}
                )
                setSecurity('none')
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
              active={security === 'user'}
              onClick={() => {
                event(
                  'broker security toggle',
                  {method: 'user', step: 'broker'},
                  {feature: 'subscriptions'}
                )
                setSecurity('user')
              }}
              value="user"
              titleText="User"
              disabled={!edit}
            >
              User
            </SelectGroup.Option>
            {/* For a later iteration */}
            {/* <SelectGroup.Option
            name="user"
            id="user"
            testID="user--button"
            active={security === 'certificate'}
            onClick={() => {
              event('broker security toggle', {method: 'certificate'}, {feature: 'subscriptions'})
              setSecurity('certificate')
            }}
            value={'certificate'}
            titleText="Certificate"
            disabled={false}
          >
            Certificate
          </SelectGroup.Option> */}
          </SelectGroup>
          {security === 'user' && (
            <UserInput
              formContent={formContent}
              updateForm={updateForm}
              className={className}
              edit={edit}
            />
          )}
        </Grid.Column>
      </Grid.Row>
    </Grid>
  )
}

export default BrokerFormContent
