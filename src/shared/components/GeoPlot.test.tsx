import React from 'react'
import {render} from '@testing-library/react'
import GeoPlot from 'src/shared/components/GeoPlot'
import {defaultPointMap} from 'src/timeMachine/reducers/geoOptionsReducer'

jest.mock('src/shared/utils/vis.ts', () => {
  return {
    getLatLon: jest.fn(() => {
      return null
    }),
  }
})
const setup = (overrideProps = {}) => {
  const props = {
    children: jest.fn(),
    table: {
      getColumn: jest.fn(),
      getColumnName: jest.fn(),
      getColumnType: jest.fn(),
      getOriginalColumnType: jest.fn(),
      columnKeys: ['key', 'keykey', 'keykeykey'],
      length: 666,
      addColumn: jest.fn(),
    },
    viewProperties: {
      type: 'geo' as 'geo',
      queries: [],
      shape: 'chronograf-v2' as 'chronograf-v2',
      center: {
        lat: 0,
        lon: 0,
      },
      zoom: 6,
      allowPanAndZoom: true,
      detectCoordinateFields: true,
      mapStyle: '',
      note: '',
      showNoteWhenEmpty: true,
      colors: [],
      layers: [defaultPointMap],
    },
    ...overrideProps,
  }

  return render(<GeoPlot {...props} />)
}
describe('GeoPlot Map Component', () => {
  it('renders the error message for missing data when getLatLon returns null', () => {
    const {queryByTestId} = setup()

    expect(queryByTestId('geoplot-error')).toBeInTheDocument()
  })
})
