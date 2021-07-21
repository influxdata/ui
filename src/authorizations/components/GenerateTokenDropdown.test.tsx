// Libraries
import React from 'react'
import {fireEvent, screen} from '@testing-library/react'

// Fixtures
import {renderWithReduxAndRouter} from 'src/mockState'

const isFlagEnabledMock = jest.fn(() => {
  return false
})
jest.mock('src/shared/utils/featureFlag', () => {
  return {
    isFlagEnabled: isFlagEnabledMock,
  }
})

const mockCloudValue = jest.fn()

jest.mock('src/shared/constants', () => ({
  get CLOUD() {
    return mockCloudValue()
  },
}))

describe('GenerateTokenDropdown', () => {
  describe('when CLOUD is false', () => {
    it('doesnt render the new dropdown options when the CLOUD is false', () => {
      mockCloudValue.mockReturnValue(false)
      const GenerateTokenDropdown = require('src/authorizations/components/GenerateTokenDropdown')
        .default
      const {queryByText} = renderWithReduxAndRouter(<GenerateTokenDropdown />)
      isFlagEnabledMock.mockImplementationOnce(() => {
        return true
      })

      fireEvent.click(screen.getByTestId('dropdown-button--gen-token'))

      expect(queryByText('Read/Write Token')).toBeVisible()
      expect(queryByText('All Access Token')).toBeVisible()
      expect(queryByText('Custom API Token')).toBeNull()
    })
  })

  // describe('when CLOUD is true', () => {
  //   mockCloudValue.mockReturnValue(true)
  //   const GenerateTokenDropdown = require('src/authorizations/components/GenerateTokenDropdown')
  //     .default
  //   const setup = () => {
  //     return renderWithReduxAndRouter(<GenerateTokenDropdown />)
  //   }
  //   it('renders the dropdown', () => {
  //     const {queryByTestId} = setup()

  //     expect(queryByTestId('dropdown--gen-token')).toBeVisible()
  //     expect(queryByTestId('dropdown-button--gen-token')).toBeVisible()
  //   })
  //   it('renders the dropdown options', () => {
  //     const {queryByText} = setup()

  //     fireEvent.click(screen.getByTestId('dropdown-button--gen-token'))

  //     expect(queryByText('Read/Write Token')).toBeVisible()
  //     expect(queryByText('All Access Token')).toBeVisible()
  //     expect(queryByText('Custom API Token')).toBeNull()
  //   })
  //   it('renders the new dropdown options when the flag is on', () => {
  //     isFlagEnabledMock.mockImplementationOnce(() => {
  //       return true
  //     })
  //     const {queryByText} = setup()

  //     fireEvent.click(screen.getByTestId('dropdown-button--gen-token'))

  //     expect(queryByText('Read/Write Token')).toBeNull()
  //     expect(queryByText('All Access Token')).toBeVisible()
  //     expect(queryByText('Custom API Token')).toBeVisible()
  //   })
  // })
})
