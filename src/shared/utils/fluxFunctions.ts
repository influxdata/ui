import {FluxFunction} from 'src/types/shared'
import {CLOUD} from 'src/shared/constants'
import {FROM, UNION} from 'src/shared/constants/fluxFunctions'
import {isFlagEnabled} from 'src/shared/utils/featureFlag'

export const isPipeTransformation = (func: FluxFunction) => {
  if (CLOUD && isFlagEnabled('fluxDynamicDocs')) {
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
