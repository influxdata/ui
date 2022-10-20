import {lazy} from 'react'

export const OrganizationList = lazy(() =>
  import(
    'src/identity/components/OrganizationListTab/OrganizationListTabContainer'
  ).then(module => ({
    default: module.OrganizationListTabContainer,
  }))
)

export const UserProfilePage = lazy(() =>
  import('src/identity/components/userprofile/UserProfilePage').then(
    module => ({default: module.UserProfilePage})
  )
)
