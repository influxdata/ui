// Libraries
import React, {FC, useState, useContext, useEffect} from 'react'
import {useSelector} from 'react-redux'
import {useParams} from 'react-router-dom'

// Components
import {
  Page,
  SpinnerContainer,
  TechnoSpinner,
  SubwayNav,
} from '@influxdata/clockface'
import ParsingDetails from 'src/writeData/subscriptions/components/ParsingDetails'
import SubscriptionDetails from 'src/writeData/subscriptions/components/SubscriptionDetails'
import GetResources from 'src/resources/components/GetResources'
import BrokerDetails from 'src/writeData/subscriptions/components/BrokerDetails'

// Contexts
import {
  SubscriptionUpdateProvider,
  SubscriptionUpdateContext,
} from 'src/writeData/subscriptions/context/subscription.update'
import {WriteDataDetailsContext} from 'src/writeData/components/WriteDataDetailsContext'
import WriteDataDetailsProvider from 'src/writeData/components/WriteDataDetailsContext'
import {
  SubscriptionListContext,
  SubscriptionListProvider,
} from 'src/writeData/subscriptions/context/subscription.list'

// Types
import {
  AppState,
  ResourceType,
  Bucket,
  StepsStatus,
  CompletedSteps,
  Steps,
} from 'src/types'

// Utils
import {getAll} from 'src/resources/selectors'

// Graphics
import {FormLogo} from 'src/writeData/subscriptions/graphics/FormLogo'

// Styles
import 'src/writeData/subscriptions/components/DetailsSubscriptionPage.scss'
import {event} from 'src/cloud/utils/reporting'
import {
  DEFAULT_COMPLETED_STEPS,
  DEFAULT_STEPS_STATUS,
  getActiveStep,
  getFormStatus,
  SUBSCRIPTION_NAVIGATION_STEPS,
} from '../utils/form'

const DetailsSubscriptionPage: FC = () => {
  const [active, setFormActive] = useState<Steps>(Steps.BrokerForm)
  const {
    currentSubscription,
    loading,
    saveForm,
    updateForm,
    setStatus,
  } = useContext(SubscriptionUpdateContext)
  const {change} = useContext(SubscriptionListContext)
  const {id} = useParams<{id: string}>()
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

  const stepsWithIsCompletedStatus = SUBSCRIPTION_NAVIGATION_STEPS.map(step => {
    return {...step, isComplete: completedSteps[step.type]}
  })

  useEffect(() => {
    setCompletedSteps({
      [Steps.BrokerForm]: stepsStatus.brokerStepCompleted === 'true',
      [Steps.SubscriptionForm]:
        stepsStatus.subscriptionStepCompleted === 'true',
      [Steps.ParsingForm]: stepsStatus.parsingStepCompleted === 'true',
    })
  }, [stepsStatus])

  useEffect(() => {
    change(id)
  }, [id, change])
  const [isEditEnabled, setEditStatus] = useState(false)

  useEffect(() => {
    setStepsStatus(getFormStatus(active, currentSubscription))
  }, [currentSubscription, active])

  const handleClick = (step: number) => {
    event(
      'subway navigation clicked',
      {...stepsStatus},
      {feature: 'subscriptions'}
    )
    document
      .getElementById(stepsWithIsCompletedStatus[step - 1].type)
      ?.scrollIntoView({behavior: 'smooth', block: 'center'})
    setFormActive(stepsWithIsCompletedStatus[step - 1].type as Steps)
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
            className="subscription-details-page"
          >
            <div className="subscription-details-page__progress">
              <SubwayNav
                currentStep={getActiveStep(active)}
                onStepClick={handleClick}
                navigationSteps={stepsWithIsCompletedStatus}
                settingUpIcon={FormLogo}
                settingUpText="MQTT Connector"
                settingUpHeader={currentSubscription.name}
                showCheckmark={isEditEnabled}
              />
            </div>
            <BrokerDetails
              currentSubscription={currentSubscription}
              updateForm={updateForm}
              edit={isEditEnabled}
              setEdit={setEditStatus}
              loading={loading}
              setStatus={setStatus}
              saveForm={saveForm}
            />
            <SubscriptionDetails
              currentSubscription={currentSubscription}
              updateForm={updateForm}
              buckets={buckets}
              bucket={bucket}
              edit={isEditEnabled}
            />
            <ParsingDetails
              currentSubscription={currentSubscription}
              updateForm={updateForm}
              edit={isEditEnabled}
            />
          </Page.Contents>
        </SpinnerContainer>
      </Page>
    </GetResources>
  )
}

export default () => (
  <SubscriptionListProvider>
    <SubscriptionUpdateProvider>
      <WriteDataDetailsProvider>
        <DetailsSubscriptionPage />
      </WriteDataDetailsProvider>
    </SubscriptionUpdateProvider>
  </SubscriptionListProvider>
)
