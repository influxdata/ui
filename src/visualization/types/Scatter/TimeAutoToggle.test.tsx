// Libraries
import React from 'react'
import {fireEvent, render} from '@testing-library/react'
import {jest} from '@jest/globals'

// Components
import ScatterOptions from 'src/visualization/types/Scatter/options'
import {TimeDomainAutoToggle} from 'src/visualization/types/Scatter/TimeAutoToggle'
// Utilities
import {renderWithRedux} from 'src/mockState'
import {mockAppState} from 'src/mockAppState'
import {useVisXDomainSettings} from 'src/visualization/utils/useVisDomainSettings'
import {defaultXColumn} from 'src/shared/utils/vis'

jest.mock('src/shared/utils/vis')
jest.mock('src/timeMachine/selectors')
jest.mock('src/visualization/utils/useVisDomainSettings')
const table = {
  getColumn: jest.fn(),
  getColumnType: jest.fn(),
  getOriginalColumnType: jest.fn(),
  columnKeys: [],
  getColumnLength: jest.fn(),
  length: 3,
  addColumn: jest.fn(),
  getColumnName: jest.fn(),
}
describe('Time Domain Auto Toggle', () => {
  const setup = ({properties = {}, results = {}}) => {
    const props: any = {
      properties: {
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
        type: 'scatter' as 'scatter',
        queries: [],
        shape: 'chronograf-v2' as 'chronograf-v2',
        note: '',
        ...properties,
      },
      results: {
        table,
        fluxGroupKeyUnion: ['', ''],
        resultColumnNames: [],
        ...results,
      },
      update: jest.fn(),
    }

    return renderWithRedux(<ScatterOptions {...props} />, () => {
      const copyMockState = {...mockAppState}
      return copyMockState
    })
  }
  describe('the toggle to auto scale time domain', () => {
    afterEach(() => {
      jest.clearAllMocks()
    })
    it('does not render if the value of `xColumn` is not `_time`', () => {
      const {queryByTestId} = setup({})
      expect(queryByTestId('time-domain-toggle')).toEqual(null)
    })
    it('renders if value of `xColumn` is `_time`', () => {
      jest.mocked(defaultXColumn).mockReturnValue('_time')
      jest.mocked(useVisXDomainSettings).mockReturnValue([])
      const {queryByTestId} = setup({
        properties: {
          xColumn: '_time',
        },
      } as any)

      expect(queryByTestId('time-domain-toggle')).toBeInTheDocument()
    })
  })
  describe('the time domain toggle slider', () => {
    afterEach(() => {
      jest.clearAllMocks()
    })
    it('is disabled if time domain is not available', () => {
      jest.mocked(useVisXDomainSettings).mockReturnValue([])
      const setDomainMock = jest.fn()
      const {getByTestId} = render(
        <TimeDomainAutoToggle
          table={{getColumn: jest.fn()} as any}
          setDomain={setDomainMock}
          xDomain={null}
        />
      )
      fireEvent.click(getByTestId('time-domain-toggle-slide'))
      expect(setDomainMock).not.toHaveBeenCalled()
    })
    it('fires setDomain call to set time with range if clicked from off to on, then resets when going from on to off', () => {
      jest.mocked(useVisXDomainSettings).mockReturnValue([[0, 20]])
      const setDomainMock = jest.fn()
      const {getByTestId} = render(
        <TimeDomainAutoToggle
          table={{getColumn: jest.fn()} as any}
          setDomain={setDomainMock}
          xDomain={null}
        />
      )
      fireEvent.click(getByTestId('time-domain-toggle-slide'))
      expect(setDomainMock).toHaveBeenCalledWith('x', [0, 20])
      fireEvent.click(getByTestId('time-domain-toggle-slide'))
      expect(setDomainMock).toHaveBeenCalledWith('x', [null, null])
    })
  })
})
