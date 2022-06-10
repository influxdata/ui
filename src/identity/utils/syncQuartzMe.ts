import {CurrentIdentity} from '../reducers'
import {RemoteDataState} from 'src/types'
import {setQuartzMe, setQuartzMeStatus} from 'src/me/actions/creators'

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
