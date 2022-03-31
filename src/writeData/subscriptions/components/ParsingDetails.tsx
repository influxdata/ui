// Libraries
import React, {FC} from 'react'
import {useHistory} from 'react-router-dom'
import {useSelector} from 'react-redux'

// Components
import {
  Button,
  Grid,
  Form,
  Overlay,
  Columns,
  ButtonType,
  ComponentColor,
  ComponentStatus,
  SelectGroup,
  ButtonShape,
  Heading,
  HeadingElement,
  FontWeight,
} from '@influxdata/clockface'
import LineProtocolForm from './LineProtocolForm'
import JsonDetails from './JsonDetails'
import StringDetails from './StringDetails'

// Utils
import {getOrg} from 'src/organizations/selectors'

// Types
import {SUBSCRIPTIONS, LOAD_DATA} from 'src/shared/constants/routes'
import {Subscription} from 'src/types/subscriptions'

// Styles
import 'src/writeData/subscriptions/components/ParsingDetails.scss'

interface Props {
  currentSubscription: Subscription
  updateForm: (any) => void
  saveForm: (any) => void
  edit: boolean
  setEdit: (any) => void
}

const ParsingDetails: FC<Props> = ({
  currentSubscription,
  updateForm,
  saveForm,
  edit,
  setEdit,
}) => {
  const history = useHistory()
  const org = useSelector(getOrg)
  return (
    <div className="update-parsing-form">
      <Form onSubmit={() => {}} testID="update-parsing-form-overlay">
        <Overlay.Header title="Define Data Parsing Rules"></Overlay.Header>
        <Overlay.Body>
          <Grid>
            <Grid.Row>
              {edit ? (
                <Grid.Column widthXS={Columns.Twelve}>
                  <Heading
                    element={HeadingElement.H3}
                    weight={FontWeight.Bold}
                    className="update-parsing-form__header"
                  >
                    Data Format
                  </Heading>
                  <SelectGroup
                    shape={ButtonShape.StretchToFit}
                    className="retention--radio"
                  >
                    <SelectGroup.Option
                      name="line-protocol"
                      id="line-protocol"
                      testID="update-parsing-form-line-protocol--button"
                      active={currentSubscription.dataFormat === 'lineprotocol'}
                      onClick={() => {
                        updateForm({
                          ...currentSubscription,
                          dataFormat: 'lineprotocol',
                        })
                      }}
                      value={null}
                      titleText="None"
                      disabled={false}
                    >
                      Line Protocol
                    </SelectGroup.Option>
                    <SelectGroup.Option
                      name="json"
                      id="json"
                      testID="update-parsing-form-json--button"
                      active={currentSubscription.dataFormat === 'json'}
                      onClick={() => {
                        updateForm({
                          ...currentSubscription,
                          dataFormat: 'json',
                        })
                      }}
                      value={null}
                      titleText="None"
                      disabled={false}
                    >
                      JSON
                    </SelectGroup.Option>
                    <SelectGroup.Option
                      name="string"
                      id="string"
                      testID="update-parsing-form-string--button"
                      active={currentSubscription.dataFormat === 'string'}
                      onClick={() => {
                        updateForm({
                          ...currentSubscription,
                          dataFormat: 'string',
                        })
                      }}
                      value={null}
                      titleText="None"
                      disabled={false}
                    >
                      STRING
                    </SelectGroup.Option>
                  </SelectGroup>
                </Grid.Column>
              ) : (
                <Heading
                  element={HeadingElement.H4}
                  weight={FontWeight.Regular}
                  className="update-parsing-form__text"
                >
                  Data format:{' '}
                  {currentSubscription && currentSubscription.dataFormat}
                </Heading>
              )}
              {currentSubscription.dataFormat === 'string' && (
                <StringDetails
                  formContent={currentSubscription}
                  updateForm={updateForm}
                />
              )}
              {currentSubscription.dataFormat === 'json' && (
                <JsonDetails
                  formContent={currentSubscription}
                  updateForm={updateForm}
                />
              )}
              {currentSubscription.dataFormat === 'lineprotocol' && (
                <LineProtocolForm />
              )}
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
            titleText="Back to subscriptions list"
            type={ButtonType.Button}
            testID="update-parsing-form--cancel"
          />
          <Button
            type={ButtonType.Button}
            text="Edit"
            color={edit ? ComponentColor.Success : ComponentColor.Secondary}
            onClick={() => setEdit(!edit)}
            testID="update-parsing-form--edit"
          />
          <Button
            type={ButtonType.Button}
            text="Save Changes"
            color={ComponentColor.Secondary}
            onClick={() => {
              saveForm(currentSubscription)
            }}
            testID="update-parsing-form--submit"
          />
          <Button
            text="View Data"
            color={ComponentColor.Success}
            type={ButtonType.Button}
            onClick={() => {}}
            testID="update-parsing-form--view-data"
            status={ComponentStatus.Default}
          />
        </Overlay.Footer>
      </Form>
    </div>
  )
}
export default ParsingDetails
