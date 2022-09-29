import {jest} from '@jest/globals'

import {getBuckets} from 'src/buckets/actions/thunks'
import {fetchAllBuckets} from 'src/buckets/api'
import * as api from 'src/client'
import {getMockAppState} from 'src/mockAppState'
import {RemoteDataState} from '@influxdata/clockface'
import {PublishNotificationAction} from 'src/shared/actions/notifications'

jest.mock('src/client', () => ({
  getBuckets: jest.fn(),
}))

jest.mock('src/shared/constants/index', () => ({
  CLOUD: true,
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
  jest.mocked(api.getBuckets).mockImplementationOnce(mock)
}

describe('buckets thunks', () => {
  describe('fetchAllBuckets', () => {
    it('should return results upon success', async () => {
      mockGetBuckets(true)

      const {normalizedBuckets: bucks} = await fetchAllBuckets('ord01')
      expect(bucks.result).toContain('custom-id')
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
      const getState: any = jest.fn(getMockAppState)

      await getBuckets()(dispatch, getState)

      const dispatched: any = dispatch.mock.calls.map(([x]) => x)

      expect(dispatched.length).toBe(2)
      expect(dispatched[0].status).toBe(RemoteDataState.Loading)
      expect(dispatched[1].status).toBe(RemoteDataState.Done)
      expect(dispatched[1].schema.result).toContain('custom-id')
    })

    it('should throw an error upon failure message received', async () => {
      mockGetBuckets(false)
      const dispatch = jest.fn()
      const getState: any = jest.fn(getMockAppState)

      await getBuckets()(dispatch, getState)

      const dispatched: any = dispatch.mock.calls.map(([x]) => x)

      expect(dispatched.length).toBe(3)
      expect(dispatched[0].status).toBe(RemoteDataState.Loading)
      expect(dispatched[1].status).toBe(RemoteDataState.Error)
      const publishNotificationAction: PublishNotificationAction['type'] =
        'PUBLISH_NOTIFICATION'
      expect(dispatched[2].type).toBe(publishNotificationAction)
    })
  })
})
