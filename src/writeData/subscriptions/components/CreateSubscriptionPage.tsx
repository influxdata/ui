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
import {getQuartzMe} from 'src/me/selectors'
import {event} from 'src/cloud/utils/reporting'
import {
  DEFAULT_COMPLETED_STEPS,
  DEFAULT_STEPS_STATUS,
  getActiveStep,
  getFormStatus,
  SUBSCRIPTION_NAVIGATION_STEPS,
} from 'src/writeData/subscriptions/utils/form'

// Styles
import 'src/writeData/subscriptions/components/CreateSubscriptionPage.scss'

const CreateSubscriptionPage: FC = () => {
  const [active, setFormActive] = useState<Steps>(Steps.BrokerForm)
  const {formContent, saveForm, updateForm, loading} = useContext(
    SubscriptionCreateContext
  )
  const quartzMe = useSelector(getQuartzMe)
  const buckets = useSelector((state: AppState) =>
    getAll<Bucket>(state, ResourceType.Buckets).filter(b => b.type === 'user')
  )
  const {bucket} = useContext(WriteDataDetailsContext)
  const [completedSteps, setCompletedSteps] = useState<CompletedSteps>(
    DEFAULT_COMPLETED_STEPS
  )
  const [stepsStatus, setStepsStatus] = useState<StepsStatus>(
    DEFAULT_STEPS_STATUS
  )

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
      {userAccountType: quartzMe?.accountType ?? 'unknown'},
      {feature: 'subscriptions'}
    )
  }, [quartzMe?.accountType])

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
                settingUpText="MQTT Subscriber"
                showCheckmark={true}
              />
            </div>
            <BrokerForm
              formContent={formContent}
              updateForm={updateForm}
              saveForm={saveForm}
              onFocus={() => setFormActive(Steps.BrokerForm)}
            />
            <SubscriptionForm
              formContent={formContent}
              updateForm={updateForm}
              buckets={buckets}
              bucket={bucket}
              onFocus={() => setFormActive(Steps.SubscriptionForm)}
            />
            <ParsingForm
              formContent={formContent}
              updateForm={updateForm}
              onFocus={() => setFormActive(Steps.ParsingForm)}
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
