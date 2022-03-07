// Libraries
import React, {FC, useEffect, useState} from 'react'
import {useHistory} from 'react-router-dom'
import {useSelector} from 'react-redux'

// Components
import {
  Input,
  Button,
  Grid,
  Form,
  Overlay,
  Columns,
  InputType,
  ButtonType,
  Dropdown,
  ComponentColor,
  ComponentStatus,
  SelectGroup,
  ButtonShape,
} from '@influxdata/clockface'

// Utils
import {getOrg} from 'src/organizations/selectors'
import {convertUserInputToNumOrNaN} from 'src/shared/utils/convertUserInput'
import {handleValidation} from 'src/writeData/subscriptions/utils/form'

// Types
import {SUBSCRIPTIONS, LOAD_DATA} from 'src/shared/constants/routes'
import {Subscription} from 'src/types/subscriptions'

// Styles
import 'src/writeData/subscriptions/components/BrokerForm.scss'

interface Props {
  formContent: Subscription
  setFormActive: (string) => void
  updateForm: (any) => void
}

const BrokerForm: FC<Props> = ({formContent, setFormActive, updateForm}) => {
  const history = useHistory()
  const org = useSelector(getOrg)
  const [form, setForm] = useState(formContent)
  const mqttProtocol = 'MQTT'
  const protocolList = [mqttProtocol]
  const [protocol, setProtocol] = useState(mqttProtocol)
  const [security, setSecurity] = useState('never')
  useEffect(() => {
    setForm({...formContent, protocol: protocol.toLowerCase()})
  }, [protocol])
  useEffect(() => {
    updateForm(form)
  }, [form])
  return (
    formContent && (
      <div className="create-broker-form">
        <Form onSubmit={() => {}} testID="label-overlay-form">
          <Overlay.Header title="Connect to Broker" />
          <Overlay.Body>
            <div className="form-text">
              Create a new connection to collect data from an MQTT broker and
              parse messages into metrics.
            </div>
            <h2 className="form-header">Broker details</h2>
            <Grid>
              <Grid.Row>
                <Grid.Column widthSM={Columns.Twelve}>
                  <Form.ValidationElement
                    label="Connection Name"
                    value={form.name}
                    required={true}
                    validationFunc={() =>
                      handleValidation('Connection Name', form.name)
                    }
                  >
                    {status => (
                      <Input
                        type={InputType.Text}
                        placeholder="Enter a name for your connection"
                        name="connection-name"
                        autoFocus={true}
                        value={form.name}
                        onChange={e =>
                          setForm({...formContent, name: e.target.value})
                        }
                        status={status}
                        onClear={() => setForm({...formContent, name: ''})}
                        maxLength={16}
                        testID="create-label-form--name"
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
                      // value={form.description}
                      value={''}
                      onChange={() => {}}
                      // onChange={e =>
                      // setForm({...formContent, description: e.target.value})
                      // }
                      testID="create-label-form--description"
                    />
                  </Form.Element>
                </Grid.Column>
                <div className="subscription-inline-form">
                  <Grid.Column widthSM={Columns.Twelve}>
                    <div className="grid-div">
                      <div className="protocol">
                        <Form.Label label="Protocol" />
                        <Dropdown
                          button={(active, onClick) => (
                            <Dropdown.Button
                              active={active}
                              onClick={onClick}
                              testID="variable-type-dropdown--button"
                              status={ComponentStatus.Default}
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
                                  onClick={() => setProtocol(p)}
                                  selected={protocol === p}
                                  testID={`variable-type-dropdown-${1}`}
                                >
                                  {p}
                                </Dropdown.Item>
                              ))}
                            </Dropdown.Menu>
                          )}
                        />
                      </div>
                      <Form.ValidationElement
                        label="Host"
                        value={formContent.brokerHost}
                        required={true}
                        validationFunc={() =>
                          handleValidation('Broker Host', form.brokerHost)
                        }
                      >
                        {status => (
                          <Input
                            type={InputType.Text}
                            placeholder="0.0.0.0"
                            name="host"
                            autoFocus={true}
                            value={formContent.brokerHost}
                            onChange={e =>
                              setForm({
                                ...formContent,
                                brokerHost: e.target.value,
                              })
                            }
                            status={status}
                            maxLength={16}
                            testID="create-label-form--host"
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
                            String(form.brokerPort)
                          )
                        }
                      >
                        {status => (
                          <Input
                            type={InputType.Number}
                            placeholder="1883"
                            name="port"
                            autoFocus={true}
                            value={formContent.brokerPort}
                            onChange={e =>
                              setForm({
                                ...formContent,
                                brokerPort: convertUserInputToNumOrNaN(e),
                              })
                            }
                            status={status}
                            maxLength={16}
                            testID="create-label-form--port"
                          />
                        )}
                      </Form.ValidationElement>
                    </div>
                    <div className="example-text">
                      TCP://
                      {formContent.protocol ? formContent.protocol : 'MQTT'}:
                      {formContent.brokerHost
                        ? formContent.brokerHost
                        : '0.0.0.0'}
                      :
                      {formContent.brokerPort ? formContent.brokerPort : '1883'}
                    </div>
                  </Grid.Column>
                </div>
                <Grid.Column widthXS={Columns.Twelve}>
                  <h2 className="form-header">Security details</h2>
                  <SelectGroup
                    shape={ButtonShape.StretchToFit}
                    className="retention--radio"
                  >
                    <SelectGroup.Option
                      name="no-security"
                      id="never"
                      testID="no-security--button"
                      active={security === 'never'}
                      onClick={() => {
                        setSecurity('never')
                      }}
                      value={'never'}
                      titleText="Never"
                      disabled={false}
                    >
                      Never
                    </SelectGroup.Option>
                    <SelectGroup.Option
                      name="user"
                      id="user"
                      testID="user--button"
                      active={security === 'user'}
                      onClick={() => {
                        setSecurity('user')
                      }}
                      value={'user'}
                      titleText="User"
                      disabled={false}
                    >
                      User
                    </SelectGroup.Option>
                    <SelectGroup.Option
                      name="user"
                      id="user"
                      testID="user--button"
                      active={security === 'certificate'}
                      onClick={() => {
                        setSecurity('certificate')
                      }}
                      value={'certificate'}
                      titleText="Certificate"
                      disabled={false}
                    >
                      Certificate
                    </SelectGroup.Option>
                  </SelectGroup>
                  {security === 'user' && (
                    <div className="creds-div">
                      <Form.Element label="Username">
                        <Input
                          type={InputType.Text}
                          placeholder="userName"
                          name="username"
                          value={formContent.brokerUsername}
                          onChange={e =>
                            setForm({
                              ...formContent,
                              brokerUsername: e.target.value,
                            })
                          }
                          testID="create-label-form--username"
                        />
                      </Form.Element>
                      <Form.Element label="Password">
                        <Input
                          type={InputType.Text}
                          placeholder="*********"
                          name="password"
                          value={formContent.brokerPassword}
                          onChange={e =>
                            setForm({
                              ...formContent,
                              brokerPassword: e.target.value,
                            })
                          }
                          testID="create-label-form--password"
                        />
                      </Form.Element>
                    </div>
                  )}
                </Grid.Column>
              </Grid.Row>
            </Grid>
          </Overlay.Body>
          <Overlay.Footer>
            <Button
              text="Cancel"
              color={ComponentColor.Tertiary}
              onClick={() => {
                history.push(`/orgs/${org.id}/${LOAD_DATA}/${SUBSCRIPTIONS}`)
              }}
              titleText="Cancel creation of Label and return to list"
              type={ButtonType.Button}
              testID="create-label-form--cancel"
            />
            <Button
              text={'Next'}
              color={ComponentColor.Success}
              onClick={() => {
                setFormActive('subscription')
              }}
              type={ButtonType.Button}
              testID="create-label-form--submit"
              status={ComponentStatus.Default}
            />
          </Overlay.Footer>
        </Form>
      </div>
    )
  )
}
export default BrokerForm
