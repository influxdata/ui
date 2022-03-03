// Libraries
import React, {FC, useState} from 'react'

// Components
import {Button, IconFont} from '@influxdata/clockface'
import BrokerForm from './BrokerForm'
import ParsingForm from './ParsingForm'
import SubscriptionForm from './SubscriptionForm'

// Graphics
import FormLogo from 'src/writeData/subscriptions/graphics/form-logo.svg'

// Styles
import 'src/writeData/subscriptions/components/CreateSubscriptionPage.scss'

const CreateSubscriptionPage: FC = () => {
  const [form, setForm] = useState('broker')
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
              onClick={() => setForm('broker')}
              testID="user-account-switch-btn"
            />
            <div className={form === 'broker' ? 'title--selected' : 'title'}>
              Connect to Broker
            </div>
          </div>
          <div className="wrap">
            <Button
              text=""
              icon={IconFont.AddCell}
              onClick={() => setForm('subscription')}
              testID="user-account-switch-btn"
            />

            <div
              className={form === 'subscription' ? 'title--selected' : 'title'}
            >
              Subscribe to Topic
            </div>
          </div>
          <div className="wrap">
            <Button
              text=""
              icon={IconFont.Zap}
              onClick={() => setForm('parsing')}
              testID="user-account-switch-btn"
            />
            <div className={form === 'parsing' ? 'title--selected' : 'title'}>
              Define Data Parsing Rules
            </div>
          </div>
        </div>
      </div>
      {form === 'broker' && <BrokerForm setForm={setForm} />}
      {form === 'subscription' && <SubscriptionForm setForm={setForm} />}
      {form === 'parsing' && <ParsingForm setForm={setForm} />}
    </div>
  )
}
export default CreateSubscriptionPage
