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
  Heading,
  HeadingElement,
  FontWeight,
  FlexBox,
  ComponentSize,
  AlignItems,
  FlexDirection,
  SpinnerContainer,
  TechnoSpinner,
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
import 'src/writeData/subscriptions/components/BrokerDetails.scss'

interface Props {
  currentSubscription: Subscription
  setFormActive: (string) => void
  updateForm: (any) => void
  edit: boolean
  setEdit: (any) => void
  loading: any
}

const BrokerDetails: FC<Props> = ({
  currentSubscription,
  setFormActive,
  updateForm,
  edit,
  setEdit,
  loading,
}) => {
  const history = useHistory()
  const org = useSelector(getOrg)
  const mqttProtocol = 'MQTT'
  const protocolList = [mqttProtocol]
  const [protocol, setProtocol] = useState(mqttProtocol)
  const [security, setSecurity] = useState('none')
  useEffect(() => {
    updateForm({...currentSubscription, protocol: protocol.toLowerCase()})
  }, [protocol])
  return (
    <div className="update-broker-form">
      <SpinnerContainer spinnerComponent={<TechnoSpinner />} loading={loading}>
        <Form onSubmit={() => {}} testID="update-broker-form-overlay">
          <Overlay.Body>
            <Heading
              element={HeadingElement.H3}
              weight={FontWeight.Bold}
              className="update-broker-form__header"
            >
              Broker details
            </Heading>
            <Grid>
              <Grid.Row>
                <Grid.Column widthSM={Columns.Twelve}>
                  <Form.ValidationElement
                    label="Connection Name"
                    value={currentSubscription.name}
                    required={true}
                    validationFunc={() =>
                      handleValidation(
                        'Connection Name',
                        currentSubscription.name
                      )
                    }
                    prevalidate={false}
                  >
                    {status => (
                      <Input
                        type={InputType.Text}
                        placeholder="Enter a name for your connection"
                        name="connection-name"
                        autoFocus={false}
                        value={currentSubscription.name}
                        onChange={e => {
                          updateForm({
                            ...currentSubscription,
                            name: e.target.value,
                          })
                        }}
                        status={status}
                        testID="update-broker-form--name"
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
                      value={
                        currentSubscription.description
                          ? currentSubscription.description
                          : ''
                      }
                      onChange={e =>
                        updateForm({
                          ...currentSubscription,
                          description: e.target.value,
                        })
                      }
                      testID="update-broker-form--description"
                    />
                  </Form.Element>
                </Grid.Column>
                <Grid.Column widthSM={Columns.Twelve}>
                  <FlexBox
                    alignItems={AlignItems.FlexStart}
                    direction={FlexDirection.Row}
                    margin={ComponentSize.Large}
                    className="update-broker-form__container"
                  >
                    <div className="update-broker-form__container__protocol">
                      <Form.Label label="Protocol" />
                      <Dropdown
                        button={(active, onClick) => (
                          <Dropdown.Button
                            active={active}
                            onClick={onClick}
                            testID="update-broker-form--dropdown-button"
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
                                testID={`update-broker-form-${1}`}
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
                      value={currentSubscription.brokerHost}
                      required={true}
                      validationFunc={() =>
                        handleValidation(
                          'Broker Host',
                          currentSubscription.brokerHost
                        )
                      }
                    >
                      {status => (
                        <Input
                          type={InputType.Text}
                          placeholder="0.0.0.0"
                          name="host"
                          autoFocus={false}
                          value={currentSubscription.brokerHost}
                          onChange={e => {
                            updateForm({
                              ...currentSubscription,
                              brokerHost: e.target.value,
                            })
                          }}
                          status={status}
                          testID="update-broker-form--host"
                        />
                      )}
                    </Form.ValidationElement>
                    <Form.ValidationElement
                      label="Port"
                      value={String(currentSubscription.brokerPort)}
                      required={true}
                      validationFunc={() =>
                        handleValidation(
                          'Broker Port',
                          String(currentSubscription.brokerPort)
                        )
                      }
                    >
                      {status => (
                        <Input
                          type={InputType.Number}
                          placeholder="1883"
                          name="port"
                          autoFocus={false}
                          value={currentSubscription.brokerPort}
                          onChange={e => {
                            updateForm({
                              ...currentSubscription,
                              brokerPort: convertUserInputToNumOrNaN(e),
                            })
                          }}
                          status={status}
                          maxLength={5}
                          testID="update-broker-form--port"
                        />
                      )}
                    </Form.ValidationElement>
                  </FlexBox>
                  <Heading
                    element={HeadingElement.H5}
                    weight={FontWeight.Regular}
                    className="update-broker-form__example-text"
                  >
                    TCP://
                    {currentSubscription.protocol
                      ? currentSubscription.protocol
                      : 'MQTT'}
                    :
                    {currentSubscription.brokerHost
                      ? currentSubscription.brokerHost
                      : '0.0.0.0'}
                    :
                    {currentSubscription.brokerPort
                      ? currentSubscription.brokerPort
                      : '1883'}
                  </Heading>
                </Grid.Column>
                <Grid.Column widthXS={Columns.Twelve}>
                  <Heading
                    element={HeadingElement.H3}
                    weight={FontWeight.Bold}
                    className="update-broker-form__header"
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
                      testID="update-broker-form-no-security--button"
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
                      testID="update-broker-form--user--button"
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
                      formContent={currentSubscription}
                      updateForm={updateForm}
                    />
                  )}
                </Grid.Column>
              </Grid.Row>
            </Grid>
          </Overlay.Body>
          <Overlay.Footer>
            <Button
              text="Close"
              color={ComponentColor.Tertiary}
              onClick={() => {
                history.push(`/orgs/${org.id}/${LOAD_DATA}/${SUBSCRIPTIONS}`)
              }}
              titleText="Cancel update of Subscription and return to list"
              type={ButtonType.Button}
              testID="update-broker-form--cancel"
            />
            <Button
              text="Edit"
              color={edit ? ComponentColor.Success : ComponentColor.Secondary}
              onClick={() => setEdit(!edit)}
              type={ButtonType.Button}
              titleText="Edit"
              testID="update-broker-form--submit"
            />
            <Button
              text="Next"
              color={ComponentColor.Secondary}
              onClick={() => setFormActive('subscription')}
              type={ButtonType.Button}
              titleText="Next"
              testID="update-broker-form--submit"
            />
            <Button
              text="View Data"
              color={ComponentColor.Success}
              onClick={() => {
                history.push(`/orgs/${org.id}/notebooks`)
              }}
              type={ButtonType.Button}
              testID="update-broker-form--view-data"
              status={ComponentStatus.Default}
            />
          </Overlay.Footer>
        </Form>
      </SpinnerContainer>
    </div>
  )
}
export default BrokerDetails
