// Installed libraries
import React from 'react'
import {fireEvent, screen, waitFor} from '@testing-library/react'
import {renderWithReduxAndRouter} from 'src/mockState'
import {mockAppState} from 'src/mockAppState'

import {mocked} from 'ts-jest/utils'

import TokensTab from './TokensTab'

import {auth, orgs, withRouterProps} from '../../../../mocks/dummyData'
import {createMemoryHistory} from 'history'
import {RemoteDataState} from '@influxdata/clockface'

const localHistory = createMemoryHistory({initialEntries: ['/']})

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
          [auth.id]: auth,
        },
        allIDs: [auth],
        status: RemoteDataState.Done,
      },
    },
  }
  console.log('tewst tokens: ', testState.resources.tokens)

  return renderWithReduxAndRouter(<TokensTab {...props} />, () => testState)
}

describe('TokensTab', () => {
  it('renders', () => {
    const ui = setup()
  })
})
