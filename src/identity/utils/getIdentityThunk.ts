import {CLOUD} from 'src/shared/constants'
import {isFlagEnabled} from 'src/shared/utils/featureFlag'
import {getQuartzMeThunk} from 'src/me/actions/thunks'
import {getQuartzIdentityThunk} from '../actions/thunks'

// For now, check for both uiUnificationFlag and quartzIdentity to ensure this isn't used in tools.
export const getIdentityThunk = () =>
  CLOUD && isFlagEnabled('uiUnificationFlag') && isFlagEnabled('quartzIdentity')
    ? getQuartzIdentityThunk()
    : getQuartzMeThunk()
