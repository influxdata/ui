// Libraries
import React, {FC, useState, useContext} from 'react'
import {useSelector} from 'react-redux'

// Components
import {
  Button,
  IconFont,
  Page,
  FlexBox,
  JustifyContent,
  AlignItems,
} from '@influxdata/clockface'
import BrokerForm from './BrokerForm'
import ParsingForm from './ParsingForm'
import SubscriptionForm from './SubscriptionForm'
import CloudUpgradeButton from 'src/shared/components/CloudUpgradeButton'
import GetResources from 'src/resources/components/GetResources'

// Graphics
import FormLogo from 'src/writeData/subscriptions/graphics/form-logo.svg'

// Styles
import 'src/writeData/subscriptions/components/CreateSubscriptionPage.scss'

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
              <CloudUpgradeButton className="upgrade-payg--button__header" />
            </FlexBox>
          )}
          <div className="progress">
            <div className="logo">
              <img src={FormLogo} />
              <div>
                <div className="logo-text--lg">Setting up</div>
                <div className="logo-text--sm">MQTT Connector</div>
              </div>
            </div>
            <div className="bar">
              <div className={active === 'broker' ? 'wrap--selected' : 'wrap'}>
                <Button
                  icon={IconFont.UploadOutline}
                  onClick={() => setFormActive('broker')}
                />
                <div
                  className={active === 'broker' ? 'title--selected' : 'title'}
                >
                  Connect to Broker
                </div>
              </div>
              <div
                className={
                  active === 'subscription' ? 'wrap--selected' : 'wrap'
                }
              >
                <Button
                  icon={IconFont.Subscribe}
                  onClick={() => setFormActive('subscription')}
                />

                <div
                  className={
                    active === 'subscription' ? 'title--selected' : 'title'
                  }
                >
                  Subscribe to Topic
                </div>
              </div>
              <div className={active === 'parsing' ? 'wrap--selected' : 'wrap'}>
                <Button
                  icon={IconFont.Braces}
                  onClick={() => setFormActive('parsing')}
                />
                <div
                  className={active === 'parsing' ? 'title--selected' : 'title'}
                >
                  Define Data Parsing Rules
                </div>
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
