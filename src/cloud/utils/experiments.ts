const pushDataLayerEvent = async (dataLayerEvent: string) => {
  if (window.dataLayer) {
    await window.dataLayer.push({event: dataLayerEvent})
  }
}

const getVariant = (experimentID: string, attempts: number = 10): string => {
  if (attempts <= 0) {
    return ''
  }
  if (window['google_optimize']) {
    return window['google_optimize'].get(experimentID) || null
  }
  setTimeout(() => getVariant(experimentID, attempts - 1), 100)
}

export const getExperimentVariantId = (
  experimentID: string,
  activationEvent: string = 'optimize.activate'
): string => {
  pushDataLayerEvent(activationEvent)
  return getVariant(experimentID)
}
