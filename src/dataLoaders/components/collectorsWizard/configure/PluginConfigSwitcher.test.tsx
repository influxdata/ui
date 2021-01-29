// Libraries
import React from 'react'
import {screen} from '@testing-library/react'

// Components
import {PluginConfigSwitcher} from 'src/dataLoaders/components/collectorsWizard/configure/PluginConfigSwitcher'
import {renderWithReduxAndRouter} from 'src/mockState'
import EmptyDataSourceState from 'src/dataLoaders/components/configureStep/EmptyDataSourceState'

// Constants
import {telegrafPlugin, token} from 'mocks/dummyData'
import {TelegrafPluginInputCpu} from '@influxdata/influx'

const setup = (override = {}) => {
  const props = {
    telegrafPlugins: [],
    substepIndex: 0,
    authToken: token,
    onUpdateTelegrafPluginConfig: jest.fn(),
    onAddConfigValue: jest.fn(),
    onRemoveConfigValue: jest.fn(),
    onSetConfigArrayValue: jest.fn(),
    telegrafPluginName: TelegrafPluginInputCpu.NameEnum.Cpu,
    onClickNext: jest.fn(),
    onClickPrevious: jest.fn(),
    onClickSkip: jest.fn(),
    dispatch: jest.fn,
    ...override,
  }

  renderWithReduxAndRouter(<PluginConfigSwitcher {...props} />)
}

describe('DataLoading.Components.Collectors.Configure.PluginConfigSwitcher', () => {
  describe('if no telegraf plugins', () => {
    it('renders empty data source state', async () => {
      setup()
      const defaultEmptyStateText = new EmptyDataSourceState({}).render().props
        .children
      const emptyState = await screen.findByText(defaultEmptyStateText)

      expect(emptyState).toBeVisible()
    })
  })

  describe('if has active telegraf plugin', () => {
    it('renders plugin config form', async () => {
      setup({
        telegrafPlugins: [{...telegrafPlugin, active: true}],
      })
      const form = await screen.findByTestId('form-container')

      expect(form).toBeVisible()
    })
  })

  describe('if has no active telegraf plugin', () => {
    it('renders telegraf instructions', async () => {
      setup({
        telegrafPlugins: [{...telegrafPlugin, active: false}],
      })

      const form = await screen.getAllByRole('heading', {level: 3})
      const instructions = await screen.getByTestId(
        'telegraf-plugin-instructions'
      )

      expect(form.pop()).toBeVisible()
      expect(instructions).toBeVisible()
    })
  })
})
