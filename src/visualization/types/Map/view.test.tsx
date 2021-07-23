import React from 'react'
import {render} from '@testing-library/react'
import GeoPlot from './view'
import properties from './properties'
import {DEFAULT_THRESHOLDS_GEO_COLORS} from 'src/shared/constants/thresholds'
import {CLOUD} from 'src/shared/constants'

jest.mock('src/client/mapsdRoutes')

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

const setup = () => {
  const props = {
    properties: properties,
    result: {
      table,
      fluxGroupKeyUnion: ['', ''],
      results: {},
    },
  }

  return render(<GeoPlot {...props} />)
}

const skipOss = CLOUD ? describe : describe.skip

skipOss('Map component renders', () => {
  it('returns with helpful error message when map service is down', () => {
    jest.mock('src/visualization/types/Map/api', () => {
      throw new Error('Service Unavailable')
    })
    const {queryByTestId} = setup()
    expect(queryByTestId('panel-resizer--error')).toEqual(null)
  })
})

skipOss('Map color layers', () => {
  it('has autofilled', () => {
    expect(properties.layers[0].colors).toEqual(DEFAULT_THRESHOLDS_GEO_COLORS)
  })
  it('can be overwritten', () => {
    expect(properties.layers[0].colors).toEqual(DEFAULT_THRESHOLDS_GEO_COLORS)
    const newcolors = [
      {
        type: 'min',
        value: '5',
        hex: '#9394FF',
        id: '0',
        name: 'comet',
      },
    ]
    properties.layers[0].colors = newcolors
    expect(properties.layers[0].colors).toEqual(newcolors)
  })
})
