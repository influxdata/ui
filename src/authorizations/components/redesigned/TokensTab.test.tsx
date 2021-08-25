// Installed libraries
import React from 'react'
import {fireEvent, screen, waitFor} from '@testing-library/react'
import {renderWithReduxAndRouter} from 'src/mockState'
import {mockAppState} from 'src/mockAppState'
import {AuthorizationUpdateRequest as AuthApi} from '@influxdata/influx'

import {mocked} from 'ts-jest/utils'


import {deleteAuthorization, postAuthorization} from '../../../../src/client'

import {auth, orgs, withRouterProps} from '../../../../mocks/dummyData'
import {createMemoryHistory} from 'history'
import {RemoteDataState} from '@influxdata/clockface'

const InactiveToken = {
  id: '02f12c50dcb93000',
  orgID: '02ee9e2a29d73000',
  token: 'skjflkdsjfkd',
  status: AuthApi.StatusEnum.Inactive,
  org: 'default',
  description: 'XYZ',
}

const replacementID = '02f12c50dcb9300f'
const replacementDescription = 'ABC'

const localTokens = [auth, InactiveToken]
const localHistory = createMemoryHistory({initialEntries: ['/']})



jest.mock('../../../../src/client', () => ({
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
      data: InactiveToken
    }
  }),
  getAuthorization: jest.fn(() => {
    return {
      data: InactiveToken,
      headers: {},
      status: 200,
    }
  }),
  
}))
jest.mock('../../../../src/authorizations/apis', () => ({
  
  createAuthorization: jest.fn(() => {
    return {
      auth
    }
  }),
  
}))

import {createAuthorization} from '../../../../src/authorizations/apis'
import TokensTab from './TokensTab'

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
      // console.log(deleteAuthorization);
      const tokenCard = (await screen.findAllByTestId('token-card My token'))[0]
      // console.log('token card' ,tokenCard)
      expect(
        tokenCard.querySelector("[data-testid='token-name My token']")).toHaveTextContent('My token')

      const deleteButton = tokenCard.querySelector(
        "[data-testid='delete-token']"
      )

      const tokenID = '03c03a8a64728000'
      // tokenCard
      //   .querySelector("[class='cf-resource-card']")
      //   .textContent.split(':')[1]
      //   .split('C')[0]
      //   .trim()
        
      expect(ui.store.getState().resources.tokens.byID[tokenID]).toBeTruthy()
      expect(ui.store.getState().resources.tokens.allIDs).toContain(tokenID)

      fireEvent.click(deleteButton)

      await waitFor(() => expect(deleteAuthorization).toBeCalled())
      expect(mocked(deleteAuthorization).mock.calls[0][0]['authID']).toEqual(tokenID)
      expect(ui.store.getState().resources.tokens.byID[tokenID]).toBeFalsy()
      expect(ui.store.getState().resources.tokens.allIDs).not.toContain(tokenID)
    })

    it('clones a token', async () => {
      const ui = setup()
      expect(ui.store.getState().resources.tokens.allIDs.length).toEqual(
        localTokens.length
      )
      

      const tokenCard = (await screen.findAllByTestId('token-card My token'))[0]
      // console.log(tokenCard)
      const cloneButton = tokenCard.querySelector(
        '[data-testid=clone-token]'
      )
      // const description = tokenCard.querySelector("[data-testid='token-name My token']")
      console.log(tokenCard)
      // .textContent
      // expect(description).toContain(InactiveToken.description)
      // console.log('token clone button ', cloneButton)
      fireEvent.click(cloneButton)
      
      // await waitFor(() => expect(createAuthorization).toBeCalled())
      
      

      // expect(mocked(getAuthorization).mock.calls[0][0].authID).toEqual(InactiveToken.id)
      // console.log(mocked(getAuthorization).mock.calls[0][0].authID)
    })
  })
  
})
