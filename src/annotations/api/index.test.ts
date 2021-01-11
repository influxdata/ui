/* eslint-disable @typescript-eslint/unbound-method */

import {mocked} from 'ts-jest/utils'
import {writeAnnotation} from 'src/annotations/api'
import {API_BASE_PATH} from 'src/shared/constants'
import axios from 'axios'

jest.mock('axios')

describe('annotations api calls', () => {
  describe('POST - write annotations api calls', () => {
    it('can write an annotation successfully and return the array of annotations', async () => {
      const data = [
        {
          summary: 'GO PACK GO',
          'start-time': 'beginning of time',
          'end-time': Date.now(),
          stream: 'Lambeau Field',
        },
      ]
      mocked(axios.post).mockImplementationOnce(() =>
        Promise.resolve({status: 200, data})
      )

      const response = await writeAnnotation([{summary: 'Hey there'}])

      expect(axios.post).toHaveBeenCalledTimes(1)

      expect(response).toEqual(data)
    })
    it('makes a post request with annotations in the body of the request', async () => {
      const data = [{summary: 'Hey there'}]
      mocked(axios.post).mockImplementationOnce(() =>
        Promise.resolve({status: 200, data})
      )
      await writeAnnotation(data)
      expect(axios.post).toHaveBeenCalledWith(
        `${API_BASE_PATH}api/v2private/annotations`,
        data
      )
    })

    it('handles an error and returns the error message', async () => {
      const message = 'OOPS YOU DONE MESSED UP SON'

      mocked(axios.post).mockImplementationOnce(() =>
        Promise.reject(new Error(message))
      )

      await expect(writeAnnotation([{summary: 'Hey there'}])).rejects.toThrow(
        message
      )
    })

    it('responds with an error if the status of the response is not 200', async () => {
      const data = {
        status: 400,
        message: 'OOPS YOU DONE MESSED UP SON',
      }

      mocked(axios.post).mockImplementationOnce(() => Promise.resolve({data}))

      await expect(writeAnnotation([{summary: 'Hey there'}])).rejects.toThrow(
        data.message
      )
    })
  })
})
