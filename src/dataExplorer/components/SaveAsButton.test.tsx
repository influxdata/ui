// Libraries
import React from 'react'
import {screen} from '@testing-library/react'
import {renderWithReduxAndRouter} from 'src/mockState'

// Components
import SaveAsButton from 'src/dataExplorer/components/SaveAsButton'

const setup = () => {
  renderWithReduxAndRouter(<SaveAsButton />)
}

describe('SaveAsButton', () => {
  setup()
  describe('rendering', () => {
    it('renders', async () => {
      const elm = await screen.findByTestId('save-query-as')
      expect(elm).toBeVisible()
    })
  })
})
