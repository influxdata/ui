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
  IconFont,
  Icon,
  Heading,
  HeadingElement,
  FontWeight,
  FlexBox,
  ComponentSize,
  AlignItems,
  FlexDirection,
} from '@influxdata/clockface'
import UserInput from 'src/writeData/subscriptions/components/UserInput'

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
  useEffect(() => {
    updateForm({...formContent, protocol: protocol.toLowerCase()})
  }, [protocol])
  return (
    formContent && (
      <div className="create-broker-form">
        <Form onSubmit={() => {}} testID="create-broker-form-overlay">
          <Overlay.Header title="Connect to Broker">
            {showUpgradeButton && (
              <FlexBox
                alignItems={AlignItems.Center}
                direction={FlexDirection.Row}
                margin={ComponentSize.Medium}
                className="create-broker-form__premium-container"
              >
                <Icon glyph={IconFont.CrownSolid_New} />
                <Heading
                  element={HeadingElement.H5}
                  weight={FontWeight.Bold}
                  className="create-broker-form__premium-container__text"
                >
                  Premium
                </Heading>
              </FlexBox>
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
                        testID="create-broker-form--name"
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
                      testID="create-broker-form--description"
                    />
                  </Form.Element>
                </Grid.Column>
                <Grid.Column widthSM={Columns.Twelve}>
                  <FlexBox
                    alignItems={AlignItems.FlexStart}
                    direction={FlexDirection.Row}
                    margin={ComponentSize.Large}
                    className="create-broker-form__container"
                  >
                    <div className="create-broker-form__container__protocol">
                      <Form.Label label="Protocol" />
                      <Dropdown
                        button={(active, onClick) => (
                          <Dropdown.Button
                            active={active}
                            onClick={onClick}
                            testID="create-broker-form--dropdown-button"
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
                                testID={`create-broker-form-${1}`}
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
                          status={status}
                          testID="create-broker-form--host"
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
                          maxLength={5}
                          testID="create-broker-form--port"
                        />
                      )}
                    </Form.ValidationElement>
                  </FlexBox>
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
                    :{formContent.brokerPort ? formContent.brokerPort : '1883'}
                  </Heading>
                </Grid.Column>
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
                      testID="create-broker-form-no-security--button"
                      active={security === 'none'}
                      onClick={() => {
                        setSecurity('none')
                      }}
                      value="none"
                      titleText="None"
                      disabled={false}
                    >
                      None
                    </SelectGroup.Option>
                    <SelectGroup.Option
                      name="user"
                      id="user"
                      testID="create-broker-form--user--button"
                      active={security === 'user'}
                      onClick={() => {
                        setSecurity('user')
                      }}
                      value="user"
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
                    <UserInput
                      formContent={formContent}
                      updateForm={updateForm}
                    />
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
              titleText="Cancel creation of Subscription and return to list"
              type={ButtonType.Button}
              testID="create-broker-form--cancel"
            />
            <Button
              text="Next"
              color={ComponentColor.Success}
              onClick={() => {
                setFormActive('subscription')
              }}
              type={ButtonType.Button}
              testID="create-broker-form--submit"
              status={ComponentStatus.Default}
            />
          </Overlay.Footer>
        </Form>
      </div>
    )
  )
}
export default BrokerForm
