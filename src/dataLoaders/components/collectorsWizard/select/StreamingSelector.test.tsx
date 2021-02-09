// Libraries
import React from 'react'
import {screen, fireEvent} from '@testing-library/react'

// Components
import StreamingSelector from 'src/dataLoaders/components/collectorsWizard/select/StreamingSelector'

// Constants
import {PLUGIN_BUNDLE_OPTIONS} from 'src/dataLoaders/constants/pluginConfigs'

// Mocks
import {buckets} from 'mocks/dummyData'

import {renderWithReduxAndRouter} from 'src/mockState'

const setup = (override = {}) => {
  const selectedBucketName = buckets[0].name

  const props = {
    telegrafPlugins: [],
    pluginBundles: [],
    onTogglePluginBundle: jest.fn(),
    buckets,
    selectedBucketName,
    onSelectBucket: jest.fn(),
    ...override,
  }

  renderWithReduxAndRouter(<StreamingSelector {...props} />)
}

describe('Onboarding.Components.SelectionStep.StreamingSelector', () => {
  it('renders a filter input and plugin bundles', async () => {
    setup()
    const cards = await screen.getAllByTestId('square-grid--card')
    const filter = await screen.getByTestId('input-field')

    expect(cards.length).toBe(PLUGIN_BUNDLE_OPTIONS.length)
    expect(filter).toBeVisible()
  })

  describe('if searchTerm is not empty', () => {
    it('filters the plugin bundles', async () => {
      setup()
      const searchTerm = 'syste'
      const filter = await screen.getByTestId('input-field')
      fireEvent.change(filter, {target: {value: searchTerm}})

      const cards = await screen.getAllByTestId('square-grid--card')
      expect(cards.length).toBe(1)
    })
  })

  describe('buckets selection list', () => {
    it('can handle if bucket prop is initially unset', async () => {
      setup({bucket: ''})
      const cards = await screen.getAllByTestId('square-grid--card')
      expect(cards.length).toBe(PLUGIN_BUNDLE_OPTIONS.length)
    })
  })
})
