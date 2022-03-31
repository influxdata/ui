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

// Utils
import {getOrg} from 'src/organizations/selectors'

// Types
import {SUBSCRIPTIONS, LOAD_DATA} from 'src/shared/constants/routes'
import {Subscription} from 'src/types/subscriptions'

// Styles
import 'src/writeData/subscriptions/components/ParsingForm.scss'
import LineProtocolForm from './LineProtocolForm'
import JsonDetails from './JsonDetails'
import StringDetails from './StringDetails'

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
  const returnParsing = type => {
    if (type === 'string') {
      return (
        <StringDetails
          formContent={currentSubscription}
          updateForm={updateForm}
        />
      )
    } else if (type === 'json') {
      return (
        <JsonDetails
          formContent={currentSubscription}
          updateForm={updateForm}
        />
      )
    } else {
      return <LineProtocolForm />
    }
  }
  return (
    currentSubscription && (
      <div className="create-parsing-form">
        <Form onSubmit={() => {}} testID="create-parsing-form-overlay">
          <Overlay.Header title="Define Data Parsing Rules"></Overlay.Header>
          <Overlay.Body>
            <Grid>
              <Grid.Row>
                {edit ? (
                  <Grid.Column widthXS={Columns.Twelve}>
                    <Heading
                      element={HeadingElement.H3}
                      weight={FontWeight.Bold}
                      className="create-parsing-form__header"
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
                        testID="create-parsing-form-line-protocol--button"
                        active={
                          currentSubscription.dataFormat === 'lineprotocol'
                        }
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
                        testID="create-parsing-form-json--button"
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
                        testID="create-parsing-form-string--button"
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
                    className="create-subscription-form__text"
                  >
                    Data format:{' '}
                    {currentSubscription && currentSubscription.dataFormat}
                  </Heading>
                )}
                {returnParsing(currentSubscription.dataFormat)}
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
              titleText="Back to broker form"
              type={ButtonType.Button}
              testID="create-parsing-form--cancel"
            />
            <Button
              type={ButtonType.Button}
              text={edit ? 'Save Changes' : 'Edit'}
              color={ComponentColor.Secondary}
              onClick={() => {
                edit ? saveForm(currentSubscription) : setEdit(true)
              }}
              testID="create-parsing-form--submit"
            />
            <Button
              text="View Data"
              color={ComponentColor.Success}
              type={ButtonType.Button}
              onClick={() => {}}
              testID="create-parsing-form--view-data"
              status={ComponentStatus.Default}
            />
          </Overlay.Footer>
        </Form>
      </div>
    )
  )
}
export default ParsingDetails
