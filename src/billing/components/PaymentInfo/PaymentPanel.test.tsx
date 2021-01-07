import React from 'react'
import {render} from '@testing-library/react'

import PaymentPanel from './PaymentPanel'
import {Panel} from '@influxdata/clockface'

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
    hasExistingPayment: false,
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
    onEdit: () => {},
    onCancel: () => {},
    onSubmit: () => {},
    footer: () => null,
    ...override,
  }

  return render(<PaymentPanel {...props} />)
}

describe('PaymentInfo.PaymentPanel', () => {
  test('renders panel with header and body', () => {
    const {getByTestId, queryByTestId} = setup()

    const header = getByTestId('panel--header')
    const body = getByTestId('panel--body')
    const footer = queryByTestId('panel--footer')

    expect(header).toBeTruthy()
    expect(body).toBeTruthy()
    expect(footer).toBeNull()
  })

  test('renders footer if footer is passed in', () => {
    const {getByTestId} = setup({footer: () => <Panel.Footer />})

    const footer = getByTestId('panel--footer')

    expect(footer).toBeTruthy()
  })
})
