import {processStatusesResponse} from 'src/alerting/utils/statusEvents'
import {fromFlux, Table} from '@influxdata/giraffe'
import {range} from 'lodash'
import {mocked} from 'ts-jest/utils'

jest.mock('@influxdata/giraffe', () => ({
  fromFlux: jest.fn(),
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
  beforeEach(jest.clearAllMocks)

  it('process empty table', async () => {
    mocked(fromFlux).mockImplementationOnce(() => ({table: {length: 0}}))

    const actual = await processStatusesResponse({
      promise: Promise.resolve({
        type: 'SUCCESS',
        csv,
        bytesRead: 0,
        didTruncate: false,
      }),
      cancel,
    }).promise

    expect(actual.length).toBe(1)
    expect(actual[0].length).toBe(0)
  })

  it('process single table', async () => {
    const length = 100
    const cols = 20
    const table: Table = {
      columnKeys: ['table', ...range(cols).map(x => x.toString(10))],
      getColumn: (col: string) =>
        col === 'table'
          ? alwaysZero
          : (range(length).map(x => x * +col) as any),
      length,
      getColumnName: jest.fn(),
      getColumnType: jest.fn(),
      getOriginalColumnType: jest.fn(),
      addColumn: jest.fn(),
    }
    mocked(fromFlux).mockImplementationOnce(() => ({table}))
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
      }),
      cancel,
    }).promise

    expect(mocked(fromFlux).mock.calls[0][0]).toBe(csv)
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
      }),
      cancel,
    })

    await expect(promise).rejects.toEqual(new Error(message))
  })
})
