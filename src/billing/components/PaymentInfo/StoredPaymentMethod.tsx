// Libraries
import React, {Component} from 'react'
import axios from 'axios'

// Components
import BillingPageContext from 'src/billing/components/BillingPageContext'
import PaymentPanel from './PaymentPanel'

// Utils
import {convertKeysToCamelCase} from 'src/billing/utils/checkout'

// Types
import {PaymentMethod, ZuoraResponse} from 'src/types'

interface Props {
  paymentMethods: PaymentMethod[]
}

interface State {
  isEditing: boolean
  errorMessage: string
  paymentMethods: PaymentMethod[]
}

class StoredPaymentMethod extends Component<Props, State> {
  static contextType = BillingPageContext
  constructor(props) {
    super(props)

    this.state = {
      isEditing: !this.hasExisitingPayment,
      paymentMethods: this.props.paymentMethods.map(pm =>
        convertKeysToCamelCase(pm)
      ),
      errorMessage: '',
    }
  }

  render() {
    const {ccPageParams: hostedPage} = this.context
    const {isEditing, errorMessage} = this.state

    return (
      <PaymentPanel
        paymentSummary={this.paymentMethod}
        cardMessage="Your current payment card is"
        hostedPage={hostedPage}
        isEditing={isEditing}
        onEdit={this.handleStartEditing}
        onSubmit={this.handleSubmit}
        onCancel={this.handleCancelEditing}
        errorMessage={errorMessage}
        hasExistingPayment={this.hasExisitingPayment}
      />
    )
  }

  get hasExisitingPayment(): boolean {
    return !!this.props.paymentMethods.length
  }

  get paymentMethod(): PaymentMethod {
    const {paymentMethods} = this.state

    const defaultMethod = paymentMethods.find(p => p.defaultPaymentMethod)

    return defaultMethod || paymentMethods[0]
  }

  handleStartEditing = (): void => {
    this.setState({isEditing: true})
  }

  handleCancelEditing = (): void => {
    this.setState({isEditing: false})
  }

  handleSubmit = async (response: ZuoraResponse): Promise<void> => {
    const errorMessage = 'Could not add card, please try again.'
    if (response.success) {
      try {
        const url = 'privateAPI/billing/payment_method'
        const {data} = await axios.put(url, {
          paymentMethodId: response.refId,
        })

        this.setState({
          isEditing: false,
          paymentMethods: data,
          errorMessage: '',
        })
      } catch (_e) {
        this.setState({errorMessage})
      }
    } else {
      console.log('failed to add card') /* eslint-disable-line no-console */
      this.setState({errorMessage})
    }
  }
}

export default StoredPaymentMethod
