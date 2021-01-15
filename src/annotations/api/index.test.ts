/* eslint-disable @typescript-eslint/unbound-method */

import {mocked} from 'ts-jest/utils'
import {
  writeAnnotation,
  getAnnotation,
  formatAnnotationQueryString,
  deleteAnnotation,
  updateAnnotation,
} from 'src/annotations/api'
import axios from 'axios'

jest.mock('axios')

describe('query string formatting function', () => {
  it('properly handles all potential properties for get/delete requests for annotations', () => {
    const query = {
      stream: 'default stream',
      start: Date.now().toString(),
      end: Date.now().toString(),
      summary: 'look ma, no spaces!',
      stickers: {
        foo: 'bar',
      },
    }

    const qs = formatAnnotationQueryString(query)

    // Starts with question mark for query string
    expect(qs[0]).toEqual('?')

    // Handles spaces
    expect(qs.indexOf(' ')).toEqual(-1)
    expect(qs.includes('default%20stream')).toBeTruthy()

    // Only uses ? symbol in beginning, following qs params use &
    expect(qs.lastIndexOf('?')).toEqual(0)
    expect(qs.split('').filter(a => a === '&').length).toEqual(3)

    // Handles encoding of object params for stickers
    expect(qs.includes('&stickerIncludes[foo]=bar')).toBeTruthy()
  })
})
describe('annotations api calls', () => {
  describe('POST - write annotations api calls', () => {
    it('can write an annotation successfully and return the array of annotations with camelcased response properties', async () => {
      const data = [
        {
          summary: 'GO PACK GO',
          start: Date.now().toString(),
          end: Date.now().toString(),
          stream: 'Lambeau Field',
        },
      ]

      mocked(axios.post).mockImplementationOnce(() =>
        Promise.resolve({status: 200, data})
      )

      const response = await writeAnnotation(data)

      expect(axios.post).toHaveBeenCalledTimes(1)

      expect(response).toEqual(data)
    })

    it('handles an error and returns the error message', async () => {
      const data = [
        {
          summary: 'GO PACK GO',
          start: Date.now().toString(),
          end: Date.now().toString(),
          stream: 'Lambeau Field',
        },
      ]
      const message = 'OOPS YOU DONE MESSED UP SON'

      mocked(axios.post).mockImplementationOnce(() =>
        Promise.reject(new Error(message))
      )

      await expect(writeAnnotation(data)).rejects.toThrow(message)
    })
  })

  describe('GET - retrieve annotations api calls', () => {
    const data = [
      {
        stream: 'Lambeau Field',
        annotations: [
          {
            start: Date.now().toString(),
            end: Date.now().toString(),
            summary: 'Go Pack Go',
          },
        ],
      },
      {
        stream: 'default',
        annotations: [
          {
            start: '2020-01-12T23:13:47Z',
            end: Date.now().toString(),
            summary: 'blah blah',
          },
        ],
      },
    ]

    it('retrieves annotations and returns them categorized by annotation stream', async () => {
      mocked(axios.get).mockImplementationOnce(() => Promise.resolve({data}))
      const response = await getAnnotation({
        start: Date.now().toString(),
        end: Date.now().toString(),
        stream: 'Lambeau Field',
      })

      expect(response).toEqual(data)
    })

    it('handles an error and returns the error message', async () => {
      const data = {
        start: Date.now().toString(),
        end: Date.now().toString(),
        stream: 'Lambeau Field',
      }
      const message = 'OOPS YOU DONE MESSED UP SON'

      mocked(axios.get).mockImplementationOnce(() =>
        Promise.reject(new Error(message))
      )

      await expect(getAnnotation(data)).rejects.toThrow(message)
    })
  })

  describe('PUT - annotation update api calls', () => {
    const oldAnnotation = {
      stream: 'default',
      start: Date.now().toString(),
      end: Date.now().toString(),
    }

    const newAnnotation = {
      stream: 'boogey',
      start: Date.now().toString(),
      end: Date.now().toString(),
      message: 'This is a message',
      summary: 'Palpatine did nothing wrong',
    }

    it('return an updated annotation if correct parameters (old annotation to update and new annotation structure) are passed', async () => {
      mocked(axios.put).mockImplementationOnce(() =>
        Promise.resolve({data: newAnnotation})
      )

      const res = await updateAnnotation(oldAnnotation, newAnnotation)
      expect(res).toEqual(newAnnotation)
    })
  })

  describe('DELETE = annotation delete api calls', () => {
    const toDelete = {
      stream: 'default',
      start: Date.now().toString(),
      end: Date.now().toString(),
    }

    it('returns a 204 upon successful deletion of annotation', async () => {
      mocked(axios.delete).mockImplementationOnce(() =>
        Promise.resolve({status: 204})
      )

      const res = await deleteAnnotation(toDelete)

      expect(res).toEqual(204)
    })

    it('handles an error and returns the error message', async () => {
      const message = 'OOPS YOU DONE MESSED UP SON'

      mocked(axios.delete).mockImplementationOnce(() =>
        Promise.reject(new Error(message))
      )

      await expect(deleteAnnotation(toDelete)).rejects.toThrow(message)
    })
  })
})
