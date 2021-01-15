// can we just get this from IDPE
// directly or does Quartz have special

import {RemoteDataState} from 'src/types'

// permissions / knowledge?
interface OrgLimit {
  bucket: BucketLimit
  check: CheckLimit
  dashboard: DashboardLimit
  notificationEndpoint: NotificationEndpointLimit
  notificationRule: NotificationRuleLimit
  orgID: string
  rate: RateLimit
  task: TaskLimit
}

interface BucketLimit {
  maxBuckets: number
  maxRetentionDuration: number
}

interface CheckLimit {
  maxChecks: number
}

interface DashboardLimit {
  maxDashboards: number
}

interface NotificationEndpointLimit {
  blockedNotificationEndpoints: string
}

interface NotificationRuleLimit {
  blockedNotificationRules: string
  maxNotifications: number
}

interface RateLimit {
  cardinality: number
  readKBs: number
  writeKBs: number
}

interface TaskLimit {
  maxTasks: number
}

export interface LimitStatuses {
  cardinality: LimitStatus
  read: LimitStatus
  write: LimitStatus
  status: RemoteDataState
}

export interface LimitStatus {
  status: string
}

interface Region {
  title: string
  isBeta: boolean
  isAvailable: boolean
  provider: string
  region: string
}

interface BillingContact {
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

interface CreditCardParams {
  id: string
  tenantID: string
  key: string
  signature: string
  token: string
  style: string
  submitEnabled: 'true' | 'false' // Zuora wants the literal string true or false
  url: string
}

type AccountType = 'free' | 'cancelled' | 'pay_as_you_go'

export interface MarketplaceSubscription {
  marketplace: string
  subscriberId: string
  status: string
}

export interface Account {
  id: number
  type: AccountType
  updatedAt: string
  status: RemoteDataState
}

export interface History {
  billingStats: string
  rateLimits: string
  status: RemoteDataState
}

interface PaymentMethod {
  cardType: string
  cardNumber: string
  expirationMonth: string
  expirationYear: string
  defaultPaymentMethod: boolean
}

type PaymentMethods = PaymentMethod[]

interface Invoice {
  status: string
  amount: number
  targetDate: string
  filesID: string
}

type Invoices = Invoice[]

// Current FreePage Props
export interface Props {
  isRegionBeta: boolean
  orgLimits: OrgLimit
}

interface BillingNotifySettings {
  isNotify: boolean
  balanceThreshold: number
  notifyEmail: string
}

export interface BillingDate {
  date: Date | string
  time: Date | string
  status: RemoteDataState
}

// Current PayAsYouGo Props
export interface Props {
  region: Region
  account: Account // could we possibly combine Account with BillingContact?
  invoices: Invoices // separate endpoint [X]
  paymentMethods: PaymentMethods // separate endpoint [X]
  ccPageParams: CreditCardParams // separate endpoint [X]
  contact: BillingContact // separate endpoint (get, put)
  email: string // where does this come from?
  billingNotifySettings: BillingNotifySettings // separate endpoint w/ put [x]
  orgLimits: OrgLimit // get from IDPE
  limitStatuses: LimitStatuses // get from IDPE
  history: History
}
