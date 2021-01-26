// Libraries
import React from 'react'
import {render, screen} from '@testing-library/react'

// Components
import SideBar from 'src/dataLoaders/components/side_bar/SideBar'

// Types
import {SideBarTabStatus as TabStatus} from 'src/dataLoaders/components/side_bar/SideBar'

import {renderWithReduxAndRouter} from 'src/mockState'

const onClick = jest.fn(() => {})

const childrenArray = [
  <SideBar.Tab
    label="a"
    key="a"
    id="a"
    data-testid="a"
    active={true}
    status={TabStatus.Default}
    onClick={onClick}
  />,
  <SideBar.Tab
    label="b"
    key="b"
    id="b"
    data-testid="b"
    active={false}
    status={TabStatus.Default}
    onClick={onClick}
  />,
]

const setup = (override?, childrenArray = []) => {
  const props = {
    title: 'titleString',
    visible: true,
    ...override,
  }

  renderWithReduxAndRouter(<SideBar {...props}>{childrenArray} </SideBar>)
}

describe('SideBar', () => {
  describe('rendering', () => {
    it('renders with no children', async () => {
      setup()

      const elm = await screen.findByTestId('side-bar')

      expect(elm).toBeVisible()
    })

    it('renders with children, and renders its children', async () => {
      setup(null, childrenArray)
      const elm = await screen.findByTestId('side-bar')

      expect(elm).toBeVisible()
      childrenArray.forEach(child => {
        expect(elm.innerHTML).toContain(render(child).container.innerHTML)
      })
    })
  })
})
