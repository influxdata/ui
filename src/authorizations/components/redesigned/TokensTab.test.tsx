// Installed libraries
import React from 'react'
import {fireEvent, screen, waitFor} from '@testing-library/react'
import {renderWithReduxAndRouter} from 'src/mockState'
import {mockAppState} from 'src/mockAppState'
import {AuthorizationUpdateRequest as AuthApi} from '@influxdata/influx'

import {mocked} from 'ts-jest/utils'

import TokensTab from './TokensTab'
// import {deleteToken} from 'src/client'
import {auth, orgs, withRouterProps} from '../../../../mocks/dummyData'
import {createMemoryHistory} from 'history'
import {RemoteDataState} from '@influxdata/clockface'

const InactiveToken = {
  id: '02f12c50dcb93000',
  orgID: '02ee9e2a29d73000',
  token: 'Dead-Beetle',
  status: AuthApi.StatusEnum.Inactive,
  org: 'default',
  description: 'XYZ',
}


const localTokens = [auth, InactiveToken]
const localHistory = createMemoryHistory({initialEntries: ['/']})

jest.mock('src/client', () => ({
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
  deleteToken: jest.fn(() => ({
    headers: {},
    status: 204,
  })),
}))


const defaultProps: any = {
  ...withRouterProps,
  org: orgs[0],
  history: localHistory,
}

const setup = (override?: {}) => {
  const props = {
    ...defaultProps,
    deleteToken: jest.fn(() => ({
      headers: {},
      status: 204,
    })),
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
            createdAt: '2020-08-19T23:13:44.514Z',
            updatedAt: '2020-08-19T23:13:44.514Z',
          },
        },
        allIDs: localTokens.map(t => t.id),
        status: RemoteDataState.Done,
      },
    },
  }
  // console.log('test tokens: ', testState.resources.tokens)

  return renderWithReduxAndRouter(<TokensTab {...props} />, () => testState)
}

describe('TokensTab', () => {
  // it('renders', () => {
  //   const ui = setup()
  // })
  let ui

  beforeEach(() => {
    jest.clearAllMocks()
    ui = setup()
  })

  describe('manage Tokens', () => {
    it('deletes a token', async () => {
      const tokenCard = (await screen.findAllByTestId('token-card My token'))[0]
      console.log('token card' ,tokenCard)
      expect(
        tokenCard.querySelector("[data-testid='token-name My token']")).toHaveTextContent('My token')

      const deleteButton = tokenCard.querySelector(
        "[data-testid='delete-token']"
      )

      const tokenID = '03c03a8a64728000'
      // tokenCard
      //   .querySelector("[class='copy-resource-id']")
      //   .textContent.split(':')[1]
      //   .split('C')[0]
      //   .trim()

      expect(ui.store.getState().resources.tokens.byID[tokenID]).toBeTruthy()
      expect(ui.store.getState().resources.tokens.allIDs).toContain(tokenID)

      fireEvent.click(deleteButton)

      await waitFor(() => expect(ui.props.deleteToken()).toBeCalled())

      // expect(mocked(ui.deleteToken).mock.calls[0][0]['tokenID']).toEqual(tokenID)
      // expect(ui.store.getState().resources.tokens.byID[tokenID]).toBeFalsy()
      // expect(ui.store.getState().resources.tokens.allIDs).not.toContain(tokenID)
    })
  })
  
})
