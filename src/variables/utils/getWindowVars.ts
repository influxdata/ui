// Libraries
import {NumericColumnData} from '@influxdata/giraffe'

// APIs
import {parse} from 'src/languageSupport/languages/flux/parser'

// Utils
import {getMinDurationFromAST} from 'src/shared/utils/getMinDurationFromAST'
import {
  buildUsedVarsOption,
  buildVarsOption,
} from 'src/variables/utils/buildVarsOption'

// Constants
import {
  TIME_RANGE_START,
  TIME_RANGE_STOP,
  WINDOW_PERIOD,
} from 'src/variables/constants'

// Types
import {VariableAssignment, Package} from 'src/types/ast'
import {RemoteDataState, TimeRange, Variable} from 'src/types'
import {SELECTABLE_TIME_RANGES} from 'src/shared/constants/timeRanges'

const DESIRED_POINTS_PER_GRAPH = 360
const MINIMUM_WINDOW_PERIOD = 1
export const FALLBACK_WINDOW_PERIOD = 15000

/*
  Compute the `v.windowPeriod` variable assignment for a query.
*/
export const getWindowVarsFromVariables = (
  query: string,
  variables: Variable[]
): VariableAssignment[] => {
  if (!query.includes(WINDOW_PERIOD)) {
    return []
  }

  const windowPeriod =
    getWindowPeriodFromVariables(query, variables) || FALLBACK_WINDOW_PERIOD

  return [
    {
      type: 'VariableAssignment',
      id: {
        type: 'Identifier',
        name: WINDOW_PERIOD,
      },
      init: {
        type: 'DurationLiteral',
        values: [{magnitude: windowPeriod, unit: 'ms'}],
      },
    },
  ]
}

export const getWindowVars = (
  query: string,
  variables: VariableAssignment[]
): VariableAssignment[] => {
  if (!query.includes(WINDOW_PERIOD)) {
    return []
  }

  const windowPeriod =
    getWindowPeriod(query, variables) || FALLBACK_WINDOW_PERIOD

  return [
    {
      type: 'VariableAssignment',
      id: {
        type: 'Identifier',
        name: WINDOW_PERIOD,
      },
      init: {
        type: 'DurationLiteral',
        values: [{magnitude: windowPeriod, unit: 'ms'}],
      },
    },
  ]
}

export const calcWindowPeriodForDuration = (queryDuration: number) =>
  Math.round(queryDuration / DESIRED_POINTS_PER_GRAPH) // queryDuration in ms

/*
  Compute the duration (in milliseconds) to use for the `v.windowPeriod`
  variable assignment for a query.
*/
export const getWindowPeriod = (
  query: string,
  variables: VariableAssignment[]
): number | null => {
  if (query.length === 0) {
    return null
  }
  try {
    const ast = parse(query)
    const substitutedAST: Package = {
      package: '',
      type: 'Package',
      files: [ast, buildVarsOption(variables)],
    }

    const queryDuration = getMinDurationFromAST(substitutedAST) // in ms

    const foundDuration = SELECTABLE_TIME_RANGES.find(
      tr => tr.seconds * 1000 === queryDuration
    )

    if (foundDuration) {
      return foundDuration.windowPeriod
    }

    return calcWindowPeriodForDuration(queryDuration)
  } catch (error) {
    return null
  }
}

export const getWindowPeriodFromVariables = (
  query: string,
  variables: Variable[]
): number | null => {
  if (query.length === 0) {
    return null
  }
  try {
    const ast = parse(query)
    const substitutedAST: Package = {
      package: '',
      type: 'Package',
      files: [ast, buildUsedVarsOption(query, variables)],
    }

    const queryDuration = getMinDurationFromAST(substitutedAST) // in ms

    const foundDuration = SELECTABLE_TIME_RANGES.find(
      tr => tr.seconds * 1000 === queryDuration
    )

    if (foundDuration) {
      return foundDuration.windowPeriod
    }

    return calcWindowPeriodForDuration(queryDuration)
  } catch (error) {
    return null
  }
}

export const getWindowPeriodVariable = (
  query: string,
  variables: VariableAssignment[]
): Variable[] | null => {
  const total = getWindowPeriod(query, variables)

  if (total === null || total === Infinity) {
    return null
  }

  const windowPeriodVariable: Variable = {
    orgID: '',
    id: WINDOW_PERIOD,
    name: WINDOW_PERIOD,
    arguments: {
      type: 'system',
      values: [total],
    },
    status: RemoteDataState.Done,
    labels: [],
  }

  return [windowPeriodVariable]
}
export const getWindowPeriodVariableFromVariables = (
  query: string,
  variables: Variable[]
): Variable[] | null => {
  const total = getWindowPeriodFromVariables(query, variables)

  if (total === null || total === Infinity) {
    return null
  }

  const windowPeriodVariable: Variable = {
    orgID: '',
    id: WINDOW_PERIOD,
    name: WINDOW_PERIOD,
    arguments: {
      type: 'system',
      values: [total],
    },
    status: RemoteDataState.Done,
    labels: [],
  }

  return [windowPeriodVariable]
}

export const getVariableForZoomRequery = (
  variableID: string,
  domain: number[]
): Variable => {
  const variable: Variable = {
    orgID: '',
    id: variableID,
    name: variableID,
    arguments: {
      type: 'system',
    },
    status: RemoteDataState.Done,
    labels: [],
    selected: [],
  }

  const startTime = new Date(domain?.[0] ?? '')
  const stopTime = new Date(domain?.[1] ?? '')
  switch (variableID) {
    case TIME_RANGE_START:
      variable.arguments.values = [startTime.toISOString()]
      return variable

    case TIME_RANGE_STOP:
      variable.arguments.values = [stopTime.toISOString()]
      return variable

    default:
      return variable
  }
}

/*
 * Prevents the windowPeriod from being null for the time axis
 *   this fallback is used only for the zoom re-query feature
 *   if the windowPeriod cannot be found, apply the user-selected domain
 *     to the original data set and divide by the optimal number of graph points
 *     to get the estimated windowPeriod
 */
export const normalizeWindowPeriodForZoomRequery = (
  windowPeriod: number | null,
  timeRange: TimeRange,
  domain: Array<number>,
  column: NumericColumnData | string[]
): number => {
  if (windowPeriod || !timeRange || !column) {
    if (windowPeriod < 0) {
      return FALLBACK_WINDOW_PERIOD
    }
    return windowPeriod
  }

  if (
    column.length === 0 ||
    domain.length !== 2 ||
    Number.isNaN(domain[0]) ||
    Number.isNaN(domain[1])
  ) {
    return FALLBACK_WINDOW_PERIOD
  }

  let counter = 0
  let startIndex = counter
  let endIndex = counter
  let isSorted = true
  let prevValue = column[counter]

  while (counter < column.length) {
    if (domain[0] > column[counter]) {
      startIndex = counter
    }
    if (domain[1] > column[counter]) {
      endIndex = counter
    }
    if (prevValue > column[counter] || column[counter] !== column[counter]) {
      counter = column.length
      isSorted = false
    } else {
      prevValue = column[counter]
      counter += 1
    }
  }

  const duration =
    (Number(column[endIndex]) - Number(column[startIndex])) /
    DESIRED_POINTS_PER_GRAPH

  if (duration === Infinity || Number.isNaN(duration) || isSorted === false) {
    return FALLBACK_WINDOW_PERIOD
  }

  return Math.max(duration, MINIMUM_WINDOW_PERIOD)
}

/*
 * Prevents the windowPeriod assignment from being empty
 *   this fallback is used only for the zoom re-query feature
 *   re-querying should include the windowPeriod assignment as a literal
 *   even if the backend ignores it due to an override in the Flux script
 */
export const normalizeWindowPeriodVariableForZoomRequery = (
  variableAssignment: VariableAssignment[],
  windowPeriod: number
): VariableAssignment[] => {
  if (Array.isArray(variableAssignment) && variableAssignment.length) {
    return variableAssignment
  }

  const assignedWindowPeriod = Math.max(
    Math.min(Math.round(windowPeriod), FALLBACK_WINDOW_PERIOD),
    MINIMUM_WINDOW_PERIOD
  )

  return [
    {
      type: 'VariableAssignment',
      id: {
        type: 'Identifier',
        name: WINDOW_PERIOD,
      },
      init: {
        type: 'DurationLiteral',
        values: [{magnitude: assignedWindowPeriod, unit: 'ms'}],
      },
    },
  ]
}
