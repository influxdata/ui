import React from 'react'

import DateRangePicker from './DateRangePicker'
import {convertTimeRangeToCustom} from 'src/shared/utils/duration'
import {pastHourTimeRange} from 'src/shared/constants/timeRanges'
import {renderWithReduxAndRouter} from 'src/mockState'

import {screen} from '@testing-library/dom'
import {fireEvent} from '@testing-library/react'

jest.useFakeTimers().setSystemTime(new Date('2022-03-10 20:00:00').getTime())

describe('Date Range Picker', function () {
  it('should have input values in the correct format after user changes the date selection', () => {
    const {getAllByText} = renderWithReduxAndRouter(
      <DateRangePicker
        timeRange={convertTimeRangeToCustom(pastHourTimeRange)}
        onSetTimeRange={() => {}}
        onClose={() => {}}
        position={{position: 'relative'}}
      />
    )

    // YYYY-MM-DD HH:mm format by default
    expect(screen.getByTitle('Start')).toHaveValue('2022-03-10 19:00:00')
    expect(screen.getByTitle('Stop')).toHaveValue('2022-03-10 20:00:00')

    // change the time and the format should stay the same

    const lowerTime = getAllByText('18:00')[0]
    const upperTime = getAllByText('21:00')[1]

    fireEvent.click(lowerTime)
    fireEvent.click(upperTime)

    expect(screen.getByTitle('Start')).toHaveValue('2022-03-10 18:00:00')
    expect(screen.getByTitle('Stop')).toHaveValue('2022-03-10 21:00:00')
  })

  it('should have the `Apply Time Range` Button disabled on invalid input', () => {
    const {getAllByTestId, getByTestId} = renderWithReduxAndRouter(
      <DateRangePicker
        timeRange={convertTimeRangeToCustom(pastHourTimeRange)}
        onSetTimeRange={() => {}}
        onClose={() => {}}
        position={{position: 'relative'}}
      />
    )
    const lowerInput = getAllByTestId('timerange--input')[0]

    fireEvent.change(lowerInput, {target: {value: 'iampumpkinthecat;)'}})

    const applyButton = getByTestId('daterange--apply-btn')

    expect(applyButton).toBeDisabled()
  })
})
