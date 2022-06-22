// APIs
import {parse} from 'src/languageSupport/languages/flux/parser'

// Utils
import {getMinDurationFromAST} from 'src/shared/utils/getMinDurationFromAST'
import {
  buildUsedVarsOption,
  buildVarsOption,
} from 'src/variables/utils/buildVarsOption'

// Constants
import {WINDOW_PERIOD} from 'src/variables/constants'

// Types
import {VariableAssignment, Package} from 'src/types/ast'
import {RemoteDataState, Variable} from 'src/types'
import {SELECTABLE_TIME_RANGES} from 'src/shared/constants/timeRanges'

const DESIRED_POINTS_PER_GRAPH = 360
const FALLBACK_WINDOW_PERIOD = 15000
const FINEST_WINDOW_PERIOD_PRECISION = 1000

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

export const getWindowPeriodVariableForZoomRequery = (): Variable => ({
  orgID: '',
  id: WINDOW_PERIOD,
  name: WINDOW_PERIOD,
  arguments: {
    type: 'system',
    values: [FINEST_WINDOW_PERIOD_PRECISION],
  },
  status: RemoteDataState.Done,
  labels: [],
  selected: [],
})
