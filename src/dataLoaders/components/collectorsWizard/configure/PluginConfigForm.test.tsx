// Libraries
import React from 'react'
import {screen} from '@testing-library/react'

// Components
import {PluginConfigForm} from 'src/dataLoaders/components/collectorsWizard/configure/PluginConfigForm'

// Constants
import {telegrafPluginsInfo} from 'src/dataLoaders/constants/pluginConfigs'
import {telegrafPlugin} from 'mocks/dummyData'

// Types
import {TelegrafPluginInputCpu} from '@influxdata/influx'

import {renderWithReduxAndRouter} from 'src/mockState'

const setup = (override = {}) => {
  const props = {
    telegrafPlugin,
    configFields:
      telegrafPluginsInfo[TelegrafPluginInputCpu.NameEnum.Cpu].fields,
    onUpdateTelegrafPluginConfig: jest.fn(),
    onAddConfigValue: jest.fn(),
    onRemoveConfigValue: jest.fn(),
    authToken: '',
    onSetConfigArrayValue: jest.fn(),
    telegrafPluginName: TelegrafPluginInputCpu.NameEnum.Cpu,
    onSetActiveTelegrafPlugin: jest.fn(),
    onClickPrevious: jest.fn(),
    onClickSkip: jest.fn(),
    onClickNext: jest.fn(),
    telegrafPlugins: [],
    currentIndex: 3,
    onSetPluginConfiguration: jest.fn(),
    ...override,
  }

  renderWithReduxAndRouter(<PluginConfigForm {...props} />)
}

describe('DataLoaders.Components.CollectorsWizard.Configure.PluginConfigForm', () => {
  describe('if configFields have no keys', () => {
    it('renders text and buttons', async () => {
      setup({
        telegrafPlugin,
        configFields:
          telegrafPluginsInfo[TelegrafPluginInputCpu.NameEnum.Cpu].fields,
      })
      const form = await screen.findByTestId('form-container')
      const title = await screen.getByRole('heading', {level: 3})
      const onboardingButtons = await screen.findByTestId('next')

      expect(form).toBeVisible()
      expect(title).toBeVisible()
      expect(onboardingButtons).toBeVisible()
    })
  })

  it('has a link to documentation containing plugin name', async () => {
    setup({
      telegrafPlugin,
    })

    const link = await screen.findByTestId('docs-link')

    expect(link).toBeVisible()
    expect(link.getAttribute('href')).toContain(telegrafPlugin.name)
  })
})
