// Libraries
import React from 'react'
import {screen} from '@testing-library/react'

// Components
import URIFormElement from 'src/shared/components/URIFormElement'

import {renderWithReduxAndRouter} from 'src/mockState'

const setup = (override = {}) => {
  const props = {
    name: '',
    value: '',
    onChange: jest.fn(),
    helpText: '',
    ...override,
  }

  renderWithReduxAndRouter(<URIFormElement {...props} />)
}

describe('URIFormElement', () => {
  setup()

  it('renders', async () => {
    const elm = await screen.getByTestId('input-field')
    expect(elm).toBeVisible()
  })
})
