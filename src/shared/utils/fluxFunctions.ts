import {FluxFunction} from 'src/types/shared'
import {CLOUD} from 'src/shared/constants'
import {FROM, UNION} from 'src/shared/constants/fluxFunctions'

export const isPipeTransformation = (func: FluxFunction) => {
  if (CLOUD) {
    return func.fluxType.startsWith('<-', 1)
  }
  return !['from', 'union'].includes(func.name)
}

export const functionRequiresNewLine = (funcName: string): boolean => {
  switch (funcName) {
    case FROM.name:
    case UNION.name: {
      return true
    }
    default:
      return false
  }
}
