import * as history from 'src/alerting/utils/history'
import {fromFlux, Table} from '@influxdata/giraffe'
import {range, uniq} from 'lodash'
import {mocked} from 'ts-jest/utils'
import {runQuery} from 'src/shared/apis/query'

jest.mock('@influxdata/giraffe', () => ({
  fromFlux: jest.fn(),
  // todo: test will fails on binaryPrefixFormatter not a function in src/shared/copy/notifications.ts:22:24 this mock can be removed after this will be fixed
  binaryPrefixFormatter: jest.fn(),
}))

jest.mock('src/cloud/utils/reporting', () => ({
  event: jest.fn(),
}))

jest.mock('src/shared/apis/query', () => ({
  runQuery: jest.fn(),
}))

jest.spyOn(history, 'processResponse')
const {processResponse, loadStatuses} = history

const alwaysZero = new Proxy([], {
  get: (target, prop) =>
    typeof prop === 'string' && Number.isInteger(+prop) ? 0 : target[prop],
})

const csv = 'some csv'
const cancel = jest.fn()

describe('history utils', () => {
  beforeEach(jest.clearAllMocks)

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

  describe('process response', () => {
    it('process empty table', async () => {
      mocked(fromFlux).mockImplementationOnce(() => ({
        table: {...table, length: 0},
        fluxGroupKeyUnion,
        resultColumnNames,
      }))

      const actual = await processResponse({
        promise: Promise.resolve({
          type: 'SUCCESS',
          csv,
          bytesRead: 0,
          didTruncate: false,
        }),
        cancel,
      }).promise

      expect(actual.length).toBe(0)
    })

    it('process single table', async () => {
      mocked(fromFlux).mockImplementationOnce(() => ({
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

      const actual = await processResponse({
        promise: Promise.resolve({
          type: 'SUCCESS',
          csv,
          bytesRead: 0,
          didTruncate: false,
        }),
        cancel,
      }).promise

      expect(mocked(fromFlux).mock.calls[0][0]).toBe(csv)
      expect(actual).toMatchObject(expected)
    })

    it('rejects on non-success response', async () => {
      const message = 'resulted with error'
      const {promise} = processResponse({
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

  describe('load statuses', () => {
    it('should use processResponse function', () => {
      const id = 'some-id'
      const runqueryReturnObj: any = {}
      mocked(runQuery).mockImplementationOnce(() => runqueryReturnObj)
      mocked(history.processResponse).mockReturnValueOnce(undefined)

      loadStatuses(id, {limit: 100, offset: 0, until: 0})

      expect(mocked(runQuery).mock.calls[0][0]).toBe('some-id')
      expect(mocked(processResponse).mock.calls[0][0]).toBe(runqueryReturnObj)
    })

    it('should use all passed arguments to build query', () => {
      type Params = Parameters<typeof loadStatuses>[1]
      const defaultArgs: Params = {
        limit: 100,
        offset: 20,
        until: 10,
        filter: undefined,
        since: 0,
      }
      const argumentSet: Partial<Params>[] = [
        {},
        {limit: 67682},
        {offset: 45073},
        {until: -8213},
        {since: 89846},
        {offset: 42820, until: 61560},
        // todo: test filter + renameTagKeys
      ]

      mocked(runQuery).mockReturnValue(undefined)
      mocked(history.processResponse).mockReturnValue(undefined)

      argumentSet
        .map(x => ({...defaultArgs, ...x}))
        .forEach(loadStatuses.bind(undefined, ''))

      const queries = mocked(runQuery).mock.calls.map(x => x[1])
      const uniqueQuieries = uniq(queries)

      expect(queries.length).toBe(uniqueQuieries.length)
    })
  })
})
