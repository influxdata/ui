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
  IconFont,
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
import {
  SubwayNavigation,
  SubwayNavigationModel,
} from 'src/clockface/components/SubwayNavigation'

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
import {event} from 'src/cloud/utils/reporting'

// Actions
import {shouldShowUpgradeButton} from 'src/me/selectors'

// Styles
import 'src/writeData/subscriptions/components/CreateSubscriptionPage.scss'


interface SubscriptionNavigationModel extends SubwayNavigationModel {
  type: string
}

const navigationSteps: SubscriptionNavigationModel = [
  {
    glyph: IconFont.UploadOutline,
    name: 'Connect to Broker',
    type: 'broker',
  },
  {
    glyph: IconFont.Subscribe,
    name: 'Subscribe to Topic',
    type: 'subscription',
  },
  {
    glyph: IconFont.Braces,
    name: 'Define Data Parsing Rules',
    type: 'parsing',
  },
]

const CreateSubscriptionPage: FC = () => {
  const brokerForm = 'broker'
  const subscriptionForm = 'subscription'
  const parsingForm = 'parsing'
  const [active, setFormActive] = useState(brokerForm)
  const {formContent, saveForm, updateForm, loading} = useContext(
    SubscriptionCreateContext
  )
  const showUpgradeButton = useSelector(shouldShowUpgradeButton)
  const buckets = useSelector((state: AppState) =>
    getAll<Bucket>(state, ResourceType.Buckets).filter(b => b.type === 'user')
  )
  const {bucket} = useContext(WriteDataDetailsContext)

  const handleClick = (step: number) => {
    console.log({step})
    console.log({active})
    setFormActive(navigationSteps[step - 1].type)
  }

  const getActiveStep = (activeForm) => {
    let currentStep = 1
    navigationSteps.forEach((step, index) => {
      if (step.type === activeForm) {
        currentStep = index + 1
      }
    })
    return currentStep
  }

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
                <CloudUpgradeButton
                  metric={() => {
                    event('subscription upgrade')
                  }}
                />
              </FlexBox>
            )}
            {/* TODO: swap out for clockface svg when available */}
            <div className="create-subscription-page__progress">
              <SubwayNavigation
                  currentStep={getActiveStep(active)}
                  onStepClick={handleClick}
                  navigationSteps={navigationSteps}
                  settingUpIcon={FormLogo}
                  settingUpText="MQTT Connector"
                />
              {/* TODO: swap out for clockface component when available */}
              <div className="create-subscription-page__progress__bar">

                {/*<ProgressMenuItem
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
                />*/}
              </div>
            </div>
            {active === brokerForm && (
              <BrokerForm
                setFormActive={setFormActive}
                formContent={formContent}
                updateForm={updateForm}
                showUpgradeButton={showUpgradeButton}
              />
            )}
            {active === subscriptionForm && (
              <SubscriptionForm
                setFormActive={setFormActive}
                formContent={formContent}
                updateForm={updateForm}
                showUpgradeButton={showUpgradeButton}
                buckets={buckets}
                bucket={bucket}
              />
            )}
            {active === parsingForm && (
              <ParsingForm
                setFormActive={setFormActive}
                formContent={formContent}
                updateForm={updateForm}
                saveForm={saveForm}
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
