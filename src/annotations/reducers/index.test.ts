import {annotationsReducer, initialState} from 'src/annotations/reducers'

const mockAnnotations = [
  {
    stream: 'default',
    annotations: [
      {
        summary: 'hi',
        end: '2021-01-21T00:05:51Z',
        start: '2021-01-21T00:05:51Z',
      },
      {
        summary: 'yep',
        end: '2021-01-21T00:07:10Z',
        start: '2021-01-21T00:07:10Z',
      },
      {
        summary: 'sure, why not',
        end: '2021-01-21T00:08:11Z',
        start: '2021-01-21T00:08:11Z',
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
            end: '2021-01-21T00:05:51Z',
            start: '2021-01-21T00:05:51Z',
          },
          {
            summary: 'yep',
            end: '2021-01-21T00:07:10Z',
            start: '2021-01-21T00:07:10Z',
          },
          {
            summary: 'sure, why not',
            end: '2021-01-21T00:08:11Z',
            start: '2021-01-21T00:08:11Z',
          },
        ],
      },
      visibleStreamsByID: [],
    })
  })
})
