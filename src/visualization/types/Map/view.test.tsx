import React from 'react'
import {render} from '@testing-library/react'
import GeoPlot from './view'
import properties from './properties'

jest.mock('src/visualization/types/Map/api')

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

describe('Map component renders', () => {
  it('returns with helpful error message when map data is not provided', () => {
    jest.mock('src/visualization/types/Map/api', () => {
      throw new Error('Service Unavailable')
    })
    const {queryByTestId} = setup()
    expect(queryByTestId('panel-resizer--error')).toEqual(null)
  })
})

// describe('Map component throws an error', () => {
//   it('returns with helpful error message when map data is not provided', () => {

// jest.mock('src/visualization/types/Map/api', () => {
//   ;() => {
//     'RandomTempTokenHere'
//   }
// }) // </whatever> in the describe block of your tests for the "happy path" cases
//   })
// })
