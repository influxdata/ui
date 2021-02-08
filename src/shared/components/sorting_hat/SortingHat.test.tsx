// Libraries
import React from 'react'
import {screen} from '@testing-library/react'

// Components
import SortingHat from 'src/shared/components/sorting_hat/SortingHat'

// Types
import {Sort} from 'src/clockface/types'

import {renderWithReduxAndRouter} from 'src/mockState'

const users = [
  {user: {name: 'fred'}, age: 48},
  {user: {name: 'barney'}, age: 34},
  {user: {name: 'fred'}, age: 40},
  {user: {name: 'barney'}, age: 36},
]

const setup = (override?) => {
  const children = jest.fn(() => <div data-testid="my-special-div" />)
  const props = {
    list: users,
    sortKey: 'user.name',
    direction: Sort.Ascending,
    children,
    ...override,
  }

  renderWithReduxAndRouter(<SortingHat {...props} />)

  return children
}

describe('SortingHat', () => {
  describe('rendering', () => {
    it('renders', async () => {
      setup()
      const elm = await screen.findByTestId('my-special-div')
      expect(elm).toBeVisible()
    })
  })

  describe('sorting', () => {
    it('can sort a nested object by sort key', () => {
      const sortKey = 'user.name'
      const direction = Sort.Ascending
      const expected = [
        {user: {name: 'barney'}, age: 34},
        {user: {name: 'barney'}, age: 36},
        {user: {name: 'fred'}, age: 48},
        {user: {name: 'fred'}, age: 40},
      ]

      const children = setup({sortKey, direction})

      expect(children).toBeCalledWith(expected)
    })
  })
})
