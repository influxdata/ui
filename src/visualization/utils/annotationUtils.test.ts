import {sortAnnotations} from './annotationUtils'

describe('annotation utils testing', () => {
  const range1 = {
    id: 'range1',
    summary: 'range (4-5)',
    endTime: '2021-06-15T15:05:30Z',
    startTime: '2021-06-15T15:04:50Z',
  }
  const range2 = {
    id: 'range2',
    summary: '67676',
    endTime: '2021-06-15T19:13:10Z',
    startTime: '2021-06-15T19:12:20Z',
  }
  const point1 = {
    id: 'point1',
    summary: 'hi there',
    endTime: '2021-06-15T15:05:10Z',
    startTime: '2021-06-15T15:05:10Z',
  }
  const point2 = {
    id: 'point2',
    summary: '77',
    endTime: '2021-06-15T19:12:50Z',
    startTime: '2021-06-15T19:12:50Z',
  }

  const range3 = {
    id: 'range3',
    summary: 'range (4-5a)',
    endTime: '2021-06-15T15:08:30Z',
    startTime: '2021-06-15T15:04:50Z',
  }
  const range4 = {
    id: 'range4',
    summary: '67676',
    endTime: '2021-06-15T21:13:10Z',
    startTime: '2021-06-15T19:12:20Z',
  }
  const point3 = {
    id: 'point3',
    summary: 'hi there',
    endTime: '2021-06-15T15:05:10Z',
    startTime: '2021-06-15T15:05:10Z',
  }
  const point4 = {
    id: 'point4',
    summary: '77',
    endTime: '2021-06-15T19:12:50Z',
    startTime: '2021-06-15T19:12:50Z',
  }

  describe('sorting annotations', () => {
    test('ranges are sorting before points', () => {
      const annos = [point1, range1, point2, range2, range3, range4]
      const expected = [range1, range2, range3, range4, point1, point2]

      // before sorting:
      expect(annos).not.toEqual(expected)

      const sorted = annos.sort(sortAnnotations)
      expect(sorted).toEqual(expected)
      expect(sorted[0].id).toEqual('range1')
    })
    test('if only points, no sorting is being done', () => {
      const annos = [point1, point2, point4, point3]
      expect(annos.sort(sortAnnotations)).toEqual(annos)
    })
    test('if only ranges, no sorting is being done', () => {
      const annos = [range1, range2, range3, range4]
      expect(annos.sort(sortAnnotations)).toEqual(annos)
    })
  })
})
