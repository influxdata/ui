// Libraries
import React, {FC, useState, useContext, useEffect} from 'react'
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
import BrokerDetails from 'src/writeData/subscriptions/components/BrokerDetails'
import ParsingDetails from 'src/writeData/subscriptions/components/ParsingDetails'
import SubscriptionDetails from 'src/writeData/subscriptions/components/SubscriptionDetails'
import GetResources from 'src/resources/components/GetResources'
import StatusHeader from 'src/writeData/subscriptions/components/StatusHeader'

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
import {isFlagEnabled} from 'src/shared/utils/featureFlag'

// Graphics
import {FormLogo} from 'src/writeData/subscriptions/graphics/FormLogo'

// Styles
import 'src/writeData/subscriptions/components/SubscriptionDetailsPage.scss'

import {
  SubscriptionListContext,
  SubscriptionListProvider,
} from 'src/writeData/subscriptions/context/subscription.list'

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

const SubscriptionDetailsPage: FC = () => {
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

  const handleClick = (step: number) => {
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
  const singlePage = isFlagEnabled('subscriptionsSinglePage')
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
              />
            </div>
            <StatusHeader
              currentSubscription={currentSubscription}
              setStatus={setStatus}
            />
            {active === Steps.BrokerForm && (
              <BrokerDetails
                currentSubscription={currentSubscription}
                updateForm={updateForm}
                edit={edit}
                setEdit={setEdit}
                loading={loading}
                singlePage={singlePage}
                setStatus={setStatus}
                saveForm={saveForm}
                setFormActive={setFormActive}
              />
            )}
            {active === Steps.SubscriptionForm && (
              <SubscriptionDetails
                setFormActive={setFormActive}
                currentSubscription={currentSubscription}
                updateForm={updateForm}
                buckets={buckets}
                bucket={bucket}
                edit={edit}
                setEdit={setEdit}
                singlePage={singlePage}
              />
            )}
            {active === Steps.ParsingForm && (
              <ParsingDetails
                currentSubscription={currentSubscription}
                updateForm={updateForm}
                saveForm={saveForm}
                edit={edit}
                setEdit={setEdit}
                singlePage={singlePage}
              />
            )}
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
        <SubscriptionDetailsPage />
      </WriteDataDetailsProvider>
    </SubscriptionUpdateProvider>
  </SubscriptionListProvider>
)
