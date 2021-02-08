import {mocked} from 'ts-jest/utils'
import {runQuery} from 'src/shared/apis/query'
import {
  getCachedResultsOrRunQuery,
  resetQueryCache,
  resetQueryCacheByQuery,
  TIME_INVALIDATION,
} from 'src/shared/apis/queryCache'
import {RunQuerySuccessResult} from 'src/shared/apis/query'
import {Variable, RemoteDataState} from 'src/types'

jest.mock('src/shared/apis/query')

const orgID = 'orgID'

const promise = new Promise(res => {
  return res({
    type: 'SUCCESS',
    csv: 'wooooo',
    didTruncate: true,
    bytesRead: 1,
  } as RunQuerySuccessResult)
})

const variables: Variable[] = [
  {
    id: '054b7476389f1000',
    orgID: '',
    status: RemoteDataState.Done,
    labels: [],
    name: 'bucket',
    selected: ['Homeward Bound'],
    arguments: {
      type: 'query',
      values: {
        query:
          '// buckets\nbuckets()\n  |> filter(fn: (r) => r.name !~ /^_/)\n  |> rename(columns: {name: "_value"})\n  |> keep(columns: ["_value"])\n',
        language: 'flux',
      },
    },
  },
  {
    id: '05782ef09ddb8000',
    orgID: '',
    status: RemoteDataState.Done,
    labels: [],
    name: 'base_query',
    selected: [],
    arguments: {
      type: 'query',
      values: {
        query:
          '// base_query\nfrom(bucket: v.bucket)\n  |> range(start: v.timeRangeStart, stop: v.timeRangeStop)\n  |> filter(fn: (r) => r._measurement == "cpu")\n  |> filter(fn: (r) => r._field == "usage_user")',
        language: 'flux',
      },
    },
  },
  {
    id: '05aeb0ad75aca000',
    orgID: '',
    status: RemoteDataState.Done,
    labels: [],
    name: 'values',
    selected: ['system'],
    arguments: {
      type: 'map',
      values: {
        system: 'system',
        usage_user: 'usage_user',
      },
    },
  },
  {
    id: '05ba3253105a5000',
    orgID: '',
    status: RemoteDataState.Done,
    labels: [],
    name: 'broker_host',
    selected: [],
    arguments: {
      type: 'query',
      values: {
        query:
          '// broker_host\nimport "influxdata/influxdb/v1"\nv1.tagValues(bucket: v.bucket, tag: "host")',
        language: 'flux',
      },
    },
  },
  {
    id: '05e6e4df2287b000',
    orgID: '',
    status: RemoteDataState.Done,
    labels: [],
    name: 'deployment',
    selected: [],
    arguments: {
      type: 'query',
      values: {
        query:
          '// deployment\nimport "influxdata/influxdb/v1"\nv1.tagValues(bucket: v.bucket, tag: "cpu") |> keep(columns: ["_value"])',
        language: 'flux',
      },
    },
  },
  {
    id: '05e6e4fb0887b000',
    orgID: '',
    status: RemoteDataState.Done,
    labels: [],
    name: 'build',
    selected: [],
    arguments: {
      type: 'query',
      values: {
        query:
          '// build\nimport "influxdata/influxdb/v1"\nimport "strings"\n\nv1.tagValues(bucket: v.bucket, tag: "cpu") |> filter(fn: (r) => strings.hasSuffix(v: r._value, suffix: v.deployment))',
        language: 'flux',
      },
    },
  },
]

describe('query', () => {
  describe('runQuery', () => {
    beforeEach(() => {
      jest.clearAllMocks()
      resetQueryCache()
    })

    it('calls runQuery when there is no matching query in the cache & returns cached results when an unexpired match is found', done => {
      // returns a mock runQuery
      mocked(runQuery).mockImplementation(() => ({
        promise,
        cancel: jest.fn(),
      }))
      const queryText = '|> get some data fool'
      const result = getCachedResultsOrRunQuery(orgID, queryText, variables)
      expect(runQuery).toHaveBeenCalledTimes(1)
      result.promise.then(() => {
        try {
          getCachedResultsOrRunQuery(orgID, queryText, variables)
          expect(runQuery).toHaveBeenCalledTimes(1)
          done()
        } catch (error) {
          done(error)
        }
      })
    })

    it('clears the cache by queryText', done => {
      mocked(runQuery).mockImplementation(() => ({
        promise,
        cancel: jest.fn(),
      }))
      const queryText = '|> get some data fool'
      const result = getCachedResultsOrRunQuery(orgID, queryText, variables)
      expect(runQuery).toHaveBeenCalledTimes(1)
      result.promise.then(() => {
        try {
          resetQueryCacheByQuery(queryText)
          getCachedResultsOrRunQuery(orgID, queryText, variables)
          expect(runQuery).toHaveBeenCalledTimes(2)
          done()
        } catch (error) {
          done(error)
        }
      })
    })
    // Skip this until we can update the TIME_INVALIDATION
    it.skip('invalidates the cached results after the time invalidation constant', done => {
      mocked(runQuery).mockImplementation(() => ({
        promise,
        cancel: jest.fn(),
      }))
      const queryText = '|> get some data fool'
      getCachedResultsOrRunQuery(orgID, queryText, variables)
      expect(runQuery).toHaveBeenCalledTimes(1)
      setTimeout(() => {
        try {
          getCachedResultsOrRunQuery(orgID, queryText, variables)
          expect(runQuery).toHaveBeenCalledTimes(2)
          done()
        } catch (error) {
          done(error)
        }
      }, TIME_INVALIDATION + 100)
    }, 6000)
    it('returns the cached results when an unexpired match with the same variable is found', done => {
      mocked(runQuery).mockImplementation(() => ({
        promise,
        cancel: jest.fn(),
      }))
      const queryText = 'v.bucket'
      const result = getCachedResultsOrRunQuery(orgID, queryText, variables)
      expect(runQuery).toHaveBeenCalledTimes(1)
      result.promise.then(() => {
        try {
          getCachedResultsOrRunQuery(orgID, queryText, variables)
          expect(runQuery).toHaveBeenCalledTimes(1)
          done()
        } catch (error) {
          done(error)
        }
      })
    })
    it('deduplicates variables and returns the cached results when an unexpired match with the same variable is found', done => {
      mocked(runQuery).mockImplementation(() => ({
        promise,
        cancel: jest.fn(),
      }))
      const queryText = `|> v.bucket
      |> v.bucket`
      const result = getCachedResultsOrRunQuery(orgID, queryText, variables)
      expect(runQuery).toHaveBeenCalledTimes(1)
      result.promise.then(() => {
        try {
          getCachedResultsOrRunQuery(orgID, queryText, variables)
          expect(runQuery).toHaveBeenCalledTimes(1)
          done()
        } catch (error) {
          done(error)
        }
      })
    })
    it('deduplicates windowPeriod variables and returns the cached results when an unexpired match with the same variable is found', done => {
      mocked(runQuery).mockImplementation(() => ({
        promise,
        cancel: jest.fn(),
      }))
      const queryText = `v.bucket
      |> v.windowPeriod
      |> v.windowPeriod`
      const result = getCachedResultsOrRunQuery(orgID, queryText, variables)
      expect(runQuery).toHaveBeenCalledTimes(1)
      result.promise.then(() => {
        try {
          getCachedResultsOrRunQuery(orgID, queryText, variables)
          expect(runQuery).toHaveBeenCalledTimes(1)
          done()
        } catch (error) {
          done(error)
        }
      })
    })
    it('resets the matching query if the variables do not match and reruns the query', done => {
      mocked(runQuery).mockImplementation(() => ({
        promise,
        cancel: jest.fn(),
      }))
      const queryText = 'v.build'
      const index = variables.findIndex(
        variable => variable.id === '05e6e4df2287b000'
      )
      const originalName = variables[index].name
      const result = getCachedResultsOrRunQuery(orgID, queryText, variables)
      expect(runQuery).toHaveBeenCalledTimes(1)
      result.promise
        .then(() => {
          try {
            const variablesCopy = JSON.parse(JSON.stringify(variables))
            variablesCopy[index].name = 'newName'
            getCachedResultsOrRunQuery(orgID, queryText, variablesCopy)
            expect(runQuery).toHaveBeenCalledTimes(2)
          } catch (error) {
            done(error)
          }
        })
        .then(() => {
          try {
            variables[index].name = originalName
            getCachedResultsOrRunQuery(orgID, queryText, variables)
            expect(runQuery).toHaveBeenCalledTimes(3)
            done()
          } catch (error) {
            done(error)
          }
        })
    })
    it('resets the matching query if the selected variables do not match and reruns the query', done => {
      mocked(runQuery).mockImplementation(() => ({
        promise,
        cancel: jest.fn(),
      }))
      const queryText = 'v.values'
      const index = variables.findIndex(
        variable => variable.id === '05aeb0ad75aca000'
      )
      const [selected] = variables[index].selected
      const result = getCachedResultsOrRunQuery(orgID, queryText, variables)
      expect(runQuery).toHaveBeenCalledTimes(1)
      result.promise
        .then(() => {
          try {
            const variablesCopy = JSON.parse(JSON.stringify(variables))
            variablesCopy[index].selected[0] = 'usage_user'
            getCachedResultsOrRunQuery(orgID, queryText, variablesCopy)
            expect(runQuery).toHaveBeenCalledTimes(2)
          } catch (error) {
            done(error)
          }
        })
        .then(() => {
          try {
            variables[index].selected[0] = selected
            getCachedResultsOrRunQuery(orgID, queryText, variables)
            expect(runQuery).toHaveBeenCalledTimes(3)
            done()
          } catch (error) {
            done(error)
          }
        })
    })
    it('returns cached results even when variables irrelevant to a query are toggled', done => {
      mocked(runQuery).mockImplementation(() => ({
        promise,
        cancel: jest.fn(),
      }))
      const queryText = 'v.bucket'
      const result = getCachedResultsOrRunQuery(orgID, queryText, variables)
      expect(runQuery).toHaveBeenCalledTimes(1)
      result.promise.then(() => {
        try {
          const index = variables.findIndex(
            variable => variable.id === '05e6e4df2287b000'
          )
          variables[index].selected[0] = 'usage_user'
          getCachedResultsOrRunQuery(orgID, queryText, variables)
          expect(runQuery).toHaveBeenCalledTimes(1)
          done()
        } catch (error) {
          done(error)
        }
      })
    })
  })
})
