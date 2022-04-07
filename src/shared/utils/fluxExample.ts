import {FluxFunction} from 'src/types/shared'

export const getFluxExample = (func: FluxFunction) => {
  const {fluxParameters = [], kind, name, package: packageName} = func

  let example = `${packageName}.${name}`
  if (kind.toLowerCase() === 'function') {
    example =
      `${packageName}.${name}(` +
      fluxParameters.reduce((injectedParameters, parameter) => {
        if (parameter.required) {
          // add a comma if the current injected list is not all spaces
          if (injectedParameters.trim().length !== 0) {
            injectedParameters += ', '
          }
          injectedParameters += `${parameter.name}: `
        } else {
          injectedParameters += ' '
        }
        return injectedParameters
      }, '') +
      ')'
  }
  return {...func, example}
}
