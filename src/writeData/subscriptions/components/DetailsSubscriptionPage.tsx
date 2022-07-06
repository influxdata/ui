// Libraries
import React, {FC, useState, useContext, useEffect, useCallback} from 'react'
import {useSelector} from 'react-redux'
import {useParams} from 'react-router-dom'

// Components
import {
  Page,
  SpinnerContainer,
  TechnoSpinner,
  IconFont,
  SubwayNav,
  SubwayNavModel,
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
import {AppState, ResourceType, Bucket, StepsStatus} from 'src/types'

// Utils
import {getAll} from 'src/resources/selectors'

// Graphics
import {FormLogo} from 'src/writeData/subscriptions/graphics/FormLogo'

// Styles
import 'src/writeData/subscriptions/components/DetailsSubscriptionPage.scss'
import {event} from 'src/cloud/utils/reporting'
import {checkRequiredJsonFields, checkRequiredStringFields} from '../utils/form'

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
  useEffect(() => {
    change(id)
  }, [id, change])
  const [edit, setEdit] = useState(false)

  const getActiveStep = useCallback(activeForm => {
    let currentStep = 1
    navigationSteps.forEach((step, index) => {
      if (step.type === activeForm) {
        currentStep = index + 1
      }
    })
    return currentStep
  }, [])

  const handleClick = (step: number) => {
    const status = {
      currentStep: active,
      clickedStep: navigationSteps[getActiveStep(active) - 1].type,
      brokerStepCompleted:
        currentSubscription.name &&
        currentSubscription.brokerHost &&
        currentSubscription.brokerPort
          ? 'true'
          : 'false',
      subscriptionStepCompleted:
        currentSubscription.topic &&
        currentSubscription.bucket &&
        currentSubscription.bucket !== '<BUCKET>'
          ? 'true'
          : 'false',
      parsingStepCompleted:
        currentSubscription.dataFormat &&
        checkRequiredJsonFields(currentSubscription) &&
        checkRequiredStringFields(currentSubscription)
          ? 'true'
          : 'false',
      dataFormat: currentSubscription.dataFormat ?? 'not chosen yet',
    } as StepsStatus
    event('subway navigation clicked', {...status}, {feature: 'subscriptions'})
    document
      .getElementById(navigationSteps[step - 1].type)
      ?.scrollIntoView({behavior: 'smooth', block: 'center'})
    setFormActive(navigationSteps[step - 1].type as Steps)
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
                navigationSteps={navigationSteps}
                settingUpIcon={FormLogo}
                settingUpText="MQTT Connector"
                settingUpHeader={currentSubscription.name}
                showCheckmark={false}
              />
            </div>
            <BrokerDetails
              currentSubscription={currentSubscription}
              updateForm={updateForm}
              edit={edit}
              setEdit={setEdit}
              loading={loading}
              setStatus={setStatus}
              saveForm={saveForm}
            />
            <SubscriptionDetails
              currentSubscription={currentSubscription}
              updateForm={updateForm}
              buckets={buckets}
              bucket={bucket}
              edit={edit}
            />
            <ParsingDetails
              currentSubscription={currentSubscription}
              updateForm={updateForm}
              edit={edit}
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
