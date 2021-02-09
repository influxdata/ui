// Libraries
import React from 'react'
import {screen} from '@testing-library/react'
import {renderWithReduxAndRouter} from 'src/mockState'

// Components
import SideBarButton from 'src/dataLoaders/components/side_bar/SideBarButton'
import {ComponentColor} from '@influxdata/clockface'

const onClick = jest.fn(() => {})

const setup = (override?) => {
  const props = {
    key: 'key',
    text: 'text',
    titleText: 'titleText',
    color: ComponentColor.Secondary,
    onClick,
    ...override,
  }

  renderWithReduxAndRouter(<SideBarButton {...props} />)
}

describe('SideBarButton', () => {
  describe('rendering', () => {
    it('renders! wee!', async () => {
      setup()
      const elm = await screen.getByTestId('button')
      expect(elm).toBeVisible()
    })
  })
})
