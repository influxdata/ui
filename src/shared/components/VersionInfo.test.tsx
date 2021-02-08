// Libraries
import React from 'react'
import {screen} from '@testing-library/react'
import {renderWithReduxAndRouter} from 'src/mockState'

// Components
import VersionInfo from 'src/shared/components/VersionInfo'

const setup = (override = {}) => {
  const props = {
    ...override,
  }

  renderWithReduxAndRouter(<VersionInfo {...props} />)
}

describe('VersionInfo', () => {
  it('renders correctly', async () => {
    setup()
    const elm = await screen.getByTestId('version-info')
    expect(elm).toBeVisible()
  })

  describe('when width is specified', () => {
    it('renders corectly', async () => {
      setup({widthPixels: 300})
      const elm = await screen.getByTestId('version-info')
      expect(elm).toBeVisible()
    })
  })
})
