// Libraries
import React from 'react'
import {renderWithReduxAndRouter} from 'src/mockState'

// Components
import WriteDataHelperTokens from 'src/writeData/components/WriteDataHelperTokens'

// Mocks
import {auth} from 'mocks/dummyData'

// Types
import WriteDataDetailsProvider from 'src/writeData/components/WriteDataDetailsContext'

// NOTE: stubbing is required here as the CopyButton component
// requires a redux store (alex)
jest.mock('src/shared/components/CopyButton', () => () => null)

const setup = (override?) => {
  const wrapper = renderWithReduxAndRouter(
    <WriteDataDetailsProvider>
      <WriteDataHelperTokens />
    </WriteDataDetailsProvider>,
    state => {
      state.resources.tokens = {
        allIDs: [],
        byID: {},
      }

      const tokens = override?.tokens || [auth]
      tokens.forEach(token => {
        state.resources.tokens.allIDs.push(token.id)
        state.resources.tokens.byID[token.id] = token
      })

      return state
    }
  )

  return {wrapper}
}

describe('WriteDataHelperTokens', () => {
  beforeEach(() => {
    jest.resetModules()
  })

  describe('renders with Tokens', () => {
    it('displays a list and the first Token is selected', () => {
      const {wrapper} = setup()
      const {getByTestId} = wrapper

      const list = getByTestId('write-data-tokens-list')

      expect(list).toBeTruthy()

      const renderedToken = getByTestId(auth.description)

      expect(renderedToken).toBeTruthy()

      expect(
        renderedToken.classList.contains('cf-list-item__active')
      ).toBeTruthy()
    })
  })

  describe('renders without Tokens', () => {
    it('displays a friendly empty state', () => {
      const {wrapper} = setup({tokens: []})
      const {getByTestId} = wrapper

      const emptyText = getByTestId('write-data--details-empty-state')

      expect(emptyText).toBeTruthy()
    })

    it.skip('displays tokens list without any items selected', () => {
      const {wrapper} = setup()
      const {getByTestId} = wrapper

      const list = getByTestId('write-data-tokens-list')

      expect(list).toBeTruthy()

      const token = getByTestId(auth.description)

      expect(token).toBeTruthy()

      expect(token.classList.contains('cf-list-item__active')).toBeFalsy()
    })
  })
})
