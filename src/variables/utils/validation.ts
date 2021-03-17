import {Variable} from 'src/types'
import {
  TIME_RANGE_START,
  TIME_RANGE_STOP,
  WINDOW_PERIOD,
} from 'src/variables/constants'

const reservedVarNames = [TIME_RANGE_START, TIME_RANGE_STOP, WINDOW_PERIOD]

// Two ways to use:
//   1) varName is a new variable being created and must pass validation
//      - id is not needed since it does not exist yet
//   2) varName is an existing variable and must pass validation
//      - must also include the variable's id as third argument
export const validateVariableName = (
  variables: Variable[],
  varName: string,
  id?: string
): {error: string | null} => {
  if ((varName || '').match(/^\s*$/)) {
    return {error: 'Variable name cannot be empty'}
  }

  const lowerName = varName.toLocaleLowerCase()

  const reservedMatch = reservedVarNames.find(
    r => r.toLocaleLowerCase() === lowerName
  )

  if (!!reservedMatch) {
    return {
      error: `Variable name is reserved: ${reservedMatch}`,
    }
  }

  const matchingName = variables.find(v => {
    if (!id) {
      return v.name.toLocaleLowerCase() === lowerName
    }
    return v.id !== id && v.name.toLocaleLowerCase() === lowerName // this prevents triggering a match on a Variable's own name
  })

  if (!!matchingName) {
    return {
      error: `Variable name must be unique`,
    }
  }

  if (!varName[0].match(/[A-Z]|[_]/i)) {
    return {
      error: `Variable name must begin with a letter or underscore`,
    }
  }

  if (/[-\s]+/g.test(varName)) {
    return {
      error: `Variable name must not have any hyphens or spaces`,
    }
  }

  return {error: null}
}
