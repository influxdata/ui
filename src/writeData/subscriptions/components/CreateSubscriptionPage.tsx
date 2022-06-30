// Libraries
import React, {FC, useState, useContext, useEffect, useCallback} from 'react'
import {useSelector} from 'react-redux'

// Components
import {
  IconFont,
  Page,
  SpinnerContainer,
  SubwayNav,
  SubwayNavModel,
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

// Types
import {AppState, ResourceType, Bucket} from 'src/types'

// Utils
import {getAll} from 'src/resources/selectors'
import {getQuartzMe} from 'src/me/selectors'
import {event} from 'src/cloud/utils/reporting'
import {
  checkRequiredJsonFields,
  checkRequiredStringFields,
} from 'src/writeData/subscriptions/utils/form'

// Styles
import 'src/writeData/subscriptions/components/CreateSubscriptionPage.scss'

interface SubscriptionNavigationModel extends SubwayNavModel {
  type: string
  // TODO: Use clockface 4.6.2
  isComplete?: boolean
}

enum Steps {
  BrokerForm = 'broker',
  SubscriptionForm = 'subscription',
  ParsingForm = 'parsing',
}

const navigationSteps: SubscriptionNavigationModel[] = [
  {
    glyph: IconFont.UploadOutline,
    name: 'Connect \n to Broker',
    type: Steps.BrokerForm,
  },
  {
    glyph: IconFont.Subscribe,
    name: 'Subscribe \n to Topic',
    type: Steps.SubscriptionForm,
  },
  {
    glyph: IconFont.Braces,
    name: 'Define Data \n Parsing Rules',
    type: Steps.ParsingForm,
  },
]

interface CompletedSteps {
  [Steps.BrokerForm]: boolean
  [Steps.SubscriptionForm]: boolean
  [Steps.ParsingForm]: boolean
}
const DEFAULT_COMPLETED_STEPS = {
  [Steps.BrokerForm]: false,
  [Steps.SubscriptionForm]: false,
  [Steps.ParsingForm]: false,
}

interface StepsStatus {
  currentStep: Steps
  clickedStep: string
  brokerStepCompleted: string
  subscriptionStepCompleted: string
  parsingStepCompleted: string
  dataFormat: string
}
const DEFAULT_STEPS_STATUS = {
  currentStep: Steps.BrokerForm,
  clickedStep: Steps.BrokerForm,
  brokerStepCompleted: 'false',
  subscriptionStepCompleted: 'false',
  parsingStepCompleted: 'false',
  dataFormat: 'not chosen yet',
}

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

  const getActiveStep = useCallback(activeForm => {
    let currentStep = 1
    navigationSteps.forEach((step, index) => {
      if (step.type === activeForm) {
        currentStep = index + 1
      }
    })
    return currentStep
  }, [])

  useEffect(() => {
    setCompletedSteps({
      [Steps.BrokerForm]: stepsStatus.brokerStepCompleted === 'true',
      [Steps.SubscriptionForm]:
        stepsStatus.subscriptionStepCompleted === 'true',
      [Steps.ParsingForm]: stepsStatus.parsingStepCompleted === 'true',
    })
  }, [stepsStatus])

  useEffect(() => {
    const status = {
      currentStep: active,
      clickedStep: navigationSteps[getActiveStep(active) - 1].type,
      brokerStepCompleted:
        formContent.name && formContent.brokerHost && formContent.brokerPort
          ? 'true'
          : 'false',
      subscriptionStepCompleted:
        formContent.topic &&
        formContent.bucket &&
        formContent.bucket !== '<BUCKET>'
          ? 'true'
          : 'false',
      parsingStepCompleted:
        formContent.dataFormat &&
        checkRequiredJsonFields(formContent) &&
        checkRequiredStringFields(formContent)
          ? 'true'
          : 'false',
      dataFormat: formContent.dataFormat ?? 'not chosen yet',
    } as StepsStatus
    setStepsStatus(status)
  }, [formContent, getActiveStep, active])

  const stepsWithIsCompletedStatus = navigationSteps.map(s => {
    return {...s, isComplete: completedSteps[s.type]}
  })

  useEffect(() => {
    event(
      'visited creation page',
      {userAccountType: quartzMe?.accountType ?? 'unknown'},
      {feature: 'subscriptions'}
    )
  }, [])

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
            className="create-subscription-page"
          >
            <div className="create-subscription-page__progress">
              <SubwayNav
                currentStep={getActiveStep(active)}
                onStepClick={handleClick}
                navigationSteps={stepsWithIsCompletedStatus}
                settingUpIcon={FormLogo}
                settingUpText="MQTT Connector"
                showCheckmark={true}
              />
            </div>
            <BrokerForm
              formContent={formContent}
              updateForm={updateForm}
              saveForm={saveForm}
            />
            <SubscriptionForm
              formContent={formContent}
              updateForm={updateForm}
              buckets={buckets}
              bucket={bucket}
            />
            <ParsingForm formContent={formContent} updateForm={updateForm} />
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
