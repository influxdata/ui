import React from 'react'
import {render, fireEvent} from '@testing-library/react'
import {CustomApiTokenOverlay} from './CustomApiTokenOverlay'

describe('CustomApitokenDescription', () => {
  const props = {
    onClose: () => true,
  }

  it('displays description box', () => {
    const {getByText} = render(<CustomApiTokenOverlay {...props} />)

    expect(getByText('Description')).toBeDefined()
    expect(getByText('Generate a Personal Api Token')).toBeDefined()
  })

  describe('when user inputs something into the description box', () => {
    it("should update the component's state", () => {
      const {getByTestId} = render(<CustomApiTokenOverlay {...props} />)

      fireEvent.change(getByTestId('custom-api-token-input'), {
        target: {value: 'chocolate'},
      })

      const element = getByTestId('custom-api-token-input')
      expect(element['value']).toEqual('chocolate')
    })
  })
})
