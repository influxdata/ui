// Libraries
import React from 'react'
import {screen} from '@testing-library/react'

// Components
import {SelectCollectorsStep} from 'src/dataLoaders/components/collectorsWizard/select/SelectCollectorsStep'

// Types
import {DataLoaderType} from 'src/types/dataLoaders'
import {Bucket} from 'src/types'

// Dummy Data
import {
  defaultOnboardingStepProps,
  cpuTelegrafPlugin,
  bucket,
} from 'mocks/dummyData'

import {renderWithReduxAndRouter} from 'src/mockState'

const setup = (override = {}) => {
  const props = {
    ...defaultOnboardingStepProps,
    bucket: 'b1',
    telegrafPlugins: [],
    pluginBundles: [],
    type: DataLoaderType.Empty,
    onAddPluginBundle: jest.fn(),
    onRemovePluginBundle: jest.fn(),
    onSetDataLoadersType: jest.fn(),
    onSetActiveTelegrafPlugin: jest.fn(),
    currentStepIndex: 2,
    substep: undefined,
    location: null,
    router: null,
    routes: [],
    selectedBucket: '',
    onSetBucketInfo: jest.fn(),
    buckets: [{name: 'b1', id: 'b1'} as Bucket],
    ...override,
  }

  renderWithReduxAndRouter(<SelectCollectorsStep {...props} />)
}

describe('DataLoaders.Components.CollectorsWizard.Select.SelectCollectorsStep', () => {
  describe('if there are no plugins selected', () => {
    it('renders streaming selector with buttons', async () => {
      setup({
        type: DataLoaderType.Streaming,
        currentStepIndex: 0,
        substep: 'streaming',
      })

      const elm = await screen.findByTestId('form-container')
      const elm2 = await screen.findByTestId('next')

      expect(elm).toBeVisible()
      expect(elm2).toBeVisible()
      expect(elm2).toBeDisabled()
    })
  })

  describe('if there are plugins selected', () => {
    it('renders next button with correct status', async () => {
      setup({
        type: DataLoaderType.Streaming,
        currentStepIndex: 0,
        substep: 'streaming',
        telegrafPlugins: [cpuTelegrafPlugin],
        bucket: bucket.name,
        buckets: [bucket],
      })
      const elm2 = await screen.findByTestId('next')
      expect(elm2).toBeVisible()
      expect(elm2).not.toBeDisabled()
    })
  })
})
