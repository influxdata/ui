// can we just get this from IDPE
// directly or does Quartz have special
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

interface LimitStatuses {
  cardinality: LimitStatus
  read: LimitStatus
  write: LimitStatus
}

interface LimitStatus {
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

interface ZuoraParams {
  id: string
  tenantId: string
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

interface Account {
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

interface PaymentSummary {
  cardType: string
  cardNumber: string
  expirationMonth: string
  expirationYear: string
}

interface PaymentMethod extends PaymentSummary {
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

// Current PayAsYouGo Props
// Since the BillingPage did not take advantage of TypeScript
// I searched to see if the types were used somewhere! Looks like they
// were!
export interface Props {
  email: string
  invoices: Invoices
  paymentMethods: PaymentMethods
  account: Account
  accountType: AccountType
  orgLimits: OrgLimit
  ccPageParams: ZuoraParams
  contact: BillingContact
  balanceThreshold: number
  isNotify: boolean
  notifyEmail: string
  limitStatuses: LimitStatuses
  region: Region
}
