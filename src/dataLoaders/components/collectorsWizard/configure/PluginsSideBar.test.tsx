// Libraries
import React from 'react'
import {screen} from '@testing-library/react'

// Components
import PluginsSideBar from 'src/dataLoaders/components/collectorsWizard/configure/PluginsSideBar'
import {cpuTelegrafPlugin, diskTelegrafPlugin} from 'mocks/dummyData'

import {renderWithReduxAndRouter} from 'src/mockState'

const onClick = jest.fn(() => {})

const setup = (override = {}) => {
  const props = {
    title: 'title',
    visible: true,
    telegrafPlugins: [],
    onTabClick: onClick,
    currentStepIndex: 0,
    onNewSourceClick: jest.fn(),
    ...override,
  }

  renderWithReduxAndRouter(<PluginsSideBar {...props} />)
}

describe('PluginsSideBar', () => {
  describe('rendering', () => {
    it('renders! wee!', async () => {
      setup({
        telegrafPlugins: [cpuTelegrafPlugin, diskTelegrafPlugin],
      })

      const elm = await screen.getAllByRole('heading', {level: 3})
      expect(elm.pop()).toBeVisible()
    })
  })

  describe('if on selection step', () => {
    it('renders the tabs', async () => {
      setup({
        currentStepIndex: 2,
        telegrafPlugins: [cpuTelegrafPlugin, diskTelegrafPlugin],
      })
      const tabs = await screen.findAllByTestId('sidebar-tab')
      expect(tabs.pop()).toBeVisible()
    })
  })
})
