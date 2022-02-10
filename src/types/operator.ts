export {
  OperatorAccount,
  OperatorAccounts,
  OperatorOrgLimits,
  Organization as OperatorOrg,
  Organizations,
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
