// Libraries
import memoizeOne from 'memoize-one'
import {get} from 'lodash'
import {fromFlux, Table} from '@influxdata/giraffe'

// Utils
import {
  defaultXColumn,
  defaultYColumn,
  defaultYSeriesColumns,
  getNumericColumns as getNumericColumnsUtil,
  getGroupableColumns as getGroupableColumnsUtil,
  getStringColumns as getStringColumnsUtil,
  getMainColumnName,
} from 'src/shared/utils/vis'

import {
  calcWindowPeriodForDuration,
  getWindowPeriodFromVariables,
} from 'src/variables/utils/getWindowVars'
import {
  durationToMilliseconds,
  isDurationParseable,
  isDurationWithNowParseable,
  millisecondsToDuration,
  parseDuration,
  removeSpacesAndNow,
  timeRangeToDuration,
} from 'src/shared/utils/duration'

// Selectors
import {getAllVariables} from 'src/variables/selectors'
import {getTimeRange} from 'src/dashboards/selectors'

// Types
import {
  AppState,
  BandViewProperties,
  DashboardDraftQuery,
  DashboardQuery,
  NewView,
  QueryView,
  TimeRange,
} from 'src/types'

// Constants
import {AGG_WINDOW_AUTO} from 'src/timeMachine/constants/queryBuilder'

export const getActiveTimeMachine = (state: AppState) => {
  if (!state.timeMachines) {
    return null
  }

  const {activeTimeMachineID, timeMachines} = state.timeMachines
  const timeMachine = timeMachines[activeTimeMachineID]

  return timeMachine
}

export const getActiveCellID = (state: AppState) => {
  return getActiveTimeMachine(state)?.view.cellID
}

export const getActiveGraphType = (state: AppState): string => {
  return get(getActiveTimeMachine(state), 'view.properties.type', 'xy')
}

export const getIsInCheckOverlay = (state: AppState): boolean => {
  return state.timeMachines.activeTimeMachineID === 'alerting'
}

export const getActiveQuery = (state: AppState): DashboardDraftQuery => {
  const tm = getActiveTimeMachine(state)
  if (!tm) {
    return {
      text: '',
      hidden: true,
    }
  }

  const {draftQueries, activeQueryIndex} = tm
  return draftQueries[activeQueryIndex]
}

export const getActiveQueryIndex = (state: AppState): number => {
  const activeTimeMachine = getActiveTimeMachine(state)
  if (activeTimeMachine) {
    return activeTimeMachine.activeQueryIndex
  }
  return 0
}

/*
  Get the value of the `v.windowPeriod` variable for the currently active query, in milliseconds.
*/
// TODO kill this function
export const getActiveWindowPeriod = (state: AppState) => {
  const {text} = getActiveQuery(state)
  const variables = getAllVariables(state)
  return getWindowPeriodFromVariables(text, variables)
}

export const getWindowPeriodFromTimeRange = (state: AppState): string => {
  const timeRange = getTimeRange(state)
  if (timeRange.type === 'selectable-duration') {
    return millisecondsToDuration(timeRange.windowPeriod)
  }

  if (timeRange.type === 'custom') {
    const upper = Date.parse(timeRange.upper)
    const lower = Date.parse(timeRange.lower)
    return millisecondsToDuration(calcWindowPeriodForDuration(upper - lower))
  }

  throw new Error(
    'Unknown timeRange type provided to getWindowPeriodFromTimeRange'
  )
}

const getVisTableMemoized = memoizeOne(fromFlux)

export const getVisTable = (
  state: AppState
): {table: Table; fluxGroupKeyUnion: string[]; resultColumnNames: string[]} => {
  const files = getActiveTimeMachine(state).queryResults.files || []
  const {table, fluxGroupKeyUnion, resultColumnNames} = getVisTableMemoized(
    files.join('\n\n')
  )

  return {table, fluxGroupKeyUnion, resultColumnNames}
}

const getNumericColumnsMemoized = memoizeOne(getNumericColumnsUtil)
const getStringColumnsMemoized = memoizeOne(getStringColumnsUtil)

export const getNumericColumns = (state: AppState): string[] => {
  const {table} = getVisTable(state)

  return getNumericColumnsMemoized(table)
}

export const getStringColumns = (state: AppState): string[] => {
  const {table} = getVisTable(state)

  return getStringColumnsMemoized(table)
}

const getGroupableColumnsMemoized = memoizeOne(getGroupableColumnsUtil)

export const getGroupableColumns = (state: AppState): string[] => {
  const {table} = getVisTable(state)

  return getGroupableColumnsMemoized(table)
}

export const getXColumnSelection = (state: AppState): string => {
  const {table} = getVisTable(state)
  const preferredXColumnKey = get(
    getActiveTimeMachine(state),
    'view.properties.xColumn'
  )

  return defaultXColumn(table, preferredXColumnKey)
}

export const getYColumnSelection = (state: AppState): string => {
  const {table} = getVisTable(state)
  const tm = getActiveTimeMachine(state)
  const preferredYColumnKey = get(tm, 'view.properties.yColumn')

  if (tm.view.properties.type === 'mosaic') {
    return ''
  }
  return defaultYColumn(table, preferredYColumnKey)
}

export const getYSeriesColumns = (state: AppState): Array<string> => {
  const {table} = getVisTable(state)
  const tm = getActiveTimeMachine(state)
  const preferredYSeriesColumns = get(tm, 'view.properties.ySeriesColumns')

  if (tm.view.properties.type === 'mosaic') {
    return defaultYSeriesColumns(table, preferredYSeriesColumns)
  }
  return []
}

const getGroupableColumnSelection = (
  validColumns: string[],
  preference: string[],
  fluxGroupKeyUnion: string[]
): string[] => {
  if (preference && preference.every(col => validColumns.includes(col))) {
    return preference
  }

  return fluxGroupKeyUnion
}

const getFillColumnsSelectionMemoized = memoizeOne(getGroupableColumnSelection)

const getSymbolColumnsSelectionMemoized = memoizeOne(
  getGroupableColumnSelection
)
// if annotations are off, then render just won't show them,
// so ok to retrieve no matter the flag state
export const getAnnotations = (state: AppState) => {
  return state.annotations.annotations
}

export const getFillColumnsSelection = (state: AppState): string[] => {
  const {table} = getVisTable(state)
  const tm = getActiveTimeMachine(state)
  const graphType = tm.view.properties.type
  let validFillColumns
  if (graphType === 'mosaic') {
    validFillColumns = getStringColumnsMemoized(table)
  } else {
    validFillColumns = getGroupableColumns(state)
  }

  const preference = get(
    getActiveTimeMachine(state),
    'view.properties.fillColumns'
  )

  if (graphType === 'mosaic') {
    // user hasn't selected a fill column yet
    if (preference === null) {
      // check if value is a string[]
      for (const key of validFillColumns) {
        if (key.startsWith('_value')) {
          return [key]
        }
      }
      // check if value is a numeric column
      if (table.columnKeys.includes('_value')) {
        return []
      }
    }
  }

  const {fluxGroupKeyUnion} = getVisTable(state)

  return getFillColumnsSelectionMemoized(
    validFillColumns,
    preference,
    fluxGroupKeyUnion
  )
}

export const getSymbolColumnsSelection = (state: AppState): string[] => {
  const validSymbolColumns = getGroupableColumns(state)
  const preference = get(
    getActiveTimeMachine(state),
    'view.properties.symbolColumns'
  )
  const {fluxGroupKeyUnion} = getVisTable(state)

  return getSymbolColumnsSelectionMemoized(
    validSymbolColumns,
    preference,
    fluxGroupKeyUnion
  )
}

/*
  There are 2 types of custom time:
  I. Flux duration, including signed and unsigned durations
     examples: -15m, -24h, +3d, 5mo
  II. JavaScript time: any valid string argument to the `new Date()` constructor
     examples: '2022-10-14T20:33:01.433Z', '2022/07/04', '2022-10-06 00:00'
 */
export const handleCustomTime = (input: string, now: Date): number => {
  // Flux duration
  let timeInput = input ? input.trim() : ''
  let isNegativeDuration = false

  if (timeInput === 'now()') {
    return now.getTime()
  }

  if (isDurationWithNowParseable(timeInput)) {
    timeInput = removeSpacesAndNow(timeInput)
  }

  if (timeInput[0] === '-' || timeInput[0] === '+') {
    isNegativeDuration = timeInput[0] === '-'
    timeInput = timeInput.slice(1).trim()
  }
  if (isDurationParseable(timeInput)) {
    if (isNegativeDuration) {
      return now.getTime() - durationToMilliseconds(parseDuration(timeInput))
    }
    return now.getTime() + durationToMilliseconds(parseDuration(timeInput))
  }

  // JavaScript time stamp for the `new Date()` constructor
  const timeInputDate = new Date(timeInput)
  if (timeInputDate.toTimeString() === 'Invalid Date') {
    throw new Error(`Unknown custom time: ${timeInput}`)
  }
  return timeInputDate.getTime()
}

export const getStartTime = (timeRange: TimeRange) => {
  if (!timeRange) {
    return Infinity
  }
  const now = new Date()
  switch (timeRange.type) {
    case 'custom':
      return handleCustomTime(timeRange.lower, now)
    case 'selectable-duration': {
      const startTime = new Date()
      startTime.setSeconds(startTime.getSeconds() - timeRange.seconds)
      return startTime.getTime()
    }
    case 'duration': {
      const millisecondDuration = durationToMilliseconds(
        parseDuration(timeRangeToDuration(timeRange))
      )
      const startTime = new Date()
      startTime.setMilliseconds(
        startTime.getMilliseconds() - millisecondDuration
      )
      return startTime.getTime()
    }
    default:
      throw new Error(
        'unknown timeRange type ${timeRange.type} provided to getStartTime'
      )
  }
}

export const getEndTime = (timeRange: TimeRange): number => {
  if (!timeRange) {
    return null
  }
  const now = new Date()
  if (timeRange.type === 'custom') {
    return handleCustomTime(timeRange.upper, now)
  }
  return new Date().valueOf()
}

export const getActiveTimeRange = (
  timeRange: TimeRange,
  queries: DashboardQuery[]
) => {
  if (!queries) {
    return timeRange
  }
  const hasVariableTimes = queries.some(
    query =>
      query.text.includes('v.timeRangeStart') ||
      query.text.includes('v.timeRangeStop')
  )
  if (hasVariableTimes) {
    return timeRange
  }
  return null
}

const getMainColumn = (state: AppState) => {
  const {builderConfig} = getActiveQuery(state)
  const {functions} = builderConfig
  const selectedFunctions = functions.map(f => f.name)
  const view = getActiveTimeMachine(state).view as NewView<BandViewProperties>
  const {upperColumn, mainColumn, lowerColumn} = view.properties
  return getMainColumnName(
    selectedFunctions,
    upperColumn,
    mainColumn,
    lowerColumn
  )
}

export const getSaveableView = (state: AppState): QueryView & {id?: string} => {
  const {view, draftQueries} = getActiveTimeMachine(state)

  let saveableView: QueryView & {id?: string} = {
    ...view,
    properties: {
      ...view.properties,
      queries: draftQueries,
    },
  }

  // TODO: remove all of these conditionals
  if (saveableView.properties.type === 'mosaic') {
    saveableView = {
      ...saveableView,
      properties: {
        ...saveableView.properties,
        xColumn: getXColumnSelection(state),
        ySeriesColumns: getYSeriesColumns(state),
        fillColumns: getFillColumnsSelection(state),
      },
    }
  }

  if (saveableView.properties.type === 'histogram') {
    saveableView = {
      ...saveableView,
      properties: {
        ...saveableView.properties,
        xColumn: getXColumnSelection(state),
        fillColumns: getFillColumnsSelection(state),
      },
    }
  }

  if (saveableView.properties.type === 'heatmap') {
    saveableView = {
      ...saveableView,
      properties: {
        ...saveableView.properties,
        xColumn: getXColumnSelection(state),
        yColumn: getYColumnSelection(state),
      },
    }
  }

  if (saveableView.properties.type === 'scatter') {
    saveableView = {
      ...saveableView,
      properties: {
        ...saveableView.properties,
        xColumn: getXColumnSelection(state),
        yColumn: getYColumnSelection(state),
        fillColumns: getFillColumnsSelection(state),
        symbolColumns: getSymbolColumnsSelection(state),
      },
    }
  }

  if (saveableView.properties.type === 'xy') {
    saveableView = {
      ...saveableView,
      properties: {
        ...saveableView.properties,
        xColumn: getXColumnSelection(state),
        yColumn: getYColumnSelection(state),
      },
    }
  }

  if (saveableView.properties.type === 'band') {
    saveableView = {
      ...saveableView,
      properties: {
        ...saveableView.properties,
        xColumn: getXColumnSelection(state),
        yColumn: getYColumnSelection(state),
        mainColumn: getMainColumn(state),
        // 'upperColumn' should NOT be saved here, see below
        // 'lowerColumn' should NOT be saved here, see below
        /*
          REASON:
            In the aggregate function selector of the editor,
            there is no way to tell which aggregate function will be an upper or lower column.

            The only way to tell is to wait until the user explicitly sets
            upper and lower columns inside the Band Options -- which saves them.
        */
      },
    }
  }

  if (saveableView.properties.type === 'line-plus-single-stat') {
    saveableView = {
      ...saveableView,
      properties: {
        ...saveableView.properties,
        xColumn: getXColumnSelection(state),
        yColumn: getYColumnSelection(state),
      },
    }
  }

  return saveableView
}

export const getWindowPeriodFromQueryBuilder = (
  state: AppState,
  viewId: string
): string =>
  get(
    state,
    `resources.views.byID.[${viewId}].properties.queries.[0].builderConfig.aggregateWindow.period`,
    AGG_WINDOW_AUTO
  )
