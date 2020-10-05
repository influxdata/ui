// Libraries
import React from 'react'
import userEvent from '@testing-library/user-event'
import {renderWithReduxAndRouter} from 'src/mockState'

// Components
import FlowCards from 'src/flows/components/FlowCards'
import FlowListProvider from 'src/flows/context/flow.list'

const setup = (override = {}) => {
  const wrapper = renderWithReduxAndRouter(
    <FlowListProvider {...override}>
      <FlowCards />
    </FlowListProvider>
  )

  return {wrapper}
}

describe('FlowCards', () => {
  test('empty state', () => {
    const {wrapper} = setup()

    const emptyState = wrapper.findByTestId('empty-state')

    expect(emptyState).toBeTruthy()
  })

  test('create a flow', () => {
    const {wrapper} = setup()

    userEvent.click(wrapper.getByTestId('create-flow--button'))

    const cards = wrapper.getAllByTestId(/flow-card/i)
    const name = wrapper.getByText('Name this Flow')

    expect(cards.length).toEqual(1)
    expect(name).toBeTruthy()
  })

  test('delete a flow', () => {
    const {wrapper} = setup()

    userEvent.click(wrapper.getByTestId('create-flow--button'))

    const cards = wrapper.getAllByTestId(/flow-card/i)

    expect(cards.length).toEqual(1)

    userEvent.hover(wrapper.getByTestId(/flow-card/i))
    userEvent.click(wrapper.getByText('Delete Flow'))
    userEvent.click(wrapper.getByText('Confirm'))

    const emptyState = wrapper.findByTestId('empty-state')

    expect(emptyState).toBeTruthy()
  })
})
