// Libraries
import React from 'react'
import {render} from '@testing-library/react'

import FlowsIndex from 'src/notebooks/components/FlowsIndex'

jest.mock('src/notebooks/context/req', () => ({
  __esModule: true,
  default: null,
  req: {
    context: () => ({
      keys: () => [],
    }),
  },
}))

const setup = () => {
  const wrapper = render(<FlowsIndex />)

  return {wrapper}
}

test('it renders empty state', () => {
  const {wrapper} = setup()
  const {getByTestId} = wrapper

  const empty = getByTestId('empty-state')

  expect(empty).toBeTruthy()
})
