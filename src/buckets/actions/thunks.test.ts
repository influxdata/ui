import {fetchAllBuckets, getBuckets} from './thunks'
import * as api from 'src/client'
import {fetchDemoDataBuckets} from 'src/cloud/apis/demodata'
import {getMockAppState} from 'src/mockAppState'
import {RemoteDataState} from '@influxdata/clockface'

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
  const headers = {} as any

  let mock: typeof api.getBuckets = () => {
    const res: ReturnType<typeof api.getBuckets> = Promise.resolve(
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
    )
    return res
  }

  ;(api.getBuckets as any).mockImplementationOnce(mock)
}


describe('buckets thunks', () => {
  describe('fetchAllBuckets', () => {
    it('success', async () => {
      mockGetBuckets(true)

      const bucks = await fetchAllBuckets('ord01')
      expect(bucks.result).toContain('custom-id')
      expect(bucks.result).toContain('demo-bucket')
    })

    it('fails', async () => {
      mockGetBuckets(false)

      await expect(fetchAllBuckets('ord01')).rejects.toThrowError(
        'simulated error'
      )
    })
  })

  describe('getBuckets', () => {
    it('success', async () => {
      mockGetBuckets(true)
      const dispatch = jest.fn()
      const getState = jest.fn(getMockAppState) as any

      await getBuckets()(dispatch, getState)

      const dispatched = dispatch.mock.calls.map(([x]) => x)

      expect(dispatched.length).toBe(2)
      expect(dispatched[0].status).toBe(RemoteDataState.Loading)
      expect(dispatched[1].status).toBe(RemoteDataState.Done)
      expect(dispatched[1].schema.result).toContain('custom-id')
      expect(dispatched[1].schema.result).toContain('demo-bucket')
    })
  })
})
