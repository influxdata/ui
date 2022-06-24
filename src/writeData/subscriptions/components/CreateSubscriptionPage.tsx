// Libraries
import React, {FC, useState, useContext, useEffect} from 'react'
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
      {
        currentStep: active,
        clickedStep: navigationSteps[step - 1].type,
        brokerStepCompleted:
          formContent.name && formContent.brokerHost && formContent.brokerPort
            ? 'true'
            : 'false',
        subscriptionStepCompleted:
          formContent.topic && formContent.bucket ? 'true' : 'false',
        parsingStepCompleted:
          formContent.dataFormat &&
          checkRequiredJsonFields(formContent) &&
          checkRequiredStringFields(formContent)
            ? 'true'
            : 'false',
        dataFormat: formContent.dataFormat ?? 'not chosen yet',
      },
      {feature: 'subscriptions'}
    )
    document
      .getElementById(navigationSteps[step - 1].type)
      ?.scrollIntoView({behavior: 'smooth', block: 'center'})
    setFormActive(navigationSteps[step - 1].type as Steps)
  }

  const getActiveStep = activeForm => {
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
            <div className="create-subscription-page__progress">
              <SubwayNav
                currentStep={getActiveStep(active)}
                onStepClick={handleClick}
                navigationSteps={navigationSteps}
                settingUpIcon={FormLogo}
                settingUpText="MQTT Connector"
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
