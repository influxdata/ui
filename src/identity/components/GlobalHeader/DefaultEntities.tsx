// Types
import {UserAccount} from 'src/client/unityRoutes'
import {OrganizationSummaries} from 'src/client/unityRoutes'

export const emptyAccount: UserAccount = {
  id: 0,
  name: '',
  isActive: false,
  isDefault: false,
}

export const emptyOrg: OrganizationSummaries[number] = {
  id: '',
  name: '',
  isActive: false,
  isDefault: false,
}
