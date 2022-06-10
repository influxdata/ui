// Functions calling API
import {getMe} from 'src/client/unityRoutes'
import {getIdentity} from 'src/client/unityRoutes'

// Feature Flag Check
import {isFlagEnabled} from 'src/shared/utils/featureFlag'

// Constants
import {CLOUD} from 'src/shared/constants'

// Thunks
import {getQuartzMeThunk} from 'src/me/actions/thunks'
import {getQuartzIdentityThunk} from '../actions/thunks'

// Decide whether or not to use legacy /quartz/me to retrieve user's current status.

export const retrieveQuartzIdentity = () =>
  CLOUD && isFlagEnabled('quartzIdentity') ? getIdentity({}) : getMe({})

export const retrieveIdentityThunk = () =>
  CLOUD && isFlagEnabled('quartzIdentity')
    ? getQuartzIdentityThunk()
    : getQuartzMeThunk()
