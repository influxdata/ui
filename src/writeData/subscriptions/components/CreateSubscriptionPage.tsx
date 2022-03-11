// Libraries
import React, {FC, useState, useContext} from 'react'
import {useSelector} from 'react-redux'

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
import BrokerForm from 'src/writeData/subscriptions/components/BrokerForm'
import ParsingForm from 'src/writeData/subscriptions/components/ParsingForm'
import SubscriptionForm from 'src/writeData/subscriptions/components/SubscriptionForm'
import CloudUpgradeButton from 'src/shared/components/CloudUpgradeButton'
import GetResources from 'src/resources/components/GetResources'
import ProgressMenuItem from 'src/writeData/subscriptions/components/ProgressMenuItem'

// Graphics
import FormLogo from 'src/writeData/subscriptions/graphics/form-logo.svg'

// Contexts
import {
  SubscriptionCreateContext,
  SubscriptionCreateProvider,
} from 'src/writeData/subscriptions/context/subscription.create'
import {WriteDataDetailsContext} from 'src/writeData/components/WriteDataDetailsContext'
import WriteDataDetailsProvider from 'src/writeData/components/WriteDataDetailsContext'

// Types
import {AppState, ResourceType, Bucket} from 'src/types'

// Utils
import {getAll} from 'src/resources/selectors'

// Actions
import {shouldShowUpgradeButton} from 'src/me/selectors'

// Styles
import 'src/writeData/subscriptions/components/CreateSubscriptionPage.scss'

const CreateSubscriptionPage: FC = () => {
  const [active, setFormActive] = useState('broker')
  const {formContent, setFormComplete, updateForm, loading} = useContext(
    SubscriptionCreateContext
  )
  const showUpgradeButton = useSelector(shouldShowUpgradeButton)
  const buckets = useSelector((state: AppState) =>
    getAll<Bucket>(state, ResourceType.Buckets).filter(b => b.type === 'user')
  )
  const {bucket} = useContext(WriteDataDetailsContext)
  return (
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
                  type="broker"
                  text="Connect To Broker"
                  icon="upload-outline"
                  setFormActive={setFormActive}
                />
                <ProgressMenuItem
                  active={active}
                  type="subscription"
                  text="Subscribe to Topic"
                  icon="subscribe"
                  setFormActive={setFormActive}
                />
                <ProgressMenuItem
                  active={active}
                  type="parsing"
                  text=" Define Data Parsing Rules"
                  icon="braces"
                  setFormActive={setFormActive}
                />
              </div>
            </div>
            {active === 'broker' && (
              <BrokerForm
                setFormActive={setFormActive}
                formContent={formContent}
                updateForm={updateForm}
                showUpgradeButton={showUpgradeButton}
              />
            )}
            {active === 'subscription' && (
              <SubscriptionForm
                setFormActive={setFormActive}
                formContent={formContent}
                updateForm={updateForm}
                showUpgradeButton={showUpgradeButton}
                buckets={buckets}
                bucket={bucket}
              />
            )}
            {active === 'parsing' && (
              <ParsingForm
                setFormActive={setFormActive}
                formContent={formContent}
                updateForm={updateForm}
                setFormComplete={setFormComplete}
                showUpgradeButton={showUpgradeButton}
              />
            )}
          </Page.Contents>
        </SpinnerContainer>
      </Page>
    </GetResources>
  )
}

export default () => (
  <SubscriptionCreateProvider>
    <WriteDataDetailsProvider>
      <CreateSubscriptionPage />
    </WriteDataDetailsProvider>
  </SubscriptionCreateProvider>
)
