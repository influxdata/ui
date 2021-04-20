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
  const spaceRegex = /^\s*$/

  // must start with a letter or underscore, can only contain letters, numbers, and underscores only
  const validCharacters = /^[A-Za-z_]+\w*$/

  const emptyErrorText = 'Variable name cannot be empty'
  const fullErrorText =
    'Variable name must start with a letter or underscore, and ' +
    'contain only numbers, letters, and underscores.'

  if ((varName || '').match(spaceRegex)) {
    return {error: emptyErrorText}
  }

  // it has content; so check the full regex now:
  // (using this regex first has a runtime error if the varName is empty/undefined)
  if (!varName.match(validCharacters)) {
    return {error: fullErrorText}
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

  const matchingName = variables?.find(v => {
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

  return {error: null}
}
