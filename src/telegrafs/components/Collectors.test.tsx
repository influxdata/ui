// Libraries
import React from 'react'
import {screen} from '@testing-library/react'

// Components
import {Collectors} from 'src/telegrafs/components/Collectors'

import {renderWithReduxAndRouter} from 'src/mockState'
import {withRouterProps} from 'mocks/dummyData'

jest.mock('src/resources/components/GetResources')

const setup = (override = {}) => {
  const props = {
    ...withRouterProps,
    hasTelegrafs: false,
    orgName: 'orgName',
    buckets: [],
    onSetTelegrafConfigID: jest.fn(),
    onSetTelegrafConfigName: jest.fn(),
    onClearDataLoaders: jest.fn(),
    onUpdateTelegraf: jest.fn(),
    onDeleteTelegraf: jest.fn(),
    ...override,
  }

  renderWithReduxAndRouter(<Collectors {...props} />)
}

describe('Collectors page', () => {
  it('does not allow clicking on create configuration button if buckets are empty', async () => {
    setup()

    const createConfigButton = await screen.getAllByTestId(
      'create-telegraf-configuration-button'
    )

    expect(createConfigButton[0]).toBeDisabled()
    expect(createConfigButton[1]).toBeDisabled()
  })
})
