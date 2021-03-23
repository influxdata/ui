/* eslint-disable @typescript-eslint/unbound-method */
import { mocked } from 'ts-jest/utils'
import axios from 'axios'
import { getMapToken } from './api'

jest.mock('axios')

describe('map api calls', () => {
  it('can get a map token', async () => {
    const mapTokenResponse = {
      token: "MapTempToken"
    }

    mocked(axios.get).mockImplementationOnce(() => 
      Promise.resolve({data: mapTokenResponse})
    )

    const response = await getMapToken()

    expect(axios.get).toHaveBeenCalledTimes(1)
    expect(response).toEqual(mapTokenResponse)
  })

  it('handles an error from the server', async () => {
    const message = '401 unauthorized'

    mocked(axios.get).mockImplementationOnce(() => 
      Promise.reject(new Error(message))
    )

    await expect(getMapToken()).rejects.toThrow(message)
  })
})