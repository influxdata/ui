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
  Icon,
  IconFont,
  Heading,
  HeadingElement,
  FontWeight,
  AlignItems,
  ComponentSize,
  FlexDirection,
  FlexBox,
} from '@influxdata/clockface'
import CloudUpgradeButton from 'src/shared/components/CloudUpgradeButton'

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
  formContent: Subscription
  setFormActive: (string) => void
  updateForm: (any) => void
  setFormComplete: (any) => void
  showUpgradeButton: boolean
}

const ParsingForm: FC<Props> = ({
  formContent,
  setFormActive,
  updateForm,
  setFormComplete,
  showUpgradeButton,
}) => {
  const history = useHistory()
  const org = useSelector(getOrg)
  const [parsing, setParsing] = useState('lineprotocol')
  useEffect(() => {
    updateForm({...formContent, dataFormat: parsing})
  }, [parsing])
  return (
    formContent && (
      <div className="create-parsing-form">
        <Form onSubmit={() => {}} testID="create-parsing-form-overlay">
          <Overlay.Header title="Define Data Parsing Rules">
            {showUpgradeButton && (
              <FlexBox
                alignItems={AlignItems.Center}
                direction={FlexDirection.Row}
                margin={ComponentSize.Medium}
                className="create-parsing-form__premium-container"
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
                    formContent={formContent}
                    updateForm={updateForm}
                  />
                )}
                {parsing === 'string' && (
                  <StringParsingForm
                    formContent={formContent}
                    updateForm={updateForm}
                  />
                )}
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
              titleText="Back to broker form"
              type={ButtonType.Button}
              testID="create-parsing-form--cancel"
            />
            <Button
              text="Back"
              color={ComponentColor.Secondary}
              onClick={() => {
                setFormActive('subscription')
              }}
              titleText="Back"
              type={ButtonType.Button}
              testID="create-parsing-form--back"
            />
            {showUpgradeButton ? (
              <CloudUpgradeButton className="create-parsing-form__upgrade-button" />
            ) : (
              <Button
                text={'Next'}
                color={ComponentColor.Success}
                type={ButtonType.Button}
                onClick={() => {
                  setFormComplete(true)
                }}
                testID="create-parsing-form--submit"
                status={ComponentStatus.Default}
              />
            )}
          </Overlay.Footer>
        </Form>
      </div>
    )
  )
}
export default ParsingForm
