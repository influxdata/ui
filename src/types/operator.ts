export {
  Account,
  Me,
  BillingContact,
  Organization,
  Organizations,
  OrgLimits,
  User,
} from 'src/client/unityRoutes'

export interface MarketplaceSubscription {
  marketplace: string
  subscriberId: string
  status: string
}

export interface TestResource {
  name: string
  id: string
  email: string
  operator: boolean
  account: Account
}

export interface CellInfo {
  path: string
  name: string
  header?: string
  defaultValue: string | number
  renderValue?: (any) => any
}

export interface ResourceInfo {
  path: string[]
  name: string
  header: string
  defaultValue: string | number
  renderValue?: (any) => any
}
