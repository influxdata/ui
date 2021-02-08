// Libraries
import React from 'react'
import {screen} from '@testing-library/react'

// Components
import AdminStep from 'src/onboarding/components/AdminStep'

// Dummy Data
import {defaultOnboardingStepProps} from 'mocks/dummyData'

import {renderWithReduxAndRouter} from 'src/mockState'

const setup = (override = {}) => {
  const props = {
    ...defaultOnboardingStepProps,
    onSetupAdmin: jest.fn(),
    ...override,
  }

  renderWithReduxAndRouter(<AdminStep {...props} />)
}

describe('Onboarding.Components.AdminStep', () => {
  it('renders', async () => {
    setup()
    const elm = await screen.getByTestId('admin-step')
    expect(elm).toBeVisible()
  })
})
