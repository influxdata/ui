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

// Use the old /quartz/me endpoint to retrieve the user's identity if the quartzIdentity flag is disabled.

export const retrieveQuartzIdentity = () =>
  CLOUD && isFlagEnabled('quartzIdentity') ? getMe({}) : getIdentity({})

export const retrieveIdentityThunk = () =>
  CLOUD && isFlagEnabled('quartzIdentity')
    ? getQuartzIdentityThunk()
    : getQuartzMeThunk()
