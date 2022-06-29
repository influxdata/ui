import {mocked} from 'ts-jest/utils'

import {isFlagEnabled} from 'src/shared/utils/featureFlag'

import {
  getIdentity,
  Error as UnityError,
  GetIdentityParams,
  Identity,
} from 'src/client/unityRoutes'

import {
  retryFetchIdentity,
  UnauthorizedError,
  ServerError,
} from 'src/identity/apis/auth'

jest.mock('src/shared/constants', () => ({CLOUD: true}))

jest.mock('src/shared/utils/featureFlag.ts', () => ({
  isFlagEnabled: jest.fn(),
}))

jest.mock(
  'src/client/unityRoutes',
  () => ({
    ...jest.requireActual('src/client/unityRoutes'),
    getIdentity: jest.fn(),
  }),
  {virtual: true}
)

const mockIdentity: Identity = {
  user: {
    id: '1234asdf',
    email: 'test@example.com',
    accountCount: 1,
    orgCount: 1,
  },
  account: {
    id: 12344,
    name: 'John Doe',
    type: 'free',
    accountCreatedAt: 'anytime',
  },
  org: {
    id: '7890uiop',
    name: 'John Doe org',
    clusterHost: 'aws-east-0-1',
  },
}

const mockGoodResponse = () => {
  return Promise.resolve({
    status: 200,
    headers: {},
    data: mockIdentity,
  } as any)
}

const mockError401: UnityError = {
  code: 'unauthorized',
  message: "You ain't allowed to see that, jack",
}

const mockUnauthorizedError = () => {
  return Promise.resolve({
    status: 401,
    headers: {},
    data: mockError401,
  } as any)
}

const mockUnityServerError: UnityError = {
  code: 'internal error',
  message: 'There was an error',
}

const mockServerError = () => {
  return Promise.resolve({
    status: 500,
    headers: {},
    data: mockUnityServerError,
  } as any)
}

const flushPromises = () => {
  return new Promise(jest.requireActual('timers').setImmediate)
}

describe('retrying failed authentication attempts', () => {
  beforeEach(() => {
    // return true so that `uiUnificationFlag` and `quartzIdentity` both return true
    mocked(isFlagEnabled).mockImplementation(() => true)
  })

  afterEach(() => {
    mocked(getIdentity).mockReset()
  })

  it("doesn't retry when the first call is successful", async () => {
    mocked(getIdentity).mockImplementation(mockGoodResponse)

    expect(await retryFetchIdentity()).toEqual(mockIdentity)
  })

  it('throws the error in the event of a 401', async () => {
    mocked(getIdentity).mockImplementation(mockUnauthorizedError)

    try {
      await retryFetchIdentity()
    } catch (error) {
      expect(error).toStrictEqual(new UnauthorizedError(mockError401.message))
    }
  })

  it('retries once', async () => {
    mocked(getIdentity).mockImplementationOnce(mockServerError)

    mocked(getIdentity).mockImplementationOnce(mockGoodResponse)

    expect(await retryFetchIdentity(1, 1)).toEqual(mockIdentity)

    const [firstCall, secondCall] = mocked(getIdentity).mock.results

    expect(await (await firstCall.value).status).toBe(500)
    expect(await (await secondCall.value).status).toBe(200)
  })

  it('retries multiple times', async () => {
    mocked(getIdentity).mockImplementationOnce(mockServerError)
    mocked(getIdentity).mockImplementationOnce(mockServerError)
    mocked(getIdentity).mockImplementationOnce(mockServerError)

    mocked(getIdentity).mockImplementationOnce(mockGoodResponse)

    expect(await retryFetchIdentity(1, 1)).toEqual(mockIdentity)

    const [firstCall, secondCall, thirdCall, fourthCall] = mocked(
      getIdentity
    ).mock.results

    expect(await (await firstCall.value).status).toBe(500)
    expect(await (await secondCall.value).status).toBe(500)
    expect(await (await thirdCall.value).status).toBe(500)
    expect(await (await fourthCall.value).status).toBe(200)
  })

  it('retries up to the retry limit', async () => {
    mocked(getIdentity).mockImplementationOnce(mockServerError)
    mocked(getIdentity).mockImplementationOnce(mockServerError)
    mocked(getIdentity).mockImplementationOnce(mockServerError)
    mocked(getIdentity).mockImplementationOnce(mockServerError)
    mocked(getIdentity).mockImplementationOnce(mockServerError)

    // this call will never happen since the retry logic only allows five retries
    mocked(getIdentity).mockImplementationOnce(mockServerError)

    try {
      await retryFetchIdentity(1, 1)
    } catch (error) {
      expect(error).toStrictEqual(new ServerError(mockUnityServerError.message))
    } finally {
      const [firstCall, secondCall, thirdCall, fourthCall, fifthCall] = mocked(
        getIdentity
      ).mock.results

      // only 5 getIdentity calls happened, even though the implementation was mocked 6 times
      expect(mocked(getIdentity).mock.calls.length).toBe(5)
      expect(await (await firstCall.value).status).toBe(500)
      expect(await (await secondCall.value).status).toBe(500)
      expect(await (await thirdCall.value).status).toBe(500)
      expect(await (await fourthCall.value).status).toBe(500)
      expect(await (await fifthCall.value).status).toBe(500)
    }
  })

  it('retries until a non 500 error is encountered', async () => {
    mocked(getIdentity).mockImplementationOnce(mockServerError)
    mocked(getIdentity).mockImplementationOnce(mockServerError)
    mocked(getIdentity).mockImplementationOnce(mockUnauthorizedError)

    try {
      await retryFetchIdentity(1, 1)
    } catch (error) {
      expect(error).toStrictEqual(new UnauthorizedError(mockError401.message))
    } finally {
      const [firstCall, secondCall, thirdCall] = mocked(
        getIdentity
      ).mock.results

      expect(await (await firstCall.value).status).toBe(500)
      expect(await (await secondCall.value).status).toBe(500)
      expect(await (await thirdCall.value).status).toBe(401)
    }
  })

  describe('the timing of auth retrying', () => {
    beforeEach(() => {
      jest.useFakeTimers()
      jest.spyOn(global, 'setTimeout')
    })

    afterEach(() => {
      jest.useRealTimers()
    })

    it('retries once after the default of 30000 milliseconds', async () => {
      mocked(getIdentity).mockImplementationOnce(mockServerError)

      mocked(getIdentity).mockImplementationOnce(mockGoodResponse)

      const retryResponse = retryFetchIdentity()

      await flushPromises()
      jest.runAllTimers()

      expect(await retryResponse).toEqual(mockIdentity)

      expect(setTimeout).toHaveBeenCalledTimes(1)
      expect(setTimeout).toHaveBeenLastCalledWith(expect.any(Function), 30000)
    })

    it('retries multiple times, waiting longer each time', async () => {
      mocked(getIdentity).mockImplementationOnce(mockServerError)
      mocked(getIdentity).mockImplementationOnce(mockServerError)
      mocked(getIdentity).mockImplementationOnce(mockServerError)

      mocked(getIdentity).mockImplementationOnce(mockGoodResponse)

      const retryResponse = retryFetchIdentity()

      await flushPromises()
      jest.runAllTimers()
      await flushPromises()
      jest.runAllTimers()
      await flushPromises()
      jest.runAllTimers()

      expect(await retryResponse).toEqual(mockIdentity)

      expect(setTimeout).toHaveBeenNthCalledWith(1, expect.any(Function), 30000)
      expect(setTimeout).toHaveBeenNthCalledWith(2, expect.any(Function), 60000)
      expect(setTimeout).toHaveBeenNthCalledWith(3, expect.any(Function), 90000)
    })

    it('retries multiple times, waiting longer each time, until it fails', async () => {
      mocked(getIdentity).mockImplementationOnce(mockServerError)
      mocked(getIdentity).mockImplementationOnce(mockServerError)
      mocked(getIdentity).mockImplementationOnce(mockServerError)
      mocked(getIdentity).mockImplementationOnce(mockServerError)
      mocked(getIdentity).mockImplementationOnce(mockServerError)

      try {
        const retryResponse = retryFetchIdentity()

        await flushPromises()
        jest.runAllTimers()
        await flushPromises()
        jest.runAllTimers()
        await flushPromises()
        jest.runAllTimers()
        await flushPromises()
        jest.runAllTimers()

        await retryResponse
      } catch (error) {
        expect(error).toStrictEqual(
          new ServerError(mockUnityServerError.message)
        )
      }
      expect(setTimeout).toHaveBeenNthCalledWith(1, expect.any(Function), 30000)
      expect(setTimeout).toHaveBeenNthCalledWith(2, expect.any(Function), 60000)
      expect(setTimeout).toHaveBeenNthCalledWith(3, expect.any(Function), 90000)
      expect(setTimeout).toHaveBeenNthCalledWith(
        4,
        expect.any(Function),
        120000
      )
    })
  })
})
