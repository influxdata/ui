/* eslint-disable @typescript-eslint/unbound-method */

import {mocked} from 'ts-jest/utils'
import {
  writeAnnotation,
  getAnnotation,
  deleteAnnotation,
  updateAnnotation,
} from 'src/annotations/api'
import axios from 'axios'

jest.mock('axios')

describe('annotations api calls', () => {
  describe('POST - write annotations api calls', () => {
    it('can write an annotation successfully and return the array of annotations', async () => {
      const annotationResponse = [
        {
          summary: 'GO PACK GO',
          start: Date.now().toString(),
          end: Date.now().toString(),
          stream: 'Lambeau Field',
        },
      ]

      mocked(axios.post).mockImplementationOnce(() =>
        Promise.resolve({status: 200, data: annotationResponse})
      )

      const response = await writeAnnotation(annotationResponse)

      expect(axios.post).toHaveBeenCalledTimes(1)

      expect(response).toEqual(annotationResponse)
    })

    it('handles an error and returns the error message', async () => {
      const annotationResponse = [
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

      await expect(writeAnnotation(annotationResponse)).rejects.toThrow(message)
    })
  })

  describe('GET - retrieve annotations api calls', () => {
    const annotationResponse = [
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
      const [lambeau] = annotationResponse
      mocked(axios.get).mockImplementationOnce(() =>
        Promise.resolve({data: [lambeau]})
      )
      const response = await getAnnotation({
        start: Date.now().toString(),
        end: Date.now().toString(),
        stream: 'Lambeau Field',
      })

      expect(response).toEqual([lambeau])
    })

    it('handles an error and returns the error message', async () => {
      const annotation = {
        start: Date.now().toString(),
        end: Date.now().toString(),
        stream: 'Lambeau Field',
      }
      const message = 'OOPS YOU DONE MESSED UP SON'

      mocked(axios.get).mockImplementationOnce(() =>
        Promise.reject(new Error(message))
      )

      await expect(getAnnotation(annotation)).rejects.toThrow(message)
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

    it('returns an updated annotation if correct parameters are passed', async () => {
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
