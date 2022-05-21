// APIs
import {parse} from 'src/languageSupport/languages/flux/parser'

// Utils
import {
  getDurationFromAST,
  getWindowPeriodVariableAssignment,
} from 'src/shared/utils/ast/getDurationFromAST'
import {buildVarsOption} from 'src/variables/utils/buildVarsOption'
import {asAssignmentNode} from 'src/variables/utils/convertVariables'

// Constants
import {WINDOW_PERIOD} from 'src/variables/constants'
import {DESIRED_POINTS_PER_GRAPH} from 'src/shared/constants'
import {SELECTABLE_TIME_RANGES} from 'src/shared/constants/timeRanges'

// Types
import {VariableAssignment} from 'src/types/ast'
import {RemoteDataState, Variable, Package} from 'src/types'

export const calcWindowPeriodForDuration = (queryDuration: number) =>
  Math.round(queryDuration / DESIRED_POINTS_PER_GRAPH) // queryDuration in ms

/*
  Get the duration (in milliseconds) used by `v.windowPeriod`
*/
export const getDurationFromVariables = (
  query: string,
  variables: Variable[]
): number | null => {
  if (query.length === 0) {
    return null
  }

  try {
    const varAssignments = variables
      .map(v => asAssignmentNode(v))
      .filter(v => !!v)

    const outerScopeAst: Package = {
      package: '',
      type: 'Package',
      files: [buildVarsOption(varAssignments)],
    }

    const ast = parse(query)
    const queryDuration = getDurationFromAST(ast, outerScopeAst)

    const foundDuration = SELECTABLE_TIME_RANGES.find(
      tr => tr.seconds * 1000 === queryDuration
    )
    if (foundDuration) {
      return foundDuration.windowPeriod
    }

    return calcWindowPeriodForDuration(queryDuration)
  } catch (error) {
    console.warn('error', error)
    return null
  }
}

/*
  Extract the UI abstraction Variable for `v.windowPeriod`
*/
export const getWindowPeriodVariableFromVariables = (
  query: string,
  variables: Variable[]
): Variable[] | null => {
  const total = getDurationFromVariables(query, variables)
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

/*
  Extract the ast VariableAssignment for `v.windowPeriod`
*/
export const getWindowVarAssignmentFromVariables = (
  query: string,
  variables: Variable[]
): VariableAssignment[] => {
  if (!query.includes(WINDOW_PERIOD)) {
    return []
  }
  try {
    const varAssignments = variables
      .map(v => asAssignmentNode(v))
      .filter(v => !!v)

    const outerScopeAst: Package = {
      package: '',
      type: 'Package',
      files: [buildVarsOption(varAssignments)],
    }

    const ast = parse(query)
    const windowPeriodAst = getWindowPeriodVariableAssignment(
      ast,
      outerScopeAst
    )
    return [windowPeriodAst]
  } catch (e) {
    console.warn('error', e)
    return null
  }
}
