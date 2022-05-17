// Constants
import {CLOUD} from 'src/shared/constants'

// Types
import {FluxFunction} from 'src/types/shared'

// Utils
import {isFlagEnabled} from 'src/shared/utils/featureFlag'

export const generateImport = (
  funcPackage: string,
  script: string,
  func?: FluxFunction
): false | string | FluxFunction => {
  let importStatement

  importStatement = `import "${funcPackage}"`

  if (CLOUD && isFlagEnabled('fluxDynamicDocs')) {
    // if package is nested, use func.path to import.
    if (func.path.includes('/')) {
      importStatement = `import "${func.path}"`
    }
  }

  if (
    !funcPackage ||
    funcPackage === 'universe' ||
    script.includes(importStatement)
  ) {
    return false
  }

  return importStatement
}
