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

import {CurrentIdentity} from '../reducers'
import {RemoteDataState} from 'src/types'
import {setQuartzMe, setQuartzMeStatus} from 'src/me/actions/creators'

// Retrieve the user's quartz identity, using /quartz/identity if the 'quartzIdentity' flag is enabled.
export const retrieveQuartzIdentity = () =>
  CLOUD && isFlagEnabled('quartzIdentity') ? getIdentity({}) : getMe({})

// Populate the user's quartz identity in state, using /quartz/identity if the 'quartzIdentity' flag is enabled.
export const storeIdentityInStateThunk = () =>
  CLOUD && isFlagEnabled('quartzIdentity')
    ? getQuartzIdentityThunk()
    : getQuartzMeThunk()

// Transitional function that translates quartzIdentity state into quartzMe state.
export const syncQuartzMe = (
  quartzIdentity: CurrentIdentity,
  dispatch: any
): void => {
  const {account, org, user} = quartzIdentity

  const legacyMe = {
    // User Data
    email: user.email,
    id: user.id,
    // Careful about this line.
    isOperator: user.operatorRole ? true : false,
    operatorRole: user.operatorRole,

    // Account Data
    accountCreatedAt: account.accountCreatedAt,
    accountType: account.type,
    paygCreditStartDate: account.paygCreditStartDate,
    billingProvider: account.billingProvider ? account.billingProvider : null,

    // Organization Data
    clusterHost: org.clusterHost,
    regionCode: org.regionCode ? org.regionCode : null,
    isRegionBeta: org.isRegionBeta ? org.isRegionBeta : null,
    regionName: org.regionName ? org.regionName : null,
  }

  dispatch(setQuartzMe(legacyMe, RemoteDataState.Done))
  dispatch(setQuartzMeStatus(RemoteDataState.Done))
}
