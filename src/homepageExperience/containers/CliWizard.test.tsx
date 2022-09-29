// Libraries
import React from 'react'
import {fireEvent, screen} from '@testing-library/react'
import {renderWithRedux} from 'src/mockState'

// Components
import {CliWizard} from 'src/homepageExperience/containers/CliWizard'

jest.mock('canvas-confetti')
jest.mock('assets/images/sample-csv.png', () => {
  return 'csv screenshot'
})

const setup = () => {
  return renderWithRedux(<CliWizard />)
}

describe('Navigation', () => {
  describe('Next and Previous Buttons', () => {
    it('cannot click next on final step', async () => {
      setup()
      await fireEvent.click(screen.getByText('Finish'))
      const nextButton = screen.getByTestId('cli-next-button')
      expect(nextButton).toHaveAttribute('disabled')
    })
    it('cannot click previous on first step', async () => {
      setup()
      await fireEvent.click(screen.getByText('Overview'))
      const prevButton = screen.getByTestId('cli-prev-button')
      expect(prevButton).toHaveAttribute('disabled')
    })
    it('can click next on the first step', async () => {
      setup()
      await fireEvent.click(screen.getByText('Overview'))
      const prevButton = screen.getByTestId('cli-next-button')
      expect(prevButton).not.toHaveAttribute('disabled')
    })
    it('can click previous on the last step', async () => {
      setup()
      await fireEvent.click(screen.getByText('Finish'))
      const prevButton = screen.getByTestId('cli-prev-button')
      expect(prevButton).not.toHaveAttribute('disabled')
    })
  })
})
