/* eslint-disable @typescript-eslint/unbound-method */

import {mocked} from 'ts-jest/utils'
import axios from 'axios'

const fakeAxios = {
  get: jest.fn(),
  post: jest.fn(),
  put: jest.fn(),
  delete: jest.fn(),
}

jest.doMock('axios', () => {
  return {
    create: () => fakeAxios
  }
})

import {
  writeAnnotation,
  getAnnotation,
  deleteAnnotation,
  updateAnnotation,
} from 'src/annotations/api'

describe('annotations api calls', () => {
  describe('POST - write annotations api calls', () => {
    it('can write an annotation successfully and return the array of annotations', async () => {
      const annotationResponse = [
        {
          summary: 'GO PACK GO',
          startTime: Date.now(),
          endTime: Date.now(),
          stream: 'Lambeau Field',
        },
      ]

      mocked(fakeAxios.post).mockImplementationOnce(() =>
        Promise.resolve({status: 200, data: annotationResponse})
      )

      const response = await writeAnnotation(annotationResponse)

      expect(fakeAxios.post).toHaveBeenCalledTimes(1)

      expect(response).toEqual(annotationResponse)
    })

    it('handles an error and returns the error message', async () => {
      const annotationResponse = [
        {
          summary: 'GO PACK GO',
          startTime: Date.now(),
          endTime: Date.now(),
          stream: 'Lambeau Field',
        },
      ]
      const message = 'OOPS YOU DONE MESSED UP SON'

      mocked(fakeAxios.post).mockImplementationOnce(() =>
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
            startTime: Date.now().toString(),
            endTime: Date.now().toString(),
            summary: 'Go Pack Go',
          },
        ],
      },
      {
        stream: 'default',
        annotations: [
          {
            startTime: '2020-01-12T23:13:47Z',
            endTime: Date.now().toString(),
            summary: 'blah blah',
          },
        ],
      },
    ]

    it('retrieves annotations and returns them categorized by annotation stream', async () => {
      const [lambeau] = annotationResponse
      mocked(fakeAxios.get).mockImplementationOnce(() =>
        Promise.resolve({data: [lambeau]})
      )
      const response = await getAnnotation({
        startTime: Date.now().toString(),
        endTime: Date.now().toString(),
        stream: 'Lambeau Field',
      })

      expect(response).toEqual([lambeau])
    })

    it('handles an error and returns the error message', async () => {
      const annotation = {
        startTime: Date.now().toString(),
        endTime: Date.now().toString(),
        stream: 'Lambeau Field',
      }
      const message = 'OOPS YOU DONE MESSED UP SON'

      mocked(fakeAxios.get).mockImplementationOnce(() =>
        Promise.reject(new Error(message))
      )

      await expect(getAnnotation(annotation)).rejects.toThrow(message)
    })
  })

  describe('PUT - annotation update api calls', () => {
    const newAnnotation = {
      startTime: Date.now(),
      endTime: Date.now(),
      message: 'This is a message',
      summary: 'Palpatine did nothing wrong',
      id: '123123123',
    }

    it('returns an updated annotation if correct parameters are passed', async () => {
      mocked(fakeAxios.put).mockImplementationOnce(() =>
        Promise.resolve({data: newAnnotation})
      )

      const res = await updateAnnotation(newAnnotation)
      expect(res).toEqual(newAnnotation)
    })
  })

  describe('DELETE = annotation delete api calls', () => {
    const toDelete = {
      stream: 'default',
      startTime: Date.now().toString(),
      endTime: Date.now().toString(),
      id: '00013123123',
    }

    it('returns a 204 upon successful deletion of annotation', async () => {
      mocked(fakeAxios.delete).mockImplementationOnce(() =>
        Promise.resolve({status: 204})
      )

      const res = await deleteAnnotation(toDelete)

      expect(res).toEqual(204)
    })

    it('handles an error and returns the error message', async () => {
      const message = 'OOPS YOU DONE MESSED UP SON'

      mocked(fakeAxios.delete).mockImplementationOnce(() =>
        Promise.reject(new Error(message))
      )

      await expect(deleteAnnotation(toDelete)).rejects.toThrow(message)
    })
  })
})
