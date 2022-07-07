import {
  getWindowPeriodVariableAssignment,
  getWindowPeriodFromAST,
} from './fromAST'
import {getRangeVariable} from 'src/variables/utils/getTimeRangeVars'
import {Package} from 'src/types/ast'
import {TimeRange} from 'src/types'
import {asAssignment} from 'src/variables/selectors'
import {buildVarsOption} from 'src/variables/utils/buildVarsOption'
import {TIME_RANGE_START, TIME_RANGE_STOP} from 'src/variables/constants'
import {FALLBACK_WINDOW_PERIOD} from 'src/shared/constants/timeRanges'

import textFixtures from './ast_fixtures.json'

describe('Getting a windowPeriod from a flux query AST', () => {
  beforeEach(() => {
    jest.spyOn(console, 'warn').mockImplementation(() => {})
  })

  const outerWindowPeriod = 60000
  const range: TimeRange = {
    seconds: 10800,
    lower: 'now() - 3h',
    upper: null,
    label: 'Past 3h',
    duration: '3h',
    type: 'selectable-duration',
    windowPeriod: 60000,
  }
  const outerVariablesFromUI = [
    getRangeVariable(TIME_RANGE_START, range),
    getRangeVariable(TIME_RANGE_STOP, range),
  ]

  const runTest = (ast, shouldInject, expected) => {
    const varAssignmentNodes = outerVariablesFromUI.map(v => asAssignment(v))
    const outerScopeAst: Package = {
      package: '',
      type: 'Package',
      files: [buildVarsOption(varAssignmentNodes)],
    }
    it('correctly determines if should inject in extern', () => {
      const {toInject} = getWindowPeriodVariableAssignment(ast, outerScopeAst)
      expect(toInject).toEqual(shouldInject)
    })
    it('finds the correct value', () => {
      const windowPeriodMillisec = getWindowPeriodFromAST(ast, outerScopeAst)
      expect(windowPeriodMillisec).toEqual(expected)
    })
  }

  describe('Basic reading of inputs:', () => {
    describe('empty query', () => {
      const ast = textFixtures['empty_query']
      runTest(ast, false, outerWindowPeriod)
    })

    describe('query with timeRange, and no windowPeriod', () => {
      /*
          import "influxdata/influxdb/sample"
          sample.data(set: "airSensor")
              |> range(start: v.timeRangeStart, stop: v.timeRangeStop)
              |> yield(name: "${v.windowPeriod}")
          */
      const ast = textFixtures['time_range']
      runTest(ast, true, outerWindowPeriod)
    })

    describe('user declared v.windowPeriod', () => {
      /*
          import "array"
          v = {windowPeriod: 2444}
          array.from(rows: [{x: v.windowPeriod}])
          */
      const ast = textFixtures['user_declared']
      runTest(ast, false, 2444)
    })

    describe('user declared option v.windowPeriod', () => {
      /*
          import "array"
          option v = {windowPeriod: 2444}
          array.from(rows: [{x: v.windowPeriod}])
          */
      const ast = textFixtures['user_declared_option']
      runTest(ast, false, 2444)
    })

    describe('returns fallback windowPeriod, when cannot understand the result', () => {
      /*
          import "array"
          v = {windowPeriod: 'gerbils'}
          array.from(rows: [{x: v.windowPeriod}])
          */
      const ast = textFixtures['fallback']
      runTest(ast, false, FALLBACK_WINDOW_PERIOD)
    })
  })

  describe('Can handle scoping:', () => {
    describe('use outerScope windowPeriod, without a range in the query', () => {
      /*
          import "array"
          array.from(rows: [{x: v.windowPeriod}])
          */
      const ast = textFixtures['UI_scope']
      runTest(ast, true, outerWindowPeriod)
    })

    describe('use v.windowPeriod from outer UI scope range', () => {
      /*
          import "influxdata/influxdb/sample"
          sample.data(set: "airSensor")
              |> range(start: v.timeRangeStart, stop: v.timeRangeStop)
              |> yield(name: "${v.windowPeriod}")
          */
      const ast = textFixtures['UI_scope_range']
      runTest(ast, true, outerWindowPeriod)
    })

    describe('use v.windowPeriod extracted from range transformation', () => {
      /*
          import "influxdata/influxdb/sample"
          sample.data(set: "airSensor")
              |> range(start: -12h, stop: now())
              |> yield(name: "${v.windowPeriod}")
          */

      const ast = textFixtures['query_scope_range']
      runTest(ast, true, 120000)
    })

    describe('use v.windowPeriod from inner scope', () => {
      /*
          import "influxdata/influxdb/sample"
          sample.data(set: "airSensor")
          |> range(start: -12h, stop: now())
          |> map(fn: (r) => {
              v = {windowPeriod: 2444}
              return ({ r with _value: v.windowPeriod })
          })
          */
      const ast = textFixtures['inner_query_scope']
      runTest(ast, false, 2444)
    })

    describe('v.windowPeriod from inner scope, does not overwrite outer scope', () => {
      /*
          import "influxdata/influxdb/sample"
          import "array"
          sample.data(set: "airSensor")
          |> range(start: -12h, stop: now())
          |> map(fn: (r) => {
              v = {windowPeriod: 2444}
              return ({ r with _value: "foo" })
          })
          array.from(rows: [{x: v.windowPeriod}])
          */
      const ast = textFixtures['inner_vs_outer_query']
      runTest(ast, true, outerWindowPeriod)
    })

    describe('detect use of v.windowPeriod in the inner lambda', () => {
      /*
          import "influxdata/influxdb/sample"
          sample.data(set: "airSensor")
              |> range(start: -12h, stop: now())
              |> map(fn: (r) => {
                  return ({ r with _value: "${v.windowPeriod}" })
              })
          */
      const ast = textFixtures['inner_lambda']
      runTest(ast, true, 120000)
    })

    describe('two timeRanges used. Should grab the proper one for windowPeriod.', () => {
      /*
          import "influxdata/influxdb/sample"
          sample.data(set: "airSensor")
              |> range(start: -12h, stop: now())
              |> yield(name: "${v.windowPeriod}")
          sample.data(set: "airSensor")
              |> range(start: -15m, stop: now())
          */
      const ast = textFixtures['multiple_ranges']
      runTest(ast, true, 120000)
    })

    describe("when encountering a range node, only add a v.windowPeriod to the global scope if it doesn't already exist", () => {
      /*
          import "influxdata/influxdb/sample"
          v = {windowPeriod: 2444}
          sample.data(set: "airSensor")
              |> range(start: -12h, stop: now())
              |> yield(name: "${v.windowPeriod}")
          */
      const ast = textFixtures['when_to_inject']
      runTest(ast, false, 2444)
    })
  })

  describe('Can handle aliasing:', () => {
    describe('of the timeRange property', () => {
      /*
          import "influxdata/influxdb/sample"
          splitPoint = -1m
          sample.data(set: "airSensor")
              |> range(start: -12h, stop: splitPoint)
              |> yield(name: "${v.windowPeriod}")
          */
      const ast = textFixtures['alias_range']
      runTest(ast, true, 119833)
    })
    describe('of the timeRange variable', () => {
      /*
          import "influxdata/influxdb/sample"
          splitPoint = -1m
          v = {timeRangeStop: splitPoint}
          sample.data(set: "airSensor")
              |> range(start: -12h, stop: v.timeRangeStop)
              |> yield(name: "${v.windowPeriod}")
          */
      const ast = textFixtures['alias_range_variable']
      runTest(ast, true, 119833)
    })
    describe('of the windowPeriod variable', () => {
      /*
          import "array"
          import "influxdata/influxdb/sample"
          split = 2444
          chunk = split
          v = {windowPeriod: chunk}
          array.from(rows: [{x: v.windowPeriod}])
          */
      const ast = textFixtures['alias_window_variable']
      runTest(ast, false, 2444)
    })
  })

  describe('can handle inner scope of functions bound to variables', () => {
    /*
        RAW = () => {
          from(bucket: "sample_data")
            |> range(start: -12h, stop: now())
            |> filter(fn: (r) => r["_measurement"] == "airSensors")
            |> filter(fn: (r) => r["_field"] == "co")
            |> group()
            |> sort(columns:["_time"])
            |> aggregateWindow(fn: mean, every:v.windowPeriod)
            |> drop(columns:["_measurement","_field","_start","_stop"])
            |> yield(name:"raw ${v.windowPeriod}")
          return true
        }
        RAW()
        */
    const ast = textFixtures['variable_bound_function']
    runTest(ast, true, 120000)
  })

  // TODO: https://github.com/influxdata/ui/issues/4695
  describe.skip('Can handle complex inner expressions:', () => {
    describe('for windowPeriod:', () => {
      describe('as an inline expression', () => {
        /*
            import "array"
            v = {windowPeriod: 2 * 3 * 4 * 5}
            array.from(rows: [{x: v.windowPeriod}])
            */
        const ast = {}
        runTest(ast, false, 2 * 3 * 4 * 5)
      })
    })

    describe('for timeRange:', () => {
      describe('as an inline expression', () => {
        /*
              import "influxdata/influxdb/sample"
              import "date"
              import "experimental"
              sample.data(set: "airSensor")
                  |> range(start: -12h, stop: "-${2 * 3 * 4 * 5}m")
                  |> yield(name: "${v.windowPeriod}")
              */
        const ast = {}

        runTest(ast, true, 7180)
      })
      describe('use v.timeRangeStart as pre-bound Identifier, to an innerExpr', () => {
        /*
              import "influxdata/influxdb/sample"
              import "date"
              import "experimental"
              truncated = date.truncate(t:v.timeRangeStop,unit:1m)
              splitPoint = experimental.subDuration(d: 10m, from: truncated)
              sample.data(set: "airSensor")
                  |> range(start: -12h, stop: splitPoint)
                  |> yield(name: "${v.windowPeriod}")
              */
        const ast = {}

        runTest(ast, true, 'TODO')
      })
    })
  })
})
