// Libraries
import React, {FC, useEffect, useState} from 'react'
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
import StringParsingForm from './StringParsingForm'
import JsonParsingForm from './JsonParsingForm'
import LineProtocolForm from './LineProtocolForm'

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
  const [parsing, setParsing] = useState('lineprotocol')
  useEffect(() => {
    updateForm({...currentSubscription, dataFormat: parsing})
  }, [parsing])
  return (
    currentSubscription && (
      <div className="create-parsing-form">
        <Form onSubmit={() => {}} testID="create-parsing-form-overlay">
          <Overlay.Header title="Define Data Parsing Rules"></Overlay.Header>
          <Overlay.Body>
            <Heading
              element={HeadingElement.H5}
              weight={FontWeight.Regular}
              className="create-parsing-form__text"
            >
              Specify the format of your messages and define rules to parse it
              into line protocol.
            </Heading>
            <Grid>
              <Grid.Row>
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
                      active={parsing === 'lineprotocol'}
                      onClick={() => {
                        setParsing('lineprotocol')
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
                      active={parsing === 'json'}
                      onClick={() => {
                        setParsing('json')
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
                      active={parsing === 'string'}
                      onClick={() => {
                        setParsing('string')
                      }}
                      value={null}
                      titleText="None"
                      disabled={false}
                    >
                      STRING
                    </SelectGroup.Option>
                  </SelectGroup>
                </Grid.Column>
                {parsing === 'lineprotocol' && <LineProtocolForm />}
                {parsing === 'json' && (
                  <JsonParsingForm
                    formContent={currentSubscription}
                    updateForm={updateForm}
                  />
                )}
                {parsing === 'string' && (
                  <StringParsingForm
                    formContent={currentSubscription}
                    updateForm={updateForm}
                  />
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
              titleText="Back to broker form"
              type={ButtonType.Button}
              testID="create-parsing-form--cancel"
            />
            <Button
              type={ButtonType.Button}
              text={edit ? 'Submit' : 'Edit'}
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
