import {CurrentIdentity} from 'src/identity/apis/auth'
import {Me as MeQuartz} from 'src/client/unityRoutes'

// Transform a response from `/identity` into a response that Me machinery can use
export const convertIdentityToMe = (
  quartzIdentity: CurrentIdentity
): MeQuartz => {
  const {account, org, user} = quartzIdentity

  return {
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
}
