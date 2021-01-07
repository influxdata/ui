import React from 'react'
import classnames from 'classnames'
import {
  Button,
  ComponentSize,
  Panel,
  ComponentColor,
} from '@influxdata/clockface'

import BillingContactForm from 'src/billing/components/Checkout/BillingContactForm'
import BillingContactDisplay from 'src/billing/components/BillingContactDisplay'

import 'babel-polyfill'

class BillingContactInfo extends React.Component {
  constructor(props) {
    super(props)

    // Contact is created during signup but city (required) is not collected then
    const isFirstContactSaved = props.contact && props.contact.city

    this.state = {
      isEditing: !isFirstContactSaved,
      contact: this.props.contact,
      isFirstContactSaved,
    }

    this.csrf_token = document.querySelector('meta[name=csrf]').content
  }

  render() {
    const {isEditing, contact, isFirstContactSaved} = this.state
    const {
      countries,
      states,
      showNext,
      onNextStep,
      basePath,
      className,
    } = this.props

    const panelClass = classnames(
      'checkout-panel billing-contact-panel',
      className,
      {
        hide: this.props.hide,
      }
    )

    return (
      <Panel className={panelClass}>
        <Panel.Header size={ComponentSize.Large}>
          <h4>
            {isEditing ? 'Enter Contact Information' : 'Contact Information'}
          </h4>
          {isEditing ? (
            isFirstContactSaved && (
              <Button
                color={ComponentColor.Default}
                onClick={this.handleCancelEditing}
                text="Cancel Change"
                size={ComponentSize.Small}
              />
            )
          ) : (
            <Button
              color={ComponentColor.Default}
              onClick={this.handleStartEditing}
              text="Edit Information"
              size={ComponentSize.Small}
            />
          )}
        </Panel.Header>
        {isEditing ? (
          <BillingContactForm
            countries={countries}
            states={states}
            contact={contact}
            onSubmit={this.handleSubmitEditForm}
            basePath={basePath}
          />
        ) : (
          <BillingContactDisplay
            isShowingNext={showNext}
            onNextStep={onNextStep}
            contact={contact}
          />
        )}
      </Panel>
    )
  }

  handleSubmitEditForm = contact => {
    this.setState({isEditing: false, contact, isFirstContactSaved: true})

    if (this.props.onNextStep) {
      this.props.onNextStep()
    }
  }

  handleStartEditing = () => {
    this.setState({isEditing: true})
  }

  handleCancelEditing = () => {
    this.setState({isEditing: false})
  }
}

export default BillingContactInfo
