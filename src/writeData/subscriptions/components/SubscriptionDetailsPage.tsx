// Libraries
import React, {FC, useState, useContext, useEffect} from 'react'
import {useSelector} from 'react-redux'
import {useParams} from 'react-router-dom'

// Components
import {
  Page,
  FlexBox,
  JustifyContent,
  Heading,
  HeadingElement,
  FontWeight,
  AlignItems,
  ComponentSize,
  FlexDirection,
  SpinnerContainer,
  TechnoSpinner,
} from '@influxdata/clockface'
import BrokerDetails from 'src/writeData/subscriptions/components/BrokerDetails'
import ParsingDetails from 'src/writeData/subscriptions/components/ParsingDetails'
import SubscriptionDetails from 'src/writeData/subscriptions/components/SubscriptionDetails'
import CloudUpgradeButton from 'src/shared/components/CloudUpgradeButton'
import GetResources from 'src/resources/components/GetResources'
import ProgressMenuItem from 'src/writeData/subscriptions/components/ProgressMenuItem'

// // Graphics
import FormLogo from 'src/writeData/subscriptions/graphics/form-logo.svg'

// Contexts
import {
  SubscriptionUpdateProvider,
  SubscriptionUpdateContext,
} from 'src/writeData/subscriptions/context/subscription.update'
import {WriteDataDetailsContext} from 'src/writeData/components/WriteDataDetailsContext'
import WriteDataDetailsProvider from 'src/writeData/components/WriteDataDetailsContext'

// Types
import {AppState, ResourceType, Bucket} from 'src/types'

// Utils
import {getAll} from 'src/resources/selectors'

// // Actions
import {shouldShowUpgradeButton} from 'src/me/selectors'

// Styles
import 'src/writeData/subscriptions/components/CreateSubscriptionPage.scss'

import {
  SubscriptionListContext,
  SubscriptionListProvider,
} from 'src/writeData/subscriptions/context/subscription.list'

const SubscriptionDetailsPage: FC = () => {
  const brokerForm = 'broker'
  const subscriptionForm = 'subscription'
  const parsingForm = 'parsing'
  const [active, setFormActive] = useState(brokerForm)
  const {currentSubscription, loading, saveForm, updateForm} = useContext(
    SubscriptionUpdateContext
  )
  const {change} = useContext(SubscriptionListContext)
  const showUpgradeButton = useSelector(shouldShowUpgradeButton)
  const {id} = useParams<{id: string}>()
  const buckets = useSelector((state: AppState) =>
    getAll<Bucket>(state, ResourceType.Buckets).filter(b => b.type === 'user')
  )
  const {bucket} = useContext(WriteDataDetailsContext)
  useEffect(() => {
    change(id)
  }, [id, change])
  const [edit, setEdit] = useState(false)
  return (
    currentSubscription && (
      <GetResources resources={[ResourceType.Buckets]}>
        <Page>
          <SpinnerContainer
            spinnerComponent={<TechnoSpinner />}
            loading={loading}
          >
            <Page.Contents
              fullWidth={true}
              scrollable={true}
              className="create-subscription-page"
            >
              {showUpgradeButton && (
                <FlexBox
                  justifyContent={JustifyContent.FlexEnd}
                  alignItems={AlignItems.FlexEnd}
                  stretchToFitHeight={true}
                >
                  <CloudUpgradeButton />
                </FlexBox>
              )}
              {/* TODO: swap out for clockface svg when available */}
              <div className="create-subscription-page__progress">
                <FlexBox
                  alignItems={AlignItems.Center}
                  direction={FlexDirection.Row}
                  margin={ComponentSize.Large}
                  className="create-subscription-page__progress__logo"
                >
                  <img src={FormLogo} />
                  <div>
                    <Heading
                      element={HeadingElement.H5}
                      weight={FontWeight.Regular}
                      className="create-subscription-page__progress__logo--lg"
                    >
                      Setting up
                    </Heading>
                    <Heading
                      element={HeadingElement.H5}
                      weight={FontWeight.Regular}
                      className="create-subscription-page__progress__logo--sm"
                    >
                      MQTT Connector
                    </Heading>
                  </div>
                </FlexBox>
                {/* TODO: swap out for clockface component when available */}
                <div className="create-subscription-page__progress__bar">
                  <ProgressMenuItem
                    active={active}
                    type={brokerForm}
                    text="Connect To Broker"
                    icon="upload-outline"
                    setFormActive={setFormActive}
                  />
                  <ProgressMenuItem
                    active={active}
                    type={subscriptionForm}
                    text="Subscribe to Topic"
                    icon="subscribe"
                    setFormActive={setFormActive}
                  />
                  <ProgressMenuItem
                    active={active}
                    type={parsingForm}
                    text=" Define Data Parsing Rules"
                    icon="braces"
                    setFormActive={setFormActive}
                  />
                </div>
              </div>
              <div>
                Status: {currentSubscription && currentSubscription.status}
              </div>
              {active === brokerForm && (
                <BrokerDetails
                  setFormActive={setFormActive}
                  currentSubscription={currentSubscription}
                  updateForm={updateForm}
                  edit={edit}
                  setEdit={setEdit}
                />
              )}
              {active === subscriptionForm && (
                <SubscriptionDetails
                  setFormActive={setFormActive}
                  currentSubscription={currentSubscription}
                  updateForm={updateForm}
                  buckets={buckets}
                  bucket={bucket}
                  edit={edit}
                  setEdit={setEdit}
                />
              )}
              {active === parsingForm && (
                <ParsingDetails
                  currentSubscription={currentSubscription}
                  updateForm={updateForm}
                  saveForm={saveForm}
                  edit={edit}
                  setEdit={setEdit}
                />
              )}
            </Page.Contents>
          </SpinnerContainer>
        </Page>
      </GetResources>
    )
  )
}

export default () => (
  <SubscriptionListProvider>
    <SubscriptionUpdateProvider>
      <WriteDataDetailsProvider>
        <SubscriptionDetailsPage />
      </WriteDataDetailsProvider>
    </SubscriptionUpdateProvider>
  </SubscriptionListProvider>
)
