import {isFlagEnabled} from 'src/shared/utils/featureFlag'

export const shouldUseQuartzIdentity = (): boolean =>
  isFlagEnabled('uiUnificationFlag') && isFlagEnabled('quartzIdentity')
    ? true
    : false
