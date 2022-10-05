// Libraries
import React from 'react'
import {screen} from '@testing-library/react'

// Components
import {Row} from 'src/shared/components/Row'

import {renderWithReduxAndRouter} from 'src/mockState'

const setup = (override = {}) => {
  const props = {
    confirmText: '',
    item: {},
    onDeleteTag: jest.fn(),
    onSetConfigArrayValue: jest.fn(),
    fieldName: '',
    telegrafPluginName: 'cpu',
    index: 0,
    ...override,
  }

  renderWithReduxAndRouter(<Row {...props} />)
}

describe('Onboarding.Components.ConfigureStep.Streaming.ArrayFormElement', () => {
  it('renders', async () => {
    const fieldName = 'yo'
    setup({fieldName})
    const elm = await screen.findByTestId('index-list')
    expect(elm).toBeVisible()
  })
})
