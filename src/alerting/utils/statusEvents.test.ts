import {range} from 'lodash'
import {jest} from '@jest/globals'
import {fromFlux, Table} from '@influxdata/giraffe'

import {processStatusesResponse} from 'src/alerting/utils/statusEvents'

jest.mock('@influxdata/giraffe', () => ({
  fromFlux: jest.fn(),
  // todo: test will fails on binaryPrefixFormatter not a function in src/shared/copy/notifications.ts:22:24 this mock can be removed after this will be fixed
  binaryPrefixFormatter: jest.fn(),
}))
// todo: test will fails on binaryPrefixFormatter not a function in src/shared/copy/notifications.ts:22:24 this mock can be removed after this will be fixed
jest.mock('src/cloud/utils/reporting')

const alwaysZero = new Proxy([], {
  get: (target, prop) =>
    typeof prop === 'string' && Number.isInteger(+prop) ? 0 : target[prop],
})

const csv = 'some csv'
const cancel = jest.fn()

describe('process statuses response', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  const fluxGroupKeyUnion = ['']
  const resultColumnNames = []
  const length = 100
  const cols = 20
  const table: Table = {
    columnKeys: ['table', ...range(cols).map(x => x.toString(10))],
    getColumn: (col: string) =>
      col === 'table' ? alwaysZero : (range(length).map(x => x * +col) as any),
    length,
    getColumnName: jest.fn(),
    getColumnType: jest.fn(),
    getOriginalColumnType: jest.fn(),
    addColumn: jest.fn(),
  }

  it('process empty table', async () => {
    jest.mocked(fromFlux).mockImplementationOnce(() => ({
      table: {...table, length: 0},
      fluxGroupKeyUnion,
      resultColumnNames,
    }))

    const actual = await processStatusesResponse({
      promise: Promise.resolve({
        type: 'SUCCESS',
        csv,
        bytesRead: 0,
        didTruncate: false,
        tableCnt: 1,
      }),
      cancel,
    }).promise

    expect(actual.length).toBe(1)
    expect(actual[0].length).toBe(0)
  })

  it('process single table', async () => {
    jest.mocked(fromFlux).mockImplementationOnce(() => ({
      table,
      fluxGroupKeyUnion,
      resultColumnNames,
    }))
    const expected = range(length).map(i =>
      Object.fromEntries([
        ['table', 0],
        ...range(cols).map(col => [col, i * col]),
      ])
    )

    const actual = await processStatusesResponse({
      promise: Promise.resolve({
        type: 'SUCCESS',
        csv,
        bytesRead: 0,
        didTruncate: false,
        tableCnt: 1,
      }),
      cancel,
    }).promise

    expect(jest.mocked(fromFlux).mock.calls[0][0]).toBe(csv)
    expect(actual.length).toBe(1)
    expect(actual[0]).toMatchObject(expected)
  })

  it('rejects on non-success response', async () => {
    const message = 'resulted with error'
    const {promise} = processStatusesResponse({
      promise: Promise.resolve({
        type: 'UNKNOWN_ERROR',
        message,
        csv: '',
        bytesRead: 0,
        didTruncate: false,
        tableCnt: 0,
      }),
      cancel,
    })

    await expect(promise).rejects.toEqual(new Error(message))
  })
})
