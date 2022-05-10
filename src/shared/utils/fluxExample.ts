import {FluxFunction} from 'src/types/shared'

export const getFluxExample = (func: FluxFunction) => {
  const {fluxParameters = [], kind, name, package: packageName} = func

  let example = `${packageName}.${name}`
  if (kind.toLowerCase() === 'function') {
    let injectedParameters = ''
    for (const parameter of fluxParameters) {
      if (parameter.required) {
        // add a comma if the current injected list is not all spaces
        if (injectedParameters.trim().length !== 0) {
          injectedParameters = `${injectedParameters}, `
        }
        injectedParameters = `${injectedParameters}${parameter.name}: `
      } else {
        injectedParameters = `${injectedParameters} `
      }
    }
    example =
      packageName === 'universe'
        ? `${name}(${injectedParameters})`
        : `${packageName}.${name}(${injectedParameters})`
  }
  return {...func, example}
}
