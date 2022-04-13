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
  ButtonType,
  ComponentColor,
  ComponentStatus,
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
import ParsingDetailsEdit from 'src/writeData/subscriptions/components/ParsingDetailsEdit'
import StringParsingForm from 'src/writeData/subscriptions/components/StringParsingForm'
import JsonParsingForm from 'src/writeData/subscriptions/components/JsonParsingForm'
import LineProtocolForm from 'src/writeData/subscriptions/components/LineProtocolForm'

// Utils
import {getOrg} from 'src/organizations/selectors'
import {event} from 'src/cloud/utils/reporting'

// Types
import {SUBSCRIPTIONS, LOAD_DATA} from 'src/shared/constants/routes'
import {Subscription} from 'src/types/subscriptions'

// Styles
import 'src/writeData/subscriptions/components/ParsingForm.scss'

interface Props {
  formContent: Subscription
  setFormActive: (string) => void
  updateForm: (any) => void
  saveForm: (any) => void
  showUpgradeButton: boolean
}

const ParsingForm: FC<Props> = ({
  formContent,
  setFormActive,
  updateForm,
  saveForm,
  showUpgradeButton,
}) => {
  const history = useHistory()
  const org = useSelector(getOrg)
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
                <ParsingDetailsEdit
                  currentSubscription={formContent}
                  updateForm={updateForm}
                  className="create"
                />
                {formContent.dataFormat === 'lineprotocol' && (
                  <LineProtocolForm />
                )}
                {formContent.dataFormat === 'json' && (
                  <JsonParsingForm
                    formContent={formContent}
                    updateForm={updateForm}
                  />
                )}
                {formContent.dataFormat === 'string' && (
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
                event(
                  'creation canceled',
                  {step: 'parsing', dataFormat: formContent.dataFormat},
                  {feature: 'subscriptions'}
                )
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
                event(
                  'back clicked',
                  {step: 'parsing', dataFormat: formContent.dataFormat},
                  {feature: 'subscriptions'}
                )
                setFormActive('subscription')
              }}
              titleText="Back"
              type={ButtonType.Button}
              testID="create-parsing-form--back"
            />
            {showUpgradeButton ? (
              <CloudUpgradeButton
                className="create-parsing-form__upgrade-button"
                metric={() => {
                  event('parsing form upgrade')
                }}
              />
            ) : (
              <Button
                text="Save Subscription"
                color={ComponentColor.Success}
                type={ButtonType.Button}
                onClick={() => {
                  event(
                    'save clicked',
                    {step: 'parsing', dataFormat: formContent.dataFormat},
                    {feature: 'subscriptions'}
                  )
                  saveForm(formContent)
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
