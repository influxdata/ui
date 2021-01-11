// Libraries
import React from 'react'
import {mocked} from 'ts-jest/utils'
import * as reactRedux from 'react-redux'
import {fireEvent, render} from '@testing-library/react'

// Components
import ScatterOptions from 'src/timeMachine/components/view_options/ScatterOptions'
import TimeAutoToggle from 'src/timeMachine/components/view_options/TimeAutoToggle'

// Utilities
import {renderWithRedux} from 'src/mockState'
import {mockAppState} from 'src/mockAppState'
import {
  defaultXColumn,
  getGroupableColumns,
  getNumericColumns,
} from 'src/shared/utils/vis'

jest.mock('src/shared/utils/vis')

describe('Time Domain Auto Toggle', () => {
  const setup = (options = {xColumn: '_start'}) => {
    const props = {
      fillColumns: ['a', 'b'],
      symbolColumns: ['a'],
      xDomain: [0],
      yDomain: [0],
      xAxisLabel: 'x',
      yAxisLabel: 'y',
      xPrefix: 'x',
      xSuffix: 'x',
      yPrefix: 'y',
      ySuffix: 'y',
      colors: ['green', 'gold'],
      xColumn: '_start',
      yColumn: 'blah',
      showNoteWhenEmpty: false,
      ...options,
    }
    return renderWithRedux(<ScatterOptions {...props} />, () => {
      const copyMockState = {...mockAppState}
      return copyMockState
    })
  }
  describe('the toggle to auto scale time domain', () => {
    beforeEach(() => {
      mocked(getGroupableColumns).mockImplementation(() => [])
      mocked(getNumericColumns).mockImplementation(() => [])
    })
    afterEach(() => {
      jest.clearAllMocks()
      mocked(defaultXColumn).mockReset()
    })
    it('does not render if the value of `xColumn` is not `_time`', () => {
      const {queryByTestId} = setup()
      mocked(defaultXColumn).mockImplementation(() => '_start')

      expect(queryByTestId('time-domain-toggle')).toEqual(null)
    })

    it('renders if value of `xColumn` is `_time`', () => {
      mocked(defaultXColumn).mockImplementation(() => '_time')
      const {queryByTestId} = setup()

      expect(queryByTestId('time-domain-toggle')).toBeInTheDocument()
    })
  })

  describe('the time domain toggle slider', () => {
    const useSelectorMock = jest.spyOn(reactRedux, 'useSelector')
    beforeEach(() => {
      useSelectorMock.mockClear()
    })
    afterEach(() => {
      jest.clearAllMocks()
    })

    it('is disabled if time domain is not available', () => {
      useSelectorMock.mockReturnValue(null)
      const setDomainMock = jest.fn()

      const {getByTestId} = render(
        <TimeAutoToggle onSetDomain={setDomainMock} />
      )

      fireEvent.click(getByTestId('time-domain-toggle-slide'))

      expect(setDomainMock).not.toHaveBeenCalled()
    })
    it('fires onSetDomain call to set time with range if clicked from off to on, then resets when going from on to off', () => {
      useSelectorMock.mockReturnValue([0, 20])
      const setDomainMock = jest.fn()

      const {getByTestId} = render(
        <TimeAutoToggle onSetDomain={setDomainMock} />
      )

      fireEvent.click(getByTestId('time-domain-toggle-slide'))

      expect(setDomainMock).toHaveBeenCalledWith([0, 20])

      fireEvent.click(getByTestId('time-domain-toggle-slide'))

      expect(setDomainMock).toHaveBeenCalledWith(null)
    })
  })
})
