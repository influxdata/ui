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

// Graphics
import FormLogo from 'src/writeData/subscriptions/graphics/form-logo.svg'

// Styles
import 'src/writeData/subscriptions/components/CreateSubscriptionPage.scss'

// Contexts
import {
  SubscriptionCreateContext,
  SubscriptionCreateProvider,
} from 'src/writeData/subscriptions/context/subscription.create'

// Actions
import {shouldShowUpgradeButton} from 'src/me/selectors'

const CreateSubscriptionPage: FC = () => {
  const [active, setFormActive] = useState('broker')
  const {formContent, setFormComplete, updateForm} = useContext(
    SubscriptionCreateContext
  )
  const showUpgradeButton = useSelector(shouldShowUpgradeButton)
  return (
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
            <div className="wrap">
              <Button
                text=""
                icon={IconFont.Cloud}
                onClick={() => setFormActive('broker')}
                testID="user-account-switch-btn"
              />
              <div
                className={active === 'broker' ? 'title--selected' : 'title'}
              >
                Connect to Broker
              </div>
            </div>
            <div className="wrap">
              <Button
                text=""
                icon={IconFont.AddCell}
                onClick={() => setFormActive('subscription')}
                testID="user-account-switch-btn"
              />

              <div
                className={
                  active === 'subscription' ? 'title--selected' : 'title'
                }
              >
                Subscribe to Topic
              </div>
            </div>
            <div className="wrap">
              <Button
                text=""
                icon={IconFont.Zap}
                onClick={() => setFormActive('parsing')}
                testID="user-account-switch-btn"
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
          />
        )}
        {active === 'parsing' && (
          <ParsingForm
            setFormActive={setFormActive}
            formContent={formContent}
            updateForm={updateForm}
            setFormComplete={setFormComplete}
            showUpgradeButton={showUpgradeButton}
          />
        )}
      </Page.Contents>
    </Page>
  )
}

export default () => (
  <SubscriptionCreateProvider>
    <CreateSubscriptionPage />
  </SubscriptionCreateProvider>
)

// const mstp = (state: AppState) => {
//   const showUpgrade = shouldShowUpgradeButton(state)
//   return {
//     showUpgrade,
//   }
// }

// export default connect(mstp, {})(CreateSubscriptionPage)
