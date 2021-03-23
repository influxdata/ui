export type Resource = Account | Organization | User | TestResource

export interface Account {
  id: number
  users: object[]
  organizations: object[]
  balance: number
  type: string
  marketplaceSubscription: MarketplaceSubscription
  billingContact: BillingContact
  zuoraAccountId: string
  deletable: boolean
}

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

export interface User {
  firstName: string
  lastName: string
  id: string
  idpeId: string
  email: string
  operator: boolean
  onboardingState: string
  sfdcContactId: string
  accountId: string
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
  header: string
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

export interface Organization {
  name: string
  id: string
  idpeID: string
  account: Account
  region: string
  provider: string
  date: string
}
