// Libraries
import React, {FC, useState, useContext, useEffect} from 'react'
import {useSelector} from 'react-redux'

// Components
import {
  AlignItems,
  FlexBox,
  IconFont,
  JustifyContent,
  Page,
  SpinnerContainer,
  SubwayNav,
  SubwayNavModel,
  TechnoSpinner,
} from '@influxdata/clockface'
import BrokerForm from 'src/writeData/subscriptions/components/BrokerForm'
import ParsingForm from 'src/writeData/subscriptions/components/ParsingForm'
import SubscriptionForm from 'src/writeData/subscriptions/components/SubscriptionForm'
import CloudUpgradeButton from 'src/shared/components/CloudUpgradeButton'
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
import {event} from 'src/cloud/utils/reporting'
import {isFlagEnabled} from 'src/shared/utils/featureFlag'
import {
  getDataLayerIdentity,
  getExperimentVariantId,
} from 'src/cloud/utils/experiments'

// Constants
import {CREDIT_250_EXPERIMENT_ID} from 'src/shared/constants'

// Actions
import {shouldShowUpgradeButton, getQuartzMe} from 'src/me/selectors'

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
  const showUpgradeButton = useSelector(shouldShowUpgradeButton)
  const {accountType} = useSelector(getQuartzMe)
  const buckets = useSelector((state: AppState) =>
    getAll<Bucket>(state, ResourceType.Buckets).filter(b => b.type === 'user')
  )
  const {bucket} = useContext(WriteDataDetailsContext)

  useEffect(() => {
    event(
      'visited creation page',
      {userAccountType: accountType},
      {feature: 'subscriptions'}
    )
  }, [])

  const isParsingFormCompleted = (): boolean => {
    if (formContent.dataFormat === 'json') {
      return (
        formContent.jsonMeasurementKey.path &&
        formContent.jsonFieldKeys.length &&
        formContent.jsonFieldKeys[0].name &&
        !!formContent.jsonFieldKeys[0].path
      )
    } else if (formContent.dataFormat === 'string') {
      return (
        formContent.stringMeasurement.pattern &&
        formContent.stringFields.length &&
        formContent.stringFields[0].name &&
        !!formContent.stringFields[0].pattern
      )
    } else {
      return true
    }
  }

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
          formContent.dataFormat && isParsingFormCompleted() ? 'true' : 'false',
        dataFormat: formContent.dataFormat ?? 'not chosen yet',
      },
      {feature: 'subscriptions'}
    )
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
            {showUpgradeButton && (
              <FlexBox
                justifyContent={JustifyContent.FlexEnd}
                alignItems={AlignItems.FlexEnd}
                stretchToFitHeight={true}
              >
                <CloudUpgradeButton
                  metric={() => {
                    const experimentVariantId = getExperimentVariantId(
                      CREDIT_250_EXPERIMENT_ID
                    )
                    const identity = getDataLayerIdentity()
                    event(
                      isFlagEnabled('credit250Experiment') &&
                        experimentVariantId === '1'
                        ? `subscriptions.create.upgrade.credit-250`
                        : `subscriptions.create.upgrade`,
                      {
                        location: 'subscriptions create',
                        ...identity,
                        experimentId: CREDIT_250_EXPERIMENT_ID,
                        experimentVariantId,
                      }
                    )
                  }}
                />
              </FlexBox>
            )}
            <div className="create-subscription-page__progress">
              <SubwayNav
                currentStep={getActiveStep(active)}
                onStepClick={handleClick}
                navigationSteps={navigationSteps}
                settingUpIcon={FormLogo}
                settingUpText="MQTT Connector"
              />
            </div>
            {active === Steps.BrokerForm && (
              <BrokerForm
                setFormActive={setFormActive}
                formContent={formContent}
                updateForm={updateForm}
                showUpgradeButton={showUpgradeButton}
              />
            )}
            {active === Steps.SubscriptionForm && (
              <SubscriptionForm
                setFormActive={setFormActive}
                formContent={formContent}
                updateForm={updateForm}
                showUpgradeButton={showUpgradeButton}
                buckets={buckets}
                bucket={bucket}
              />
            )}
            {active === Steps.ParsingForm && (
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
