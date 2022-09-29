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
    // isOperator is inferred from presence of a string value to operatorRole (read-write or read-only).
    isOperator: user.operatorRole ? true : false,
    operatorRole: user.operatorRole,

    // Account Data
    accountCreatedAt: account.accountCreatedAt,
    accountType: account.type,
    paygCreditStartDate: account.paygCreditStartDate,
    billingProvider: account.billingProvider ? account.billingProvider : null,
    // isRegionBeta in quartz/me has the opposite value of isUpgradeable.
    isRegionBeta: account.isUpgradeable
      ? !Boolean(account.isUpgradeable)
      : true,

    // Organization Data
    clusterHost: org.clusterHost,
    regionCode: org.regionCode ? org.regionCode : null,
    regionName: org.regionName ? org.regionName : null,
  }
}
