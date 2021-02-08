// Libraries
import React from 'react'
import {screen} from '@testing-library/react'
import {renderWithReduxAndRouter} from 'src/mockState'

// Components
import ConnectionInformation, {
  LoadingState,
} from 'src/dataLoaders/components/verifyStep/ConnectionInformation'

// Types

const setup = (override = {}) => {
  const props = {
    loading: LoadingState.NotStarted,
    bucket: 'defbuck',
    countDownSeconds: 60,
    ...override,
  }

  renderWithReduxAndRouter(<ConnectionInformation {...props} />)
}

describe('Onboarding.Components.ConnectionInformation', () => {
  it('renders', async () => {
    setup()
    const elm = await screen.getByTestId('connection-information')
    expect(elm).toBeVisible()
  })
})
