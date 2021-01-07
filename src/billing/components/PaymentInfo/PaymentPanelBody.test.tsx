import React from 'react'
import {render} from '@testing-library/react'

import PaymentPanelBody from './PaymentPanelBody'

const setup = (override?) => {
  const props = {
    paymentSummary: {
      cardType: '',
      cardNumber: '',
      expirationMonth: '',
      expirationYear: '',
    },
    cardMessage: '',
    isEditing: false,
    errorMessage: '',
    hostedPage: {
      id: '',
      key: '',
      signature: '',
      style: '',
      tenantId: '',
      token: '',
      url: '',
    },
    onSubmit: () => {},
    ...override,
  }

  return render(<PaymentPanelBody {...props} />)
}

describe('PaymentInfo.PaymentPanelBody', () => {
  test('renders display if not editing', () => {
    const {queryByTestId} = setup()

    const display = queryByTestId('payment-display')
    const form = queryByTestId('payment-form')

    expect(display).toBeTruthy()
    expect(form).toBeNull()
  })

  test('renders form if editing', () => {
    const {queryByTestId} = setup({isEditing: true})

    const display = queryByTestId('payment-display')
    const form = queryByTestId('payment-form')

    expect(form).toBeTruthy()
    expect(display).toBeNull()
  })
})
