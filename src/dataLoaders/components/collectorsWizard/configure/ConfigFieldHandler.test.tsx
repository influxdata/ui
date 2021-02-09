// Libraries
import React from 'react'
import {screen} from '@testing-library/react'

// Components
import {ConfigFieldHandler} from 'src/dataLoaders/components/collectorsWizard/configure/ConfigFieldHandler'

// Constants
import {telegrafPluginsInfo} from 'src/dataLoaders/constants/pluginConfigs'
import {telegrafPlugin} from 'mocks/dummyData'

// Types
import {
  TelegrafPluginInputCpu,
  TelegrafPluginInputRedis,
} from '@influxdata/influx'

import {renderWithReduxAndRouter} from 'src/mockState'

const setup = (override = {}) => {
  const props = {
    telegrafPlugin,
    configFields:
      telegrafPluginsInfo[TelegrafPluginInputCpu.NameEnum.Cpu].fields,
    onUpdateTelegrafPluginConfig: jest.fn(),
    onAddConfigValue: jest.fn(),
    onRemoveConfigValue: jest.fn(),
    onSetConfigArrayValue: jest.fn(),
    ...override,
  }

  renderWithReduxAndRouter(<ConfigFieldHandler {...props} />)
}

describe('DataLoaders.Components.CollectorsWizard.Configure.ConfigFieldHandler', () => {
  describe('if configFields have no keys', () => {
    it('renders no config text', async () => {
      setup({
        telegrafPlugin,
        configFields:
          telegrafPluginsInfo[TelegrafPluginInputCpu.NameEnum.Cpu].fields,
      })
      const noConfig = await screen.findByTestId('no-config')
      expect(noConfig).toBeVisible()
    })
  })

  describe('if configFields have  keys', () => {
    it('renders correct number of switchers', async () => {
      const configFields =
        telegrafPluginsInfo[TelegrafPluginInputRedis.NameEnum.Redis].fields
      setup({
        telegrafPlugin,
        configFields,
      })

      const switchers = await screen.findAllByTestId('grid')
      expect(switchers.length).toBe(Object.keys(configFields).length)
    })
  })
})
