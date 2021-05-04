// Libraries
import React from 'react'
import {renderWithReduxAndRouter} from 'src/mockState'

// Components
import WriteDataHelperTokens from 'src/writeData/components/WriteDataHelperTokens'

// Mocks
import {auth} from 'mocks/dummyData'

// Types
import {
  WriteDataDetailsContext,
  DEFAULT_WRITE_DATA_DETAILS_CONTEXT,
} from 'src/writeData/components/WriteDataDetailsContext'

// NOTE: stubbing is required here as the CopyButton component
// requires a redux store (alex)
jest.mock('src/shared/components/CopyButton', () => () => null)

const setup = (override?) => {
  const wrapper = renderWithReduxAndRouter(
    <WriteDataDetailsContext.Provider>
      <WriteDataHelperTokens />
    </WriteDataDetailsContext.Provider>,
    state => {
      state.resources.tokens.allIDs = []
      state.resources.tokens.byID = {}(override.tokens || [auth]).forEach(
        token => {
          state.resources.tokens.allIDs.push(auth.id)
          state.resources.tokens.byID[auth.id] = auth
        }
      )
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
