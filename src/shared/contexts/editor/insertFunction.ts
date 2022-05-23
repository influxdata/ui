// Constants
import {CLOUD} from 'src/shared/constants'

// Types
import {FluxFunction} from 'src/types/shared'

// Utils
import {isFlagEnabled} from 'src/shared/utils/featureFlag'

export const generateImport = (func: FluxFunction, script: string): string => {
  let importStatement = `import "${func.package}"`

  if (CLOUD && isFlagEnabled('fluxDynamicDocs')) {
    // if package is nested, use func.path to import.
    if (func.path.includes('/')) {
      importStatement = `import "${func.path}"`
    }
  }

  if (
    !func.package ||
    func.package === 'universe' ||
    script.includes(importStatement)
  ) {
    return null
  }

  return importStatement
}
