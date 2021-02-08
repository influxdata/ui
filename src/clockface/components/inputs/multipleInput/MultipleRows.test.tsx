// Libraries
import React from 'react'
import {screen} from '@testing-library/react'

// Components
import MultipleRows from './MultipleRows'

import {TelegrafPluginInputCpu} from '@influxdata/influx'
import {renderWithReduxAndRouter} from 'src/mockState'

const setup = (override = {}) => {
  const props = {
    confirmText: '',
    onDeleteTag: jest.fn(),
    fieldName: '',
    tags: [],
    onSetConfigArrayValue: jest.fn(),
    telegrafPluginName: TelegrafPluginInputCpu.NameEnum.Cpu,
    ...override,
  }

  renderWithReduxAndRouter(<MultipleRows {...props} />)
}

describe('Clockface.Components.MultipleRows', () => {
  it('renders', async () => {
    const fieldName = 'yo'
    setup({fieldName})
    const elm = await screen.findByTestId('multiple-rows')
    expect(elm).toBeVisible()
  })
})
