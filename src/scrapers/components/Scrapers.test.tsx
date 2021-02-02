// Libraries
import React from 'react'
import {screen} from '@testing-library/react'

// Components
import ScraperList from 'src/scrapers/components/ScraperList'

// Constants
import {scraperTargets} from 'mocks/dummyData'

import {renderWithReduxAndRouter} from 'src/mockState'

const setup = (override?) => {
  const props = {
    scrapers: scraperTargets,
    emptyState: <></>,
    onDeleteScraper: jest.fn(),
    onUpdateScraper: jest.fn(),
    ...override,
  }

  renderWithReduxAndRouter(<ScraperList {...props} />)
}

describe('ScraperList', () => {
  describe('rendering', () => {
    it('renders', async () => {
      setup()
      const elm = await screen.getByTestId('resource-list')
      expect(elm).toBeVisible()
    })
  })
})
