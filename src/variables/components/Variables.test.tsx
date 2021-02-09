// Libraries
import React from 'react'
import {screen} from '@testing-library/react'

// Components
import VariableList from 'src/variables/components/VariableList'

// Constants
import {variables} from 'mocks/dummyData'

import {renderWithReduxAndRouter} from 'src/mockState'

const setup = (override?) => {
  const props = {
    variables,
    emptyState: <></>,
    onDeleteVariable: jest.fn(),
    ...override,
  }

  renderWithReduxAndRouter(<VariableList {...props} />)
}

describe('VariableList', () => {
  describe('rendering', () => {
    it('renders', async () => {
      setup()
      const elm = await screen.findByTestId('resource-list')
      expect(elm).toBeVisible()
    })
  })
})
