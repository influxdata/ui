import React from 'react'
import {render} from '@testing-library/react'

import PaymentPanelHeader from './PaymentPanelHeader'

const setup = (override?) => {
  const props = {
    isEditing: false,
    hasExistingPayment: false,
    onEdit: () => {},
    onCancel: () => {},
    ...override,
  }

  return render(<PaymentPanelHeader {...props} />)
}

describe('PaymentInfo.PaymentPanelHeader', () => {
  test('renders no button if no panels exist and editing', () => {
    const {queryByTestId} = setup({isEditing: true})

    const edit = queryByTestId('edit-button')
    const cancelled = queryByTestId('cancel-button')

    expect(edit).toBeNull()
    expect(cancelled).toBeNull()
  })

  test('renders edit button if not currently editing', () => {
    const {queryByTestId} = setup({isEditing: false, hasExistingPayment: false})

    const edit = queryByTestId('edit-button')
    const cancelled = queryByTestId('cancel-button')

    expect(edit).toBeTruthy()
    expect(cancelled).toBeNull()
  })

  test('renders cancel button other payment methods exist while editing', () => {
    const {queryByTestId} = setup({
      isEditing: true,
      hasExistingPayment: true,
    })

    const edit = queryByTestId('edit-button')
    const cancelled = queryByTestId('cancel-button')

    expect(cancelled).toBeTruthy()
    expect(edit).toBeNull()
  })
})
