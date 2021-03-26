import {Organization as GenOrg, User as GenUser} from 'src/client/unityRoutes'
export {Account, Organizations, OrgLimits} from 'src/client/unityRoutes'

export interface Organization extends GenOrg {}
export interface User extends GenUser {}

export type Resource = Account | User | Organization

export interface MarketplaceSubscription {
  marketplace: string
  subscriberId: string
  status: string
}
export interface BillingContact {
  companyName: string
  email: string
  firstName: string
  lastName: string
  country: string
  street1: string
  street2: string
  city: string
  subdivision: string
  postalCode: number
}

export interface TestResource {
  name: string
  id: string
  email: string
  operator: boolean
  account: Account
}

export interface CellInfo {
  path: string[]
  name: string
  header?: string
  defaultValue: string | number
  renderValue?: (any) => any
}

export interface ResourceInfo {
  path: string[][]
  name: string
  header: string
  defaultValue: string | number
  renderValue?: (any) => any
}
