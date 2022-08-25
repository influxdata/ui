import {
  Authorization,
  Bucket,
  Cell,
  Check,
  Dashboard,
  DashboardSortParams,
  Label,
  Member,
  NotificationEndpoint,
  NotificationRule,
  Organization,
  RemoteDataState,
  Scraper,
  Secret,
  TasksState,
  Telegraf,
  TemplatesState,
  VariablesState,
  View,
  Subscription,
} from 'src/types'

export enum ResourceType {
  Authorizations = 'tokens',
  Buckets = 'buckets',
  Cells = 'cells',
  Checks = 'checks',
  Dashboards = 'dashboards',
  Flows = 'flows',
  Labels = 'labels',
  Orgs = 'orgs',
  Members = 'members',
  NotificationRules = 'rules',
  NotificationEndpoints = 'endpoints',
  Plugins = 'plugins',
  Scrapers = 'scrapers',
  Secrets = 'secrets',
  Scripts = 'scripts',
  Tasks = 'tasks',
  Templates = 'templates',
  Telegrafs = 'telegrafs',
  Subscriptions = 'subscriptions',
  Variables = 'variables',
  Views = 'views',
}

export interface NormalizedState<R> {
  byID: {
    [uuid: string]: R
  }
  allIDs: string[]
  status: RemoteDataState
}

export interface OrgsState extends NormalizedState<Organization> {
  org: Organization
}

export interface TelegrafsState extends NormalizedState<Telegraf> {
  currentConfig: {status: RemoteDataState; item: string}
}

export interface SubscriptionState extends NormalizedState<Subscription> {
  subscription: Subscription
}

export interface AuthState extends NormalizedState<Authorization> {
  currentAuth: {status: RemoteDataState; item: Authorization}
  allResources: string[]
}

export interface RulesState extends NormalizedState<NotificationRule> {
  current: {status: RemoteDataState; rule: NotificationRule}
}
export interface DashboardsState extends NormalizedState<Dashboard> {
  searchTerm: string
  sortOptions: DashboardSortParams
}

// Cells "allIDs" are Dashboard.cells
type CellsState = Omit<NormalizedState<Cell>, 'allIDs'>

// ResourceState defines the types for normalized resources
export interface ResourceState {
  [ResourceType.Authorizations]: AuthState
  [ResourceType.Buckets]: NormalizedState<Bucket>
  [ResourceType.Cells]: CellsState
  [ResourceType.Checks]: NormalizedState<Check>
  [ResourceType.Dashboards]: DashboardsState
  [ResourceType.Labels]: NormalizedState<Label>
  [ResourceType.Members]: NormalizedState<Member>
  [ResourceType.Orgs]: OrgsState
  [ResourceType.Scrapers]: NormalizedState<Scraper>
  [ResourceType.Secrets]: NormalizedState<Secret>
  [ResourceType.Tasks]: TasksState
  [ResourceType.Telegrafs]: TelegrafsState
  [ResourceType.Templates]: TemplatesState
  [ResourceType.Variables]: VariablesState
  [ResourceType.Views]: NormalizedState<View>
  [ResourceType.NotificationEndpoints]: NormalizedState<NotificationEndpoint>
  [ResourceType.NotificationRules]: RulesState
}
