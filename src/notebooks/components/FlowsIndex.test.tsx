// Libraries
import React from 'react'
import {renderWithReduxAndRouter} from 'src/mockState'

import FlowsIndex from 'src/notebooks/components/FlowsIndex'

jest.mock('src/notebooks/index', () => ({
  default: {
    context: () => {},
  },
}))

jest.mock('src/external/monaco.onigasm', () => () => ({
  default: (_, __) => {},
}))

const setup = () => {
  const wrapper = renderWithReduxAndRouter(<FlowsIndex />)

  return {wrapper}
}

test('it renders empty state', () => {
  const {wrapper} = setup()
  const {getByTestId} = wrapper

  const empty = getByTestId('empty-state')

  expect(empty).toBeTruthy()
})
