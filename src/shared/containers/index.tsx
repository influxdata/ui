import {lazy} from 'react'

export const DataExplorerPage = lazy(() =>
  import('src/dataExplorer/components/DataExplorerPage')
)
export const MePage = lazy(() => import('src/me/containers/MePage'))
export const TasksPage = lazy(() => import('src/tasks/containers/TasksPage'))
export const TaskPage = lazy(() => import('src/tasks/containers/TaskPage'))
export const TaskRunsPage = lazy(() =>
  import('src/tasks/components/TaskRunsPage')
)
export const TaskEditPage = lazy(() =>
  import('src/tasks/containers/TaskEditPage')
)
export const DashboardsIndex = lazy(() =>
  import('src/dashboards/components/dashboard_index/DashboardsIndex')
)
export const DashboardContainer = lazy(() =>
  import('src/dashboards/components/DashboardContainer')
)
export const FlowPage = lazy(() => import('src/flows/components/FlowPage'))
export const BucketsIndex = lazy(() =>
  import('src/buckets/containers/BucketsIndex')
)
export const TokensIndex = lazy(() =>
  import('src/authorizations/containers/TokensIndex')
)
export const TelegrafsPage = lazy(() =>
  import('src/telegrafs/containers/TelegrafsPage')
)
export const ScrapersIndex = lazy(() =>
  import('src/scrapers/containers/ScrapersIndex')
)
export const WriteDataPage = lazy(() =>
  import('src/writeData/containers/WriteDataPage')
)
export const VariablesIndex = lazy(() =>
  import('src/variables/containers/VariablesIndex')
)
export const LabelsIndex = lazy(() =>
  import('src/labels/containers/LabelsIndex')
)
export const OrgProfilePage = lazy(() =>
  import('src/organizations/containers/OrgProfilePage')
)
export const AlertingIndex = lazy(() =>
  import('src/alerting/components/AlertingIndex')
)
export const AlertHistoryIndex = lazy(() =>
  import('src/alerting/components/AlertHistoryIndex')
)
export const CheckHistory = lazy(() =>
  import('src/checks/components/CheckHistory')
)
export const MembersIndex = lazy(() =>
  import('src/members/containers/MembersIndex')
)
export const RouteToDashboardList = lazy(() =>
  import('src/dashboards/components/RouteToDashboardList')
)
export const ClientLibrariesPage = lazy(() =>
  import('src/writeData/containers/ClientLibrariesPage')
)
export const TelegrafPluginsPage = lazy(() =>
  import('src/writeData/containers/TelegrafPluginsPage')
)
export const FlowsIndex = lazy(() => import('src/flows/components/FlowsIndex'))
export const NotFound = lazy(() => import('src/shared/components/NotFound'))
export const UsersPage = lazy(() =>
  import('src/unity/components/users/UsersPage')
)
export const UsagePage = lazy(() => import('src/usage/UsagePage'))
export const BillingPage = lazy(() =>
  import('src/billing/components/BillingPage')
)
