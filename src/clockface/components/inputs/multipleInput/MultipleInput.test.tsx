// Libraries
import React from 'react'
import {screen} from '@testing-library/react'

// Components
import MultipleInput from './MultipleInput'

import {TelegrafPluginInputCpu} from '@influxdata/influx'
import {renderWithReduxAndRouter} from 'src/mockState'

const setup = (override = {}) => {
  const props = {
    title: '',
    helpText: '',
    onAddRow: jest.fn(),
    onDeleteRow: jest.fn(),
    onEditRow: jest.fn(),
    autoFocus: true,
    tags: [],
    onSetConfigArrayValue: jest.fn(),
    telegrafPluginName: TelegrafPluginInputCpu.NameEnum.Cpu,
    ...override,
  }

  renderWithReduxAndRouter(<MultipleInput {...props} />)
}

describe('Clockface.Components.MultipleInput', () => {
  it('renders', async () => {
    const fieldName = 'yo'
    setup({fieldName})
    const elm = await screen.findByTestId('grid')
    expect(elm).toBeVisible()
  })
})
