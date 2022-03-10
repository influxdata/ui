// Libraries
import React, {FC, useState, useContext} from 'react'
import {useSelector} from 'react-redux'

// Components
import {
  Icon,
  Page,
  FlexBox,
  JustifyContent,
  AlignItems,
} from '@influxdata/clockface'
import BrokerForm from 'src/writeData/subscriptions/components/BrokerForm'
import ParsingForm from 'src/writeData/subscriptions/components/ParsingForm'
import SubscriptionForm from 'src/writeData/subscriptions/components/SubscriptionForm'
import CloudUpgradeButton from 'src/shared/components/CloudUpgradeButton'
import GetResources from 'src/resources/components/GetResources'

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

// Actions
import {shouldShowUpgradeButton} from 'src/me/selectors'

// Styles
import 'src/writeData/subscriptions/components/CreateSubscriptionPage.scss'

const CreateSubscriptionPage: FC = () => {
  const [active, setFormActive] = useState('broker')
  const {formContent, setFormComplete, updateForm, loading} = useContext(
    SubscriptionCreateContext
  )
  const showUpgradeButton = useSelector(shouldShowUpgradeButton)
  const buckets = useSelector((state: AppState) =>
    getAll<Bucket>(state, ResourceType.Buckets).filter(b => b.type === 'user')
  )
  const {bucket} = useContext(WriteDataDetailsContext)
  return (
    <GetResources resources={[ResourceType.Buckets]}>
      <Page>
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
              <CloudUpgradeButton />
            </FlexBox>
          )}
          <div className="create-subscription-page__progress">
            <div className="create-subscription-page__progress__logo">
              <img src={FormLogo} />
              <div>
                <div className="create-subscription-page__progress__logo--lg">
                  Setting up
                </div>
                <div className="create-subscription-page__progress__logo--sm">
                  MQTT Connector
                </div>
              </div>
            </div>
            <div className="create-subscription-page__progress__bar">
              <div
                className={
                  active === 'broker'
                    ? 'create-subscription-page__progress__bar__wrap--selected'
                    : 'create-subscription-page__progress__bar__wrap'
                }
              >
                <button
                  className="create-subscription-page__progress__bar__wrap__btn"
                  onClick={() => setFormActive('broker')}
                >
                  <Icon
                    className={
                      active === 'broker' ? 'cf-icon--selected' : 'cf-icon'
                    }
                    glyph="upload-outline"
                  />
                  <div
                    className={
                      active === 'broker' ? 'title--selected' : 'title'
                    }
                  >
                    Connect to Broker
                  </div>
                </button>
              </div>
              <div
                className={
                  active === 'subscription'
                    ? 'create-subscription-page__progress__bar__wrap--selected'
                    : 'create-subscription-page__progress__bar__wrap'
                }
              >
                <button
                  className="create-subscription-page__progress__bar__wrap__btn"
                  onClick={() => setFormActive('subscription')}
                >
                  <Icon
                    className={
                      active === 'subscription'
                        ? 'cf-icon--selected'
                        : 'cf-icon'
                    }
                    glyph="subscribe"
                  />
                  <div
                    className={
                      active === 'subscription' ? 'title--selected' : 'title'
                    }
                  >
                    Subscribe to Topic
                  </div>
                </button>
              </div>
              <div
                className={
                  active === 'parsing'
                    ? 'create-subscription-page__progress__bar__wrap--selected'
                    : 'create-subscription-page__progress__bar__wrap'
                }
              >
                <button
                  className="create-subscription-page__progress__bar__wrap__btn"
                  onClick={() => setFormActive('parsing')}
                >
                  <Icon
                    className={
                      active === 'parsing' ? 'cf-icon--selected' : 'cf-icon'
                    }
                    glyph="braces"
                  />
                  <div
                    className={
                      active === 'parsing' ? 'title--selected' : 'title'
                    }
                  >
                    Define Data Parsing Rules
                  </div>
                </button>
              </div>
            </div>
          </div>
          {active === 'broker' && (
            <BrokerForm
              setFormActive={setFormActive}
              formContent={formContent}
              updateForm={updateForm}
              showUpgradeButton={showUpgradeButton}
            />
          )}
          {active === 'subscription' && (
            <SubscriptionForm
              setFormActive={setFormActive}
              formContent={formContent}
              updateForm={updateForm}
              showUpgradeButton={showUpgradeButton}
              buckets={buckets}
              bucket={bucket}
            />
          )}
          {active === 'parsing' && (
            <ParsingForm
              setFormActive={setFormActive}
              formContent={formContent}
              updateForm={updateForm}
              setFormComplete={setFormComplete}
              showUpgradeButton={showUpgradeButton}
              loading={loading}
            />
          )}
        </Page.Contents>
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
