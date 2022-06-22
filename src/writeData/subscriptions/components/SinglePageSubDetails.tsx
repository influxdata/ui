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
import ParsingDetails from 'src/writeData/subscriptions/components/ParsingDetails'
import SubscriptionDetails from 'src/writeData/subscriptions/components/SubscriptionDetails'
import GetResources from 'src/resources/components/GetResources'
import SinglePageBrokerDetails from 'src/writeData/subscriptions/components/SinglePageBrokerDetails'

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
import {AppState, ResourceType, Bucket} from 'src/types'

// Utils
import {getAll} from 'src/resources/selectors'
import {isFlagEnabled} from 'src/shared/utils/featureFlag'

// Graphics
import {FormLogo} from 'src/writeData/subscriptions/graphics/FormLogo'

// Styles
import 'src/writeData/subscriptions/components/SubscriptionDetailsPage.scss'

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

const SinglePageSubDetails: FC = () => {
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
            <div
              className={
                singlePage
                  ? 'subscription-details-page__progress--fixed'
                  : 'subscription-details-page__progress'
              }
            >
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
            <SinglePageBrokerDetails
              currentSubscription={currentSubscription}
              updateForm={updateForm}
              edit={edit}
              setEdit={setEdit}
              loading={loading}
              setStatus={setStatus}
              saveForm={saveForm}
            />
            <SubscriptionDetails
              setFormActive={setFormActive}
              currentSubscription={currentSubscription}
              updateForm={updateForm}
              buckets={buckets}
              bucket={bucket}
              edit={edit}
              setEdit={setEdit}
              singlePage={singlePage}
              setStatus={setStatus}
              saveForm={saveForm}
              active={active}
            />
            <ParsingDetails
              currentSubscription={currentSubscription}
              updateForm={updateForm}
              saveForm={saveForm}
              edit={edit}
              setEdit={setEdit}
              singlePage={singlePage}
              setStatus={setStatus}
              active={active}
              setFormActive={setFormActive}
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
        <SinglePageSubDetails />
      </WriteDataDetailsProvider>
    </SubscriptionUpdateProvider>
  </SubscriptionListProvider>
)
