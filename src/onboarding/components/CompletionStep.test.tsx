// Libraries
import React from 'react'
import {screen} from '@testing-library/react'

// Components
import CompletionStep from 'src/onboarding/components/CompletionStep'

// Dummy Data
import {defaultOnboardingStepProps} from 'mocks/dummyData'

import {renderWithReduxAndRouter} from 'src/mockState'

const setup = (override = {}) => {
  const props = {
    ...defaultOnboardingStepProps,
    orgID: '',
    bucketID: '',
    ...override,
  }

  renderWithReduxAndRouter(<CompletionStep {...props} />)
}

describe('Onboarding.Components.CompletionStep', () => {
  it('renders', async () => {
    setup()
    const elm = await screen.getByTestId('completion-step')
    expect(elm).toBeVisible()
  })
})
