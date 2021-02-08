import React from 'react'
import {screen} from '@testing-library/react'
import {renderWithReduxAndRouter} from 'src/mockState'

import TelegrafInstructions from 'src/dataLoaders/components/verifyStep/TelegrafInstructions'

const setup = (override = {}) => {
  const props = {
    token: '',
    configID: '',
    ...override,
  }

  renderWithReduxAndRouter(<TelegrafInstructions {...props} />)
}

describe('TelegrafInstructions', () => {
  it('renders', async () => {
    setup()
    const elm = await screen.getByTestId('setup-instructions')
    expect(elm).toBeVisible()
  })
})
