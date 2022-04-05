// Constants
import {FROM, UNION} from 'src/shared/constants/fluxFunctions'

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

export const generateImport = (
  funcPackage: string,
  script: string
): false | string => {
  const importStatement = `import "${funcPackage}"`

  if (!funcPackage || script.includes(importStatement)) {
    return false
  }

  return importStatement
}
