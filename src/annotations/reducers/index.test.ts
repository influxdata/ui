import {annotationsReducer, initialState} from 'src/annotations/reducers'

const mockAnnotations = [
  {
    stream: 'default',
    annotations: [
      {
        summary: 'hi',
        stopValue: new Date('2021-01-21T00:05:51Z').getTime(),
        start: new Date('2021-01-21T00:05:51Z').getTime(),
      },
      {
        summary: 'yep',
        stopValue: new Date('2021-01-21T00:07:10Z').getTime(),
        start: new Date('2021-01-21T00:07:10Z').getTime(),
      },
      {
        summary: 'sure, why not',
        stopValue: new Date('2021-01-21T00:08:11Z').getTime(),
        start: new Date('2021-01-21T00:08:11Z').getTime(),
      },
    ],
  },
]

describe('the annotations reducer', () => {
  it('organizes annotations by stream name', () => {
    const state = annotationsReducer(initialState(), {
      type: 'SET_ANNOTATIONS',
      annotations: mockAnnotations,
    })

    expect(state).toEqual({
      annotations: {
        default: [
          {
            summary: 'hi',
            stopValue: new Date('2021-01-21T00:05:51Z').getTime(),
            start: new Date('2021-01-21T00:05:51Z').getTime(),
          },
          {
            summary: 'yep',
            stopValue: new Date('2021-01-21T00:07:10Z').getTime(),
            start: new Date('2021-01-21T00:07:10Z').getTime(),
          },
          {
            summary: 'sure, why not',
            stopValue: new Date('2021-01-21T00:08:11Z').getTime(),
            start: new Date('2021-01-21T00:08:11Z').getTime(),
          },
        ],
      },
      visibleStreamsByID: [],
    })
  })
})
