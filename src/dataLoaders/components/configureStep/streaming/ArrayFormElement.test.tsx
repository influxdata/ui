// Libraries
import React from 'react'
import {screen} from '@testing-library/react'

// Components
import ArrayFormElement from 'src/dataLoaders/components/configureStep/streaming/ArrayFormElement'
import {renderWithReduxAndRouter} from 'src/mockState'

import {TelegrafPluginInputCpu} from '@influxdata/influx'

const setup = (override = {}) => {
  const props = {
    fieldName: '',
    addTagValue: jest.fn(),
    removeTagValue: jest.fn(),
    autoFocus: true,
    value: [],
    fieldType: null,
    helpText: '',
    onSetConfigArrayValue: jest.fn(),
    telegrafPluginName: TelegrafPluginInputCpu.NameEnum.Cpu,
    ...override,
  }

  renderWithReduxAndRouter(<ArrayFormElement {...props} />)
}

describe('Onboarding.Components.ConfigureStep.Streaming.ArrayFormElement', () => {
  it('renders', async () => {
    const fieldName = 'yo'
    setup({fieldName})
    const elm = await screen.findByText(fieldName)

    expect(elm).toBeVisible()
  })
})
