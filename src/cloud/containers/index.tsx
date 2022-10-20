import {lazy} from 'react'

export const OrganizationList = lazy(() =>
  import(
    'src/identity/components/OrganizationListTab/OrganizationListTabContainer'
  ).then(module => ({
    default: module.OrganizationListTabContainer,
  }))
)
