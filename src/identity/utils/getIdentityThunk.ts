import {CLOUD} from 'src/shared/constants'
import {isFlagEnabled} from 'src/shared/utils/featureFlag'
import {getQuartzMeThunk} from 'src/me/actions/thunks'
import {getQuartzIdentityThunk} from '../actions/thunks'

export const getIdentityThunk = () =>
  CLOUD && isFlagEnabled('quartzIdentity')
    ? getQuartzIdentityThunk()
    : getQuartzMeThunk()
