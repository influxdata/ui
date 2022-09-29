// Installed libraries
import React from 'react'
import {fireEvent, screen, waitFor} from '@testing-library/react'
import {renderWithReduxAndRouter} from 'src/mockState'
import {mockAppState} from 'src/mockAppState'
import {jest} from '@jest/globals'

import {createAuthorization} from 'src/authorizations/apis'
import TokensTab from './TokensTab'

import {deleteAuthorization} from '../../../src/client'

import {auth2, orgs, withRouterProps} from '../../../mocks/dummyData'
import {createMemoryHistory} from 'history'
import {RemoteDataState} from '@influxdata/clockface'

const InactiveToken = {
  id: '02f12c50dcb93000',
  orgID: '02ee9e2a29d73000',
  token: 'skjflkdsjfkd',
  status: 'Inactive',
  org: 'default',
  description: 'XYZ',
}

const localTokens = [auth2, InactiveToken]
const localHistory = createMemoryHistory({initialEntries: ['/']})
const replacementID = '02f12c50dcb9300f'

jest.mock('../../../src/client', () => ({
  getTokens: jest.fn(() => {
    return {
      data: {
        tokens: localTokens.map(t => {
          t.id, t.orgID, t.token
        }),
      },
      headers: {},
      status: 200,
    }
  }),
  deleteAuthorization: jest.fn(() => ({
    headers: {},
    status: 204,
  })),
  postAuthorization: jest.fn(() => {
    return {
      headers: {},
      status: 201,
      data: InactiveToken,
    }
  }),
  getAuthorization: jest.fn(() => {
    return {
      data: auth2,
      headers: {},
      status: 200,
    }
  }),
}))
jest.mock('src/authorizations/apis', () => ({
  createAuthorization: jest.fn(() => {
    return {
      ...auth2,
      id: replacementID,
    }
  }),
}))

const defaultProps: any = {
  ...withRouterProps,
  org: orgs[0],
  history: localHistory,
}

const setup = (override?: {}) => {
  const props = {
    ...defaultProps,
    ...override,
  }
  const testState = {
    ...mockAppState,
    resources: {
      tokens: {
        byID: {
          [localTokens[0].id]: {
            ...localTokens[0],
            createdAt: '2020-08-19T23:13:44.514Z',
            updatedAt: '2020-08-19T23:13:44.514Z',
          },
          [localTokens[1].id]: {
            ...localTokens[1],
            createdAt: '2020-08-19T23:13:43.514Z',
            updatedAt: '2020-08-19T23:13:42.514Z',
          },
        },
        allIDs: localTokens.map(t => t.id),
        status: RemoteDataState.Done,
        currentAuth: {status: RemoteDataState.NotStarted, item: {}},
      },
    },
  }

  return renderWithReduxAndRouter(<TokensTab {...props} />, () => testState)
}

describe('TokensTab', () => {
  let ui

  beforeEach(() => {
    jest.clearAllMocks()
    ui = setup()
  })

  describe('manage Tokens', () => {
    it('deletes a token', async () => {
      const tokenCard = (await screen.findAllByTestId('token-card My token'))[0]

      expect(
        tokenCard.querySelector("[data-testid='token-name My token']")
      ).toHaveTextContent('My token')

      const deleteButton = tokenCard.querySelector(
        "[data-testid='context-delete-menu--button']"
      )

      fireEvent.click(deleteButton)

      const tokenID = '03c03a8a64728000'

      expect(ui.store.getState().resources.tokens.byID[tokenID]).toBeTruthy()
      expect(ui.store.getState().resources.tokens.allIDs).toContain(tokenID)

      fireEvent.click(screen.getByText('Confirm'))

      await waitFor(() => expect(deleteAuthorization).toBeCalled())
      expect(
        jest.mocked(deleteAuthorization).mock.calls[0][0]['authID']
      ).toEqual(tokenID)
      expect(ui.store.getState().resources.tokens.byID[tokenID]).toBeFalsy()
      expect(ui.store.getState().resources.tokens.allIDs).not.toContain(tokenID)
    })

    it('clones a token', async () => {
      const ui = setup()
      expect(ui.store.getState().resources.tokens.allIDs.length).toEqual(
        localTokens.length
      )

      const tokenCard = (await screen.findAllByTestId('token-card My token'))[0]
      const menuButton = tokenCard.querySelector(
        "[data-testid='context-menu-token']"
      )
      fireEvent.click(menuButton)

      fireEvent.click(screen.getByText('Clone'))

      await waitFor(() => expect(createAuthorization).toBeCalled())
    })

    it('display tokens', async () => {
      const tokenCard1 = (
        await screen.findAllByTestId('token-card My token')
      )[0]
      const tokenCard2 = (await screen.findAllByTestId('token-card XYZ'))[0]

      expect(tokenCard1).toBeDefined()
      expect(tokenCard2).toBeDefined()
    })

    it('displays generate token button', async () => {
      const generateTokenButton = (
        await screen.findAllByTestId('dropdown-button--gen-token')
      )[0]
      fireEvent.click(generateTokenButton)
      const allAccessOption = (
        await screen.findAllByTestId('dropdown-item generate-token--all-access')
      )[0]
      fireEvent.click(allAccessOption)
    })
  })
})
