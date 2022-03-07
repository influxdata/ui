// Libraries
import React, {FC, useState, useContext} from 'react'

// Components
import {Button, IconFont} from '@influxdata/clockface'
import BrokerForm from './BrokerForm'
import ParsingForm from './ParsingForm'
import SubscriptionForm from './SubscriptionForm'

// Graphics
import FormLogo from 'src/writeData/subscriptions/graphics/form-logo.svg'

// Styles
import 'src/writeData/subscriptions/components/CreateSubscriptionPage.scss'

// Contexts
import {
  SubscriptionCreateContext,
  SubscriptionCreateProvider,
} from 'src/writeData/subscriptions/context/subscription.create'

const CreateSubscriptionPage: FC = () => {
  const [active, setFormActive] = useState('broker')
  const {formContent, setFormComplete, updateForm} = useContext(
    SubscriptionCreateContext
  )
  return (
    <div className="create-subscription-page">
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
            <div className={active === 'broker' ? 'title--selected' : 'title'}>
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
            <div className={active === 'parsing' ? 'title--selected' : 'title'}>
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
        />
      )}
      {active === 'subscription' && (
        <SubscriptionForm
          setFormActive={setFormActive}
          formContent={formContent}
          updateForm={updateForm}
        />
      )}
      {active === 'parsing' && (
        <ParsingForm
          setFormActive={setFormActive}
          formContent={formContent}
          updateForm={updateForm}
          setFormComplete={setFormComplete}
        />
      )}
    </div>
  )
}

export default () => (
  <SubscriptionCreateProvider>
    <CreateSubscriptionPage />
  </SubscriptionCreateProvider>
)
