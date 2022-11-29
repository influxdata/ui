// Types
import {QuartzOrganization} from 'src/identity/apis/org'
import {UserAccount} from 'src/client/unityRoutes'

export const emptyAccount: UserAccount = {
  id: 0,
  name: '',
  isActive: false,
  isDefault: false,
}

export const emptyOrg: QuartzOrganization = {
  id: '',
  name: '',
  isActive: false,
  isDefault: false,
  provider: '',
  regionCode: '',
  regionName: '',
  provisioningStatus: 'provisioned',
}
