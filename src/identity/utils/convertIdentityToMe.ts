import {CurrentIdentity} from '../reducers'
import {Me} from 'src/types'

export const convertIdentityToMe = (quartzIdentity: CurrentIdentity): Me => {
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

  return legacyMe
}
