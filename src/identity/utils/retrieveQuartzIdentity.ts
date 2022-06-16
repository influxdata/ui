import {getQuartzMeThunk} from 'src/me/actions/thunks'
import {isFlagEnabled} from 'src/shared/utils/featureFlag'
import {getQuartzIdentityThunk} from '../actions/thunks'
import {CLOUD} from 'src/shared/constants'

export const retrieveQuartzIdentity = () => {
  if (!CLOUD || !isFlagEnabled('uiUnificationFlag')) {
    return
  }
  if (!isFlagEnabled('quartzIdentity')) {
    return getQuartzMeThunk()
  }
  return getQuartzIdentityThunk()
}
