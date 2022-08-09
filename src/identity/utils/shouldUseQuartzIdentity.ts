import {CLOUD} from 'src/shared/constants'
import {isFlagEnabled} from 'src/shared/utils/featureFlag'

export const shouldUseQuartzIdentity = (): boolean =>
  CLOUD && isFlagEnabled('quartzIdentity')
