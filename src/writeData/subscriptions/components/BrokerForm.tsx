// Libraries
import React, {FC} from 'react'
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

// Types
import {SUBSCRIPTIONS, LOAD_DATA} from 'src/shared/constants/routes'

// Styles
import 'src/writeData/subscriptions/components/BrokerForm.scss'

interface Props {
  setForm: (string) => void
}

const BrokerForm: FC<Props> = ({setForm}) => {
  const history = useHistory()
  const org = useSelector(getOrg)
  return (
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
                  value={''}
                  required={true}
                  validationFunc={() => 'true'}
                >
                  {status => (
                    <Input
                      type={InputType.Text}
                      placeholder="Enter a name for your connection"
                      name="connection-name"
                      autoFocus={true}
                      value={''}
                      onChange={() => {}}
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
                    value={''}
                    onChange={() => {}}
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
                          >
                            MQTT
                          </Dropdown.Button>
                        )}
                        menu={onCollapse => (
                          <Dropdown.Menu onCollapse={onCollapse}>
                            {/* {Object.keys(VariableItems).map(key => ( */}
                            <Dropdown.Item
                              key={'1'}
                              id={'1'}
                              value={''}
                              onClick={() => {}}
                              testID={`variable-type-dropdown-${1}`}
                            >
                              MQTT
                            </Dropdown.Item>
                            )
                          </Dropdown.Menu>
                        )}
                      />
                    </div>
                    <Form.ValidationElement
                      label="Host"
                      value={''}
                      required={true}
                      validationFunc={() => 'true'}
                    >
                      {status => (
                        <Input
                          type={InputType.Text}
                          placeholder="0.0.0.0"
                          name="host"
                          autoFocus={true}
                          value={''}
                          onChange={() => {}}
                          status={status}
                          maxLength={16}
                          testID="create-label-form--host"
                        />
                      )}
                    </Form.ValidationElement>
                    <Form.ValidationElement
                      label="Port"
                      value={''}
                      required={true}
                      validationFunc={() => 'true'}
                    >
                      {status => (
                        <Input
                          type={InputType.Text}
                          placeholder="1883"
                          name="port"
                          autoFocus={true}
                          value={''}
                          onChange={() => {}}
                          status={status}
                          maxLength={16}
                          testID="create-label-form--port"
                        />
                      )}
                    </Form.ValidationElement>
                  </div>
                  <div className="example-text">TCP://MQTT:000.00.0.0:1886</div>
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
                    active={true}
                    onClick={() => {}}
                    value={null}
                    titleText="None"
                    disabled={false}
                  >
                    Never
                  </SelectGroup.Option>
                  <SelectGroup.Option
                    name="user"
                    id="user"
                    testID="user--button"
                    active={false}
                    onClick={() => {}}
                    value={null}
                    titleText="None"
                    disabled={false}
                  >
                    User
                  </SelectGroup.Option>
                  <SelectGroup.Option
                    name="user"
                    id="user"
                    testID="user--button"
                    active={false}
                    onClick={() => {}}
                    value={null}
                    titleText="None"
                    disabled={false}
                  >
                    Certificate
                  </SelectGroup.Option>
                </SelectGroup>
                <div className="creds-div">
                  <Form.Element label="Username">
                    <Input
                      type={InputType.Text}
                      placeholder="userName"
                      name="username"
                      value={''}
                      onChange={() => {}}
                      testID="create-label-form--username"
                    />
                  </Form.Element>
                  <Form.Element label="Password">
                    <Input
                      type={InputType.Text}
                      placeholder="*********"
                      name="password"
                      value={''}
                      onChange={() => {}}
                      testID="create-label-form--password"
                    />
                  </Form.Element>
                </div>
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
              setForm('subscription')
            }}
            type={ButtonType.Submit}
            testID="create-label-form--submit"
            status={ComponentStatus.Default}
          />
        </Overlay.Footer>
      </Form>
    </div>
  )
}
export default BrokerForm
