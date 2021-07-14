import {fetchAllBuckets, getBuckets} from './thunks'
import * as api from 'src/client'
import {fetchDemoDataBuckets} from 'src/cloud/apis/demodata'
import {getMockAppState} from 'src/mockAppState'
import {RemoteDataState} from '@influxdata/clockface'
import {PublishNotificationAction} from 'src/shared/actions/notifications'
import {mocked} from 'ts-jest/utils'

jest.mock('src/client', () => ({
  getBuckets: jest.fn(),
}))

jest.mock('src/cloud/apis/demodata', () => ({
  fetchDemoDataBuckets: jest.fn(() => {
    const res: ReturnType<typeof fetchDemoDataBuckets> = Promise.resolve([
      {
        id: 'demo-bucket',
        retentionRules: [],
        name: 'demo-buck',
        readableRetention: 'retee',
        type: 'demodata',
      },
    ])
    return res
  }),
}))

const mockGetBuckets = (shouldSucess: boolean) => {
  const headers = {}
  const mock = () =>
    Promise.resolve(
      shouldSucess
        ? {
            data: {
              buckets: [{name: 'buck1', retentionRules: [], id: 'custom-id'}],
            },
            headers,
            status: 200,
          }
        : {
            data: {message: 'simulated error', code: 'not found'},
            headers,
            status: 500,
          }
    ) as ReturnType<typeof api.getBuckets>
  mocked(api.getBuckets).mockImplementationOnce(mock)
}

describe('buckets thunks', () => {
  describe('fetchAllBuckets', () => {
    it('should return results upon success', async () => {
      mockGetBuckets(true)

      const bucks = await fetchAllBuckets('ord01')
      expect(bucks.result).toContain('custom-id')
      expect(bucks.result).toContain('demo-bucket')
    })

    it('should throw an error upon failure', async () => {
      mockGetBuckets(false)

      await expect(fetchAllBuckets('ord01')).rejects.toThrowError(
        'simulated error'
      )
    })
  })

  describe('getBuckets', () => {
    it('should load and dispatch successfully', async () => {
      mockGetBuckets(true)
      const dispatch = jest.fn()
      const getState = jest.fn(getMockAppState)

      await getBuckets()(dispatch, getState)

      const dispatched = dispatch.mock.calls.map(([x]) => x)

      expect(dispatched.length).toBe(2)
      expect(dispatched[0].status).toBe(RemoteDataState.Loading)
      expect(dispatched[1].status).toBe(RemoteDataState.Done)
      expect(dispatched[1].schema.result).toContain('custom-id')
      expect(dispatched[1].schema.result).toContain('demo-bucket')
    })

    it('should throw an error upon failure message received', async () => {
      mockGetBuckets(false)
      const dispatch = jest.fn()
      const getState = jest.fn(getMockAppState)

      await getBuckets()(dispatch, getState)

      const dispatched = dispatch.mock.calls.map(([x]) => x)

      expect(dispatched.length).toBe(3)
      expect(dispatched[0].status).toBe(RemoteDataState.Loading)
      expect(dispatched[1].status).toBe(RemoteDataState.Error)
      const publishNotificationAction: PublishNotificationAction['type'] =
        'PUBLISH_NOTIFICATION'
      expect(dispatched[2].type).toBe(publishNotificationAction)
    })
  })
})
