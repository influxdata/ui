// Libraries
import React, {FC, useState, useContext, useEffect} from 'react'
import {useSelector} from 'react-redux'

// Components
import {
  Page,
  SpinnerContainer,
  SubwayNav,
  TechnoSpinner,
} from '@influxdata/clockface'
import BrokerForm from 'src/writeData/subscriptions/components/BrokerForm'
import ParsingForm from 'src/writeData/subscriptions/components/ParsingForm'
import SubscriptionForm from 'src/writeData/subscriptions/components/SubscriptionForm'
import GetResources from 'src/resources/components/GetResources'

// Graphics
import {FormLogo} from 'src/writeData/subscriptions/graphics/FormLogo'

// Contexts
import {
  SubscriptionCreateContext,
  SubscriptionCreateProvider,
} from 'src/writeData/subscriptions/context/subscription.create'
import {WriteDataDetailsContext} from 'src/writeData/components/WriteDataDetailsContext'
import WriteDataDetailsProvider from 'src/writeData/components/WriteDataDetailsContext'
import {AppSettingProvider} from 'src/shared/contexts/app'

// Selectors
import {selectCurrentIdentity} from 'src/identity/selectors'

// Types
import {
  AppState,
  ResourceType,
  Bucket,
  Steps,
  CompletedSteps,
  StepsStatus,
} from 'src/types'

// Utils
import {getAll} from 'src/resources/selectors'
import {shouldShowUpgradeButton} from 'src/me/selectors'
import {event} from 'src/cloud/utils/reporting'
import {
  DEFAULT_COMPLETED_STEPS,
  DEFAULT_STEPS_STATUS,
  getActiveStep,
  getFormStatus,
  SUBSCRIPTION_NAVIGATION_STEPS,
} from 'src/writeData/subscriptions/utils/form'
import {isFlagEnabled} from 'src/shared/utils/featureFlag'

// Styles
import 'src/writeData/subscriptions/components/CreateSubscriptionPage.scss'

const CreateSubscriptionPage: FC = () => {
  const [active, setFormActive] = useState<Steps>(Steps.BrokerForm)
  const {formContent, saveForm, updateForm, loading} = useContext(
    SubscriptionCreateContext
  )
  const {account} = useSelector(selectCurrentIdentity)

  const buckets = useSelector((state: AppState) =>
    getAll<Bucket>(state, ResourceType.Buckets).filter(b => b.type === 'user')
  )
  const {bucket} = useContext(WriteDataDetailsContext)
  const [completedSteps, setCompletedSteps] = useState<CompletedSteps>(
    DEFAULT_COMPLETED_STEPS
  )
  const [stepsStatus, setStepsStatus] =
    useState<StepsStatus>(DEFAULT_STEPS_STATUS)

  useEffect(() => {
    setCompletedSteps({
      [Steps.BrokerForm]: stepsStatus.brokerStepCompleted === 'true',
      [Steps.SubscriptionForm]:
        stepsStatus.subscriptionStepCompleted === 'true',
      [Steps.ParsingForm]: stepsStatus.parsingStepCompleted === 'true',
    })
  }, [stepsStatus])

  useEffect(() => {
    setStepsStatus(getFormStatus(active, formContent))
  }, [formContent, active])

  const stepsWithIsCompletedStatus = SUBSCRIPTION_NAVIGATION_STEPS.map(step => {
    return {...step, isComplete: completedSteps[step.type]}
  })

  useEffect(() => {
    event(
      'visited creation page',
      {userAccountType: account.type ?? 'unknown'},
      {feature: 'subscriptions'}
    )
  }, [account.type])

  const handleClick = (step: number) => {
    event(
      'subway navigation clicked',
      {...stepsStatus},
      {feature: 'subscriptions'}
    )
    document
      .getElementById(SUBSCRIPTION_NAVIGATION_STEPS[step - 1].type)
      ?.scrollIntoView({behavior: 'smooth', block: 'center'})
    setFormActive(SUBSCRIPTION_NAVIGATION_STEPS[step - 1].type as Steps)
    setCompletedSteps({
      [Steps.BrokerForm]: stepsStatus.brokerStepCompleted === 'true',
      [Steps.SubscriptionForm]:
        stepsStatus.subscriptionStepCompleted === 'true',
      [Steps.ParsingForm]: stepsStatus.parsingStepCompleted === 'true',
    })
  }

  // enabled for PAYG accounts and specific free accounts where a flag is enabled
  const showUpgradeButton =
    useSelector(shouldShowUpgradeButton) &&
    !isFlagEnabled('enableFreeSubscriptions')

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
            <div className="create-subscription-page__progress">
              <SubwayNav
                currentStep={getActiveStep(active)}
                onStepClick={handleClick}
                navigationSteps={stepsWithIsCompletedStatus}
                settingUpIcon={FormLogo}
                settingUpText="Native MQTT"
                showCheckmark={true}
              />
            </div>
            <BrokerForm
              formContent={formContent}
              updateForm={updateForm}
              saveForm={saveForm}
              onFocus={() => setFormActive(Steps.BrokerForm)}
              showUpgradeButton={showUpgradeButton}
            />
            <SubscriptionForm
              formContent={formContent}
              updateForm={updateForm}
              buckets={buckets}
              bucket={bucket}
              onFocus={() => setFormActive(Steps.SubscriptionForm)}
              showUpgradeButton={showUpgradeButton}
            />
            <ParsingForm
              formContent={formContent}
              updateForm={updateForm}
              onFocus={() => setFormActive(Steps.ParsingForm)}
              showUpgradeButton={showUpgradeButton}
            />
          </Page.Contents>
        </SpinnerContainer>
      </Page>
    </GetResources>
  )
}

export default () => (
  <AppSettingProvider>
    <SubscriptionCreateProvider>
      <WriteDataDetailsProvider>
        <CreateSubscriptionPage />
      </WriteDataDetailsProvider>
    </SubscriptionCreateProvider>
  </AppSettingProvider>
)
