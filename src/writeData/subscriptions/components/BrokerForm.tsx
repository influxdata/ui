// Libraries
import React, {FC, useEffect, useState, useRef} from 'react'
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
  IconFont,
  Icon,
  Heading,
  HeadingElement,
  FontWeight,
} from '@influxdata/clockface'

// Utils
import {getOrg} from 'src/organizations/selectors'
import {handleValidation} from 'src/writeData/subscriptions/utils/form'
import {convertUserInputToNumOrNaN} from 'src/shared/utils/convertUserInput'

// Types
import {SUBSCRIPTIONS, LOAD_DATA} from 'src/shared/constants/routes'
import {Subscription} from 'src/types/subscriptions'

// Styles
import 'src/writeData/subscriptions/components/BrokerForm.scss'

interface Props {
  formContent: Subscription
  setFormActive: (string) => void
  updateForm: (any) => void
  showUpgradeButton: boolean
}

const BrokerForm: FC<Props> = ({
  formContent,
  setFormActive,
  updateForm,
  showUpgradeButton,
}) => {
  const history = useHistory()
  const org = useSelector(getOrg)
  const mqttProtocol = 'MQTT'
  const protocolList = [mqttProtocol]
  const [protocol, setProtocol] = useState(mqttProtocol)
  const [security, setSecurity] = useState('none')
  // form validation component is in an err
  // state once the value changes
  // this fixes it for initial render
  // later forms are stuck in an inital validation
  // state though
  const didMount = useRef(false)
  useEffect(() => {
    if (didMount.current) {
      updateForm({...formContent, protocol: protocol.toLowerCase()})
    }
    didMount.current = true
  }, [protocol])
  return (
    formContent && (
      <div className="create-broker-form">
        <Form onSubmit={() => {}} testID="create-broker-form-overlay">
          <Overlay.Header title="Connect to Broker">
            {showUpgradeButton && (
              <div className="create-broker-form__premium-container">
                <Icon glyph={IconFont.CrownSolid_New} />
                <Heading
                  element={HeadingElement.H5}
                  weight={FontWeight.Bold}
                  className="create-broker-form__premium-container__text"
                >
                  Premium
                </Heading>
              </div>
            )}
          </Overlay.Header>
          <Overlay.Body>
            <Heading
              element={HeadingElement.H5}
              weight={FontWeight.Regular}
              className="create-broker-form__text"
            >
              {showUpgradeButton
                ? 'Upgrade Now to create a new connection to collect data from an MQTT broker and parse messages into metrics.'
                : 'Create a new connection to collect data from an MQTT broker and parse messages into metrics.'}
            </Heading>
            <Heading
              element={HeadingElement.H3}
              weight={FontWeight.Bold}
              className="create-broker-form__header"
            >
              Broker details
            </Heading>
            <Grid>
              <Grid.Row>
                <Grid.Column widthSM={Columns.Twelve}>
                  <Form.ValidationElement
                    label="Connection Name"
                    value={formContent.name}
                    required={true}
                    validationFunc={() =>
                      handleValidation('Connection Name', formContent.name)
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
                        status={status}
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
                      value={formContent.description}
                      onChange={e =>
                        updateForm({
                          ...formContent,
                          description: e.target.value,
                        })
                      }
                      testID="create-label-form--description"
                    />
                  </Form.Element>
                </Grid.Column>
                <div className="create-broker-form__inline-form">
                  <Grid.Column widthSM={Columns.Twelve}>
                    <div className="create-broker-form__inline-form__grid">
                      <div className="create-broker-form__inline-form__grid__protocol">
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
                          handleValidation(
                            'Broker Host',
                            formContent.brokerHost
                          )
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
                            String(formContent.brokerPort)
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
                            onChange={e => {
                              updateForm({
                                ...formContent,
                                brokerPort: convertUserInputToNumOrNaN(e),
                              })
                            }}
                            status={status}
                            maxLength={16}
                            testID="create-label-form--port"
                          />
                        )}
                      </Form.ValidationElement>
                    </div>
                    <Heading
                      element={HeadingElement.H5}
                      weight={FontWeight.Regular}
                      className="create-broker-form__example-text"
                    >
                      TCP://
                      {formContent.protocol ? formContent.protocol : 'MQTT'}:
                      {formContent.brokerHost
                        ? formContent.brokerHost
                        : '0.0.0.0'}
                      :
                      {formContent.brokerPort ? formContent.brokerPort : '1883'}
                    </Heading>
                  </Grid.Column>
                </div>
                <Grid.Column widthXS={Columns.Twelve}>
                  <Heading
                    element={HeadingElement.H3}
                    weight={FontWeight.Bold}
                    className="create-broker-form__header"
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
                      testID="no-security--button"
                      active={security === 'none'}
                      onClick={() => {
                        setSecurity('none')
                      }}
                      value={'none'}
                      titleText="None"
                      disabled={false}
                    >
                      None
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
                    {/* For a later iteration */}
                    {/* <SelectGroup.Option
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
                    </SelectGroup.Option> */}
                  </SelectGroup>
                  {security === 'user' && (
                    <div className="create-broker-form__creds">
                      <Form.Element label="Username">
                        <Input
                          type={InputType.Text}
                          placeholder="userName"
                          name="username"
                          value={formContent.brokerUsername}
                          onChange={e =>
                            updateForm({
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
                            updateForm({
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
