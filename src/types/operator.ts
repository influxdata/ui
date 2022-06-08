export {
  OperatorAccount,
  OperatorAccounts,
  OperatorOrgLimits,
  OperatorOrganization as OperatorOrg,
  OperatorOrganizations as OperatorOrgs,
  OperatorProviders,
  OperatorRegions,
  OrgLimits,
  User as OperatorUser,
} from 'src/client/unityRoutes'

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
