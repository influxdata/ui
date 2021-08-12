import React from 'react'
import {fireEvent} from '@testing-library/react'
import {CustomApiTokenOverlay} from './CustomApiTokenOverlay'
import {renderWithRedux} from 'src/mockState'

let realUseContext
let useContextMock

describe('CustomApitokenDescription', () => {
  const spyInstance = {
    play() {
      return true
    },
  }
  beforeEach(() => {
    realUseContext = React.useContext
    useContextMock = React.useContext = jest.fn(() =>
      jest.spyOn(spyInstance, 'play')
    )
  })
  afterEach(() => {
    React.useContext = realUseContext
  })
  it('displays description box', () => {
    useContextMock.mockReturnValue('Test Value')
    const {getByText} = renderWithRedux(<CustomApiTokenOverlay />)
    expect(spyInstance.play).toHaveBeenCalled()

    expect(getByText('Description')).toBeDefined()
    expect(getByText('Generate a Personal Api Token')).toBeDefined()
  })

  describe('when user inputs something into the description box', () => {
    it("should update the component's state", () => {
      const {getByTestId} = renderWithRedux(<CustomApiTokenOverlay />)

      fireEvent.change(getByTestId('custom-api-token-input'), {
        target: {value: 'chocolate'},
      })

      const element = getByTestId('custom-api-token-input')
      expect(element['value']).toEqual('chocolate')
    })
  })
})
