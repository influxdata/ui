// Libraries
import React from 'react'
import {screen} from '@testing-library/react'

// Components
import MemberList from 'src/members/components/MemberList'

// Constants
import {resouceOwner} from 'src/members/dummyData'

import {renderWithReduxAndRouter} from 'src/mockState'

const setup = (override?) => {
  const props = {
    members: resouceOwner,
    emptyState: <></>,
    ...override,
  }

  renderWithReduxAndRouter(<MemberList {...props} />)
}

describe('MemberList', () => {
  describe('rendering', () => {
    it('renders', async () => {
      setup()
      const elm = await screen.getByTestId('resource-list--body')
      expect(elm).toBeVisible()
    })
  })
})
