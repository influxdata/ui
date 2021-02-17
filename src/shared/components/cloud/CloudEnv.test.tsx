// Libraries
import React from 'react'
import {screen} from '@testing-library/react'
import {renderWithReduxAndRouter} from 'src/mockState'

describe('If in cloud', () => {
  const Childish = <div data-testid="moo">moo</div>

  it('CloudOnly renders children', async () => {
    jest.mock('src/shared/constants', () => ({CLOUD: true}))
    const CloudOnly = require('src/shared/components/cloud/CloudOnly.tsx')
      .default
    renderWithReduxAndRouter(<CloudOnly>{Childish}</CloudOnly>)
    const elm = await screen.getByTestId('moo')
    expect(elm).toBeVisible()
  })

  it('CloudExclude does not render chilren', async () => {
    jest.mock('src/shared/constants', () => ({CLOUD: true}))
    const CloudExclude = require('src/shared/components/cloud/CloudExclude.tsx')
      .default
    renderWithReduxAndRouter(<CloudExclude>{Childish}</CloudExclude>)
    const elm = await screen.queryByTestId('moo')
    expect(elm).toBeNull()
  })
})
