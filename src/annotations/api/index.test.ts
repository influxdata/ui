/* eslint-disable @typescript-eslint/unbound-method */

import {mocked} from 'ts-jest/utils'
import {writeAnnotation} from 'src/annotations/api'
import axios from 'axios'

jest.mock('axios')

describe('annotations api calls', () => {
  describe('POST - write annotations api calls', () => {
    it('can write an annotation successfully and return the array of annotations with camelcased response properties', async () => {
      const data = [
        {
          summary: 'GO PACK GO',
          'start-time': Date.now(),
          'end-time': Date.now(),
          stream: 'Lambeau Field',
        },
      ]

      const transformedData = [
        {
          summary: 'GO PACK GO',
          startTime: Date.now(),
          endTime: Date.now(),
          stream: 'Lambeau Field',
        },
      ]
      mocked(axios.post).mockImplementationOnce(() =>
        Promise.resolve({status: 200, data})
      )

      const response = await writeAnnotation([{summary: 'Hey there'}])

      expect(axios.post).toHaveBeenCalledTimes(1)

      expect(response).toEqual(transformedData)
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
  })
})
