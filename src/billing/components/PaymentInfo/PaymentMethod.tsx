// Libraries
import React from 'react'
import classnames from 'classnames'
import 'babel-polyfill'
import axios from 'axios'

// Components
import BillingPanelFooter from '../BillingPanelFooter'
import PaymentPanel from './PaymentPanel'

// Utils
import {convertKeysToCamelCase} from 'src/billing/utils/checkout'

// Types
import {
  PaymentSummaryResponse,
  PaymentSummary,
  ZuoraResponse,
  ZuoraParams,
} from 'src/types'

enum PaymentState {
  NONE = 'None',
  EXISTING = 'Existing',
  ADDED = 'Added',
  ADDING = 'Adding',
}

interface Props {
  paymentSummary: PaymentSummaryResponse
  onNextStep: () => void
  showNext: boolean
  hostedPage: ZuoraParams
  hide: boolean
}

interface State {
  paymentSummary: PaymentSummary
  paymentState: PaymentState
  errorMessage: string
}

class PaymentMethod extends React.Component<Props, State> {
  constructor(props) {
    super(props)

    const {paymentSummary} = this.props
    const paymentState = paymentSummary
      ? PaymentState.EXISTING
      : PaymentState.NONE

    this.state = {
      paymentSummary: convertKeysToCamelCase(paymentSummary),
      paymentState,
      errorMessage: '',
    }
  }

  async handleSubmitCardId(cardId): Promise<void> {
    try {
      const url = 'privateAPI/checkout/payment_method'
      const {data} = await axios.post(url, {
        paymentMethodId: cardId,
      })

      this.setState({
        paymentSummary: convertKeysToCamelCase(data),
        paymentState: PaymentState.ADDED,
      })

      this.props.onNextStep()
    } catch (_el) {
      this.setState({errorMessage: 'Could not add card, please try again.'})
    }
  }

  handleStartChangePayment = (): void => {
    this.setState({paymentState: PaymentState.ADDING})
  }

  handleCancelChangePayment = (): void => {
    if (
      convertKeysToCamelCase(this.props.paymentSummary) ==
      this.state.paymentSummary
    ) {
      this.setState({paymentState: PaymentState.EXISTING})
      return
    }

    this.setState({paymentState: PaymentState.ADDED})
  }

  handleSubmission = async (response: ZuoraResponse): Promise<void> => {
    if (response.success) {
      await this.handleSubmitCardId(response.refId)
    } else {
      console.log('failed to add card') /* eslint-disable-line no-console */
      this.setState({errorMessage: 'Could not add card, please try again.'})
    }
  }

  render() {
    const {showNext, onNextStep, hostedPage} = this.props
    const {paymentSummary, errorMessage} = this.state
    const panelClass = classnames('checkout-panel payment-method-panel', {
      hide: this.props.hide,
    })

    return (
      <PaymentPanel
        className={panelClass}
        cardMessage={this.cardMessage}
        onEdit={this.handleStartChangePayment}
        onCancel={this.handleCancelChangePayment}
        paymentSummary={paymentSummary}
        isEditing={this.isEditing}
        hasExistingPayment={this.hasExistingPayment}
        errorMessage={errorMessage}
        hostedPage={hostedPage}
        onSubmit={this.handleSubmission}
        footer={() => (
          <BillingPanelFooter
            confirmText="Next"
            onNextStep={onNextStep}
            hide={!showNext}
          />
        )}
      />
    )
  }

  get isEditing(): boolean {
    const {paymentState} = this.state

    return (
      paymentState === PaymentState.ADDING || paymentState === PaymentState.NONE
    )
  }

  get cardMessage(): string {
    const {paymentState} = this.state

    if (paymentState === PaymentState.ADDED) {
      return 'Use updated card'
    }

    return 'Use existing card'
  }

  get hasExistingPayment(): boolean {
    const {paymentState} = this.state

    return (
      paymentState === PaymentState.ADDED ||
      paymentState === PaymentState.ADDING
    )
  }
}

export default PaymentMethod
