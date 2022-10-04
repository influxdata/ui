// Libraries
import React, {FC, useContext} from 'react'
import {useHistory} from 'react-router-dom'
import {useSelector} from 'react-redux'

// Components
import {
  Button,
  Form,
  Overlay,
  ButtonType,
  ComponentColor,
  ComponentStatus,
  Heading,
  HeadingElement,
  FontWeight,
  SpinnerContainer,
  TechnoSpinner,
  FlexBox,
  FlexDirection,
  ComponentSize,
  JustifyContent,
} from '@influxdata/clockface'
import {StatusHeader} from 'src/writeData/subscriptions/components/StatusHeader'
import {BrokerFormContent} from 'src/writeData/subscriptions/components/BrokerFormContent'

// Utils
import {getOrg} from 'src/organizations/selectors'
import {event} from 'src/cloud/utils/reporting'
import {AppSettingContext} from 'src/shared/contexts/app'
import {checkRequiredFields} from 'src/writeData/subscriptions/utils/form'
import {PROJECT_NAME, PROJECT_NAME_PLURAL} from 'src/flows'

// Types
import {SUBSCRIPTIONS, LOAD_DATA} from 'src/shared/constants/routes'
import {Subscription} from 'src/types/subscriptions'

// Styles
import 'src/writeData/subscriptions/components/BrokerDetails.scss'

interface Props {
  currentSubscription: Subscription
  updateForm: (any) => void
  edit: boolean
  setEdit: (any) => void
  loading: any
  saveForm: (any) => void
  setStatus: (any) => void
  onFocus?: () => void
}

const BrokerDetails: FC<Props> = ({
  currentSubscription,
  updateForm,
  edit,
  setEdit,
  loading,
  saveForm,
  setStatus,
  onFocus,
}) => {
  const history = useHistory()
  const org = useSelector(getOrg)
  const {navbarMode} = useContext(AppSettingContext)
  const requiredFields = checkRequiredFields(currentSubscription)
  const navbarOpen = navbarMode === 'expanded'

  return (
    <div
      className="update-broker-form"
      id="broker"
      onFocus={onFocus}
      tabIndex={-1}
    >
      <SpinnerContainer spinnerComponent={<TechnoSpinner />} loading={loading}>
        <Form onSubmit={() => {}} testID="update-broker-form-overlay">
          <div
            className="update-broker-form__fixed"
            style={{
              width: navbarOpen ? '61%' : '69%',
            }}
          >
            <FlexBox
              className="update-broker-form__fixed__broker-buttons"
              direction={FlexDirection.Row}
              margin={ComponentSize.Medium}
              justifyContent={JustifyContent.SpaceBetween}
            >
              <StatusHeader
                currentSubscription={currentSubscription}
                setStatus={setStatus}
              />
              <div>
                <Button
                  text="Close"
                  color={ComponentColor.Tertiary}
                  onClick={() => {
                    event(
                      'close button clicked',
                      {},
                      {feature: 'subscriptions'}
                    )
                    history.push(
                      `/orgs/${org.id}/${LOAD_DATA}/${SUBSCRIPTIONS}`
                    )
                  }}
                  titleText="Cancel update of Subscription and return to list"
                  type={ButtonType.Button}
                  testID="update-sub-form--cancel"
                />
                <Button
                  text={edit ? 'Cancel' : 'Edit'}
                  color={ComponentColor.Secondary}
                  onClick={() => {
                    event('edit button clicked', {}, {feature: 'subscriptions'})
                    setEdit(!edit)
                  }}
                  type={ButtonType.Button}
                  titleText="Edit"
                  testID="update-sub-form--edit"
                />
                {edit ? (
                  <Button
                    type={ButtonType.Button}
                    text="Save Changes"
                    color={ComponentColor.Success}
                    onClick={() => {
                      saveForm(currentSubscription)
                    }}
                    testID="update-sub-form--submit"
                    status={
                      requiredFields
                        ? ComponentStatus.Default
                        : ComponentStatus.Disabled
                    }
                  />
                ) : (
                  <Button
                    text="View Data"
                    color={ComponentColor.Success}
                    onClick={() => {
                      event(
                        'view data button clicked',
                        {},
                        {feature: 'subscriptions'}
                      )
                      history.push(
                        currentSubscription.notebookID
                          ? `/orgs/${
                              org.id
                            }/${PROJECT_NAME_PLURAL.toLowerCase()}/${
                              currentSubscription.notebookID
                            }`
                          : `/${PROJECT_NAME.toLowerCase()}/from/subscription/${
                              currentSubscription.id
                            }`
                      )
                    }}
                    type={ButtonType.Button}
                    testID="update-broker-form--view-data"
                    status={ComponentStatus.Default}
                  />
                )}
              </div>
            </FlexBox>
          </div>
          <Overlay.Body>
            <Heading
              element={HeadingElement.H3}
              weight={FontWeight.Bold}
              className="update-broker-form__header"
            >
              Broker details
            </Heading>
            {edit && (
              <p className="update-broker-form__link">
                Reference our{' '}
                <a
                  href="https://docs.influxdata.com/influxdb/cloud/write-data/no-code/load-data/?t=JSON#set-up-a-native-subscription"
                  target="_blank"
                  rel="noreferrer"
                >
                  native subscription documentation
                </a>{' '}
                for configuration options.
              </p>
            )}
            <BrokerFormContent
              formContent={currentSubscription}
              updateForm={updateForm}
              className="update"
              edit={edit}
            />
          </Overlay.Body>
          <div className="update-broker-form__line"></div>
        </Form>
      </SpinnerContainer>
    </div>
  )
}
export default BrokerDetails
