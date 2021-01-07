// can we just get this from IDPE
// directly or does Quartz have special
// permissions / knowledge?
import {Account as GenAccount} from 'src/client/unityRoutes'
import {RemoteDataState} from 'src/types'

export interface OrgLimit {
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

interface LimitStatuses {
  cardinality: LimitStatus
  read: LimitStatus
  write: LimitStatus
}

interface LimitStatus {
  status: string
}

export interface Region {
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

export interface MarketplaceSubscription {
  marketplace: string
  subscriberId: string
  status: string
}

export interface Account extends GenAccount {
  status: RemoteDataState
}

interface PaymentMethod {
  cardType: string
  cardNumber: string
  expirationMonth: string
  expirationYear: string
  defaultPaymentMethod: boolean
}

export type PaymentMethods = PaymentMethod[]

interface Invoice {
  status: string
  amount: number
  targetDate: string
  filesID: string
}

export type Invoices = Invoice[]

// Current FreePage Props
export interface Props {
  isRegionBeta: boolean
  orgLimits: OrgLimit
}

export interface BillingNotifySettings {
  isNotify: boolean
  balanceThreshold: number
  notifyEmail: string
}

// Current PayAsYouGo Props
export interface Props {
  account: Account // could we possibly combine Account with BillingContact?
  billingNotifySettings: BillingNotifySettings // separate endpoint w/ put [x]
  ccPageParams: CreditCardParams // separate endpoint [X]
  contact: BillingContact // separate endpoint (get, put)
  email: string // where does this come from?
  invoices: Invoices // separate endpoint [X]
  limitStatuses: LimitStatuses // get from IDPE
  paymentMethods: PaymentMethods // separate endpoint [X]
  orgLimits: OrgLimit // get from IDPE
  region: Region
}
