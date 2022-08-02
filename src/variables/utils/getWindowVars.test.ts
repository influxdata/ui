import {
  FALLBACK_WINDOW_PERIOD,
  getWindowPeriodVariable,
  normalizeWindowPeriodForZoomRequery,
} from 'src/variables/utils/getWindowVars'
import {defaultVariableAssignments} from 'src/variables/mocks'
import {TimeRange} from 'src/types'

describe('utils/getWindowVars', () => {
  describe('getWindowPeriodVariable', () => {
    beforeEach(() => {
      // NOTE: as long as you mock children like below, before importing your
      // component by using a require().default pattern, this will reset your
      // mocks between tests (alex)
      jest.resetModules()
    })
    test('should return null when passed an empty query string', () => {
      const actual = getWindowPeriodVariable('', [])
      expect(actual).toEqual(null)
    })

    test('should return null when no timeRange is input', () => {
      const query = `from(bucket: "Cool Story")
      |> filter(fn: (r) => r._measurement == "cpu")
      |> filter(fn: (r) => r._field == "usage_user")`
      const actual = getWindowPeriodVariable(query, defaultVariableAssignments)
      expect(actual).toEqual(null)
    })

    /* The following two tests are checking that this issue: https://github.com/influxdata/ui/issues/422 is resolved.
      (Summary: The windowPeriod calculation was returning infinity for identical or negative ranges)
    */
    test('should return null when timeRange is identical', () => {
      const query = `from(bucket: "Go Pack Go")
      |> range(start: 2020-12-10T17:00:00Z, stop: 2020-12-10T17:00:00Z)
      |> filter(fn: (r) => r["_measurement"] == "query_request_duration")
      |> filter(fn: (r) => r["_field"] == "success_rate")`

      const actual = getWindowPeriodVariable(query, defaultVariableAssignments)
      expect(actual).toEqual(null)
    })

    test('should return null when timeRange is negative', () => {
      const query = `from(bucket: "Go Pack Go")
      |> range(start: 2020-12-10T17:00:00Z, stop: 2020-12-09T17:00:00Z)
      |> filter(fn: (r) => r["_measurement"] == "query_request_duration")
      |> filter(fn: (r) => r["_field"] == "success_rate")`

      const actual = getWindowPeriodVariable(query, defaultVariableAssignments)
      expect(actual).toEqual(null)
    })

    test('should return a dynamic windowPeriod depending on the timeRange that is input', () => {
      jest.mock('src/shared/utils/getMinDurationFromAST', () => {
        return {
          getMinDurationFromAST: jest.fn(() => 86400000),
        }
      })
      const getWindowVars = require('src/variables/utils/getWindowVars')
      const query = `from(bucket: "Phil Collins")
      |> range(start: time(v: "2020-03-03T12:00:00Z"), stop: time(v: "2020-03-04T12:00:00Z"))
      |> filter(fn: (r) => r._measurement == "cpu")
      |> filter(fn: (r) => r._field == "usage_user")`

      const actual = getWindowVars.getWindowPeriodVariable(
        query,
        defaultVariableAssignments
      )
      const expected = [
        {
          orgID: '',
          id: 'windowPeriod',
          name: 'windowPeriod',
          arguments: {
            type: 'system',
            values: [240000],
          },
          status: 'Done',
          labels: [],
        },
      ]
      expect(actual).toEqual(expected)
    })
  })

  describe('normalizeWindowPeriodForZoomRequery', () => {
    test('should ignore columns that are not time ranges', () => {
      const windowPeriod = null
      const timeRange = null
      const domain = [1, 10]
      const column = [0, 2, 4, 6, 8, 10, 12, 14, 16, 18, 20]

      expect(
        normalizeWindowPeriodForZoomRequery(
          windowPeriod,
          timeRange,
          domain,
          column
        )
      ).toEqual(windowPeriod)
    })

    test('should return the default windowPeriod when negative', () => {
      const windowPeriod = -10000
      const timeRange: TimeRange = null
      const domain = [3, 9]
      const column = [0, 2, 4, 6, 8, 10, 12, 14, 16, 18, 20]

      expect(
        normalizeWindowPeriodForZoomRequery(
          windowPeriod,
          timeRange,
          domain,
          column
        )
      ).toEqual(FALLBACK_WINDOW_PERIOD)
    })

    test('should return the windowPeriod when not falsy', () => {
      let windowPeriod = 1
      let timeRange: TimeRange = null
      const domain = [3, 9]
      const column = [0, 2, 4, 6, 8, 10, 12, 14, 16, 18, 20]

      expect(
        normalizeWindowPeriodForZoomRequery(
          windowPeriod,
          timeRange,
          domain,
          column
        )
      ).toEqual(windowPeriod)

      timeRange = {
        lower: 'now() - 1m',
        upper: 'now()',
        seconds: 10,
        label: 'Past 1m',
        duration: '1m',
        type: 'selectable-duration',
        windowPeriod: 10,
      }
      expect(
        normalizeWindowPeriodForZoomRequery(
          windowPeriod,
          timeRange,
          domain,
          column
        )
      ).toEqual(windowPeriod)

      windowPeriod = 5000000
      expect(
        normalizeWindowPeriodForZoomRequery(
          windowPeriod,
          timeRange,
          domain,
          column
        )
      ).toEqual(windowPeriod)

      windowPeriod = 3.14
      expect(
        normalizeWindowPeriodForZoomRequery(
          windowPeriod,
          timeRange,
          domain,
          column
        )
      ).toEqual(windowPeriod)
    })

    test('should calculate the windowPeriod when falsy', () => {
      let windowPeriod: number | null = null
      const timeRange: TimeRange = {
        lower: 'now() - 1m',
        upper: 'now()',
        seconds: 10,
        label: 'Past 1m',
        duration: '1m',
        type: 'selectable-duration',
        windowPeriod: 10,
      }
      const domain = [3000, 9000]
      const column = [
        0,
        2000,
        4000,
        6000,
        8000,
        10000,
        12000,
        14000,
        16000,
        18000,
        20000,
      ]

      expect(
        normalizeWindowPeriodForZoomRequery(
          windowPeriod,
          timeRange,
          domain,
          column
        )
      ).toEqual(6000 / 360)

      windowPeriod = 0
      expect(
        normalizeWindowPeriodForZoomRequery(
          windowPeriod,
          timeRange,
          domain,
          column
        )
      ).toEqual(6000 / 360)
    })

    test('should give the fallback windowPeriod if column is not sorted', () => {
      const windowPeriod = null
      const timeRange: TimeRange = {
        lower: 'now() - 1m',
        upper: 'now()',
        seconds: 10,
        label: 'Past 1m',
        duration: '1m',
        type: 'selectable-duration',
        windowPeriod: 10,
      }
      const domain = [3000, 9000]
      let column = [
        2000,
        0,
        6000,
        4000,
        10000,
        8000,
        12000,
        16000,
        14000,
        20000,
        18000,
      ]

      expect(
        normalizeWindowPeriodForZoomRequery(
          windowPeriod,
          timeRange,
          domain,
          column
        )
      ).toEqual(FALLBACK_WINDOW_PERIOD)

      column = [
        0,
        2000,
        4000,
        6000,
        8000,
        10000,
        12000,
        14000,
        16000,
        18000,
        20000,
      ]
      expect(
        normalizeWindowPeriodForZoomRequery(
          windowPeriod,
          timeRange,
          domain,
          column
        )
      ).not.toEqual(FALLBACK_WINDOW_PERIOD)
    })

    test('should use the fallback windowPeriod when it encounters Infinity', () => {
      const windowPeriod = null
      const timeRange: TimeRange = {
        lower: 'now() - 1m',
        upper: 'now()',
        seconds: 10,
        label: 'Past 1m',
        duration: '1m',
        type: 'selectable-duration',
        windowPeriod: 10,
      }
      let domain = [0, Infinity]
      let column = [Infinity, Infinity]

      expect(
        normalizeWindowPeriodForZoomRequery(
          windowPeriod,
          timeRange,
          domain,
          column
        )
      ).toEqual(FALLBACK_WINDOW_PERIOD)

      domain = [3000, Infinity]
      expect(
        normalizeWindowPeriodForZoomRequery(
          windowPeriod,
          timeRange,
          domain,
          column
        )
      ).toEqual(FALLBACK_WINDOW_PERIOD)

      domain = [-Infinity, -Infinity]
      column = [-Infinity, Infinity]
      expect(
        normalizeWindowPeriodForZoomRequery(
          windowPeriod,
          timeRange,
          domain,
          column
        )
      ).toEqual(FALLBACK_WINDOW_PERIOD)

      domain = [-Infinity, Infinity]
      column = [-Infinity, Infinity]
      expect(
        normalizeWindowPeriodForZoomRequery(
          windowPeriod,
          timeRange,
          domain,
          column
        )
      ).toEqual(FALLBACK_WINDOW_PERIOD)
    })

    test('should use the fallback windowPeriod when it encounters NaN', () => {
      const windowPeriod = null
      const timeRange: TimeRange = {
        lower: 'now() - 1m',
        upper: 'now()',
        seconds: 10,
        label: 'Past 1m',
        duration: '1m',
        type: 'selectable-duration',
        windowPeriod: 10,
      }
      let domain = [0, NaN]
      let column = [-Infinity, Infinity]

      expect(
        normalizeWindowPeriodForZoomRequery(
          windowPeriod,
          timeRange,
          domain,
          column
        )
      ).toEqual(FALLBACK_WINDOW_PERIOD)

      column = [NaN, NaN]
      expect(
        normalizeWindowPeriodForZoomRequery(
          windowPeriod,
          timeRange,
          domain,
          column
        )
      ).toEqual(FALLBACK_WINDOW_PERIOD)

      domain = [NaN, NaN]
      expect(
        normalizeWindowPeriodForZoomRequery(
          windowPeriod,
          timeRange,
          domain,
          column
        )
      ).toEqual(FALLBACK_WINDOW_PERIOD)

      column = [0, 1000, 2000, 3000, 4000, 5000]
      expect(
        normalizeWindowPeriodForZoomRequery(
          windowPeriod,
          timeRange,
          domain,
          column
        )
      ).toEqual(FALLBACK_WINDOW_PERIOD)

      domain = [3000, 9000]
      column = [0, 1000, 2000, 4000, 6000, NaN, 8000, 10000]
      expect(
        normalizeWindowPeriodForZoomRequery(
          windowPeriod,
          timeRange,
          domain,
          column
        )
      ).toEqual(FALLBACK_WINDOW_PERIOD)
    })
  })
})
