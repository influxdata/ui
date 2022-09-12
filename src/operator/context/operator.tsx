// Libraries
import React, {FC, useCallback, useEffect, useState} from 'react'
import {useDispatch, useSelector} from 'react-redux'
import {useLocation} from 'react-router-dom'

// Utils
import {notify} from 'src/shared/actions/notifications'
import {
  getOperatorAccounts,
  getOperatorOrgs,
  getOperatorProviders,
  OperatorProvidersResponse,
} from 'src/client/unityRoutes'
import {getAccountsError, getOrgsError} from 'src/shared/copy/notifications'
import {getQuartzMe} from 'src/me/selectors'

// Types
import {
  AccountType,
  OperatorAccount,
  OperatorOrg,
  RemoteDataState,
} from 'src/types'

// Constants
import {OperatorRoutes} from 'src/operator/constants'

export type Props = {
  children: JSX.Element
}

export interface OperatorContextType {
  accounts: OperatorAccount[]
  accountTypes: AccountType[]
  setAccountTypes: (
    accountTypes: AccountType[] | ((prevState: AccountType[]) => AccountType[])
  ) => void
  handleGetAccounts: () => void
  handleGetOrgs: () => void
  handleGetProviders: () => void
  organizations: OperatorOrg[]
  pathname: string
  providerInfo: OperatorProvidersResponse
  searchTerm: string
  providers: string[]
  setProviders: (
    providers: string[] | ((prevState: string[]) => string[])
  ) => void
  regions: string[]
  setRegions: (regions: string[] | ((prevState: string[]) => string[])) => void
  setSearchTerm: (searchTerm?: string) => void
  status: RemoteDataState
  hasWritePermissions: boolean
}

export const DEFAULT_CONTEXT: OperatorContextType = {
  accounts: [],
  accountTypes: [],
  setAccountTypes: () => {},
  handleGetAccounts: () => {},
  handleGetOrgs: () => {},
  handleGetProviders: () => {},
  organizations: [],
  pathname: OperatorRoutes.default,
  providerInfo: {
    providers: [],
    regions: {},
  },
  searchTerm: '',
  providers: [],
  setProviders: () => {},
  regions: [],
  setRegions: () => {},
  setSearchTerm: () => {},
  status: RemoteDataState.NotStarted,
  hasWritePermissions: false,
}

export const OperatorContext =
  React.createContext<OperatorContextType>(DEFAULT_CONTEXT)

export const OperatorProvider: FC<Props> = React.memo(({children}) => {
  const [accounts, setAccounts] = useState<OperatorAccount[]>([])
  const [accountStatus, setAccountStatus] = useState(RemoteDataState.NotStarted)
  const [orgsStatus, setOrgsStatus] = useState(RemoteDataState.NotStarted)
  const [searchTerm, setSearchTerm] = useState('')
  const [accountTypes, setAccountTypes] = useState<AccountType[]>([])
  const [providers, setProviders] = useState<string[]>([])
  const [regions, setRegions] = useState<string[]>([])
  const [providerInfo, setProviderInfo] = useState<OperatorProvidersResponse>(
    DEFAULT_CONTEXT.providerInfo
  )
  const dispatch = useDispatch()
  const quartzMe = useSelector(getQuartzMe)

  const [organizations, setOrganizations] = useState<OperatorOrg[]>([])

  const handleGetAccounts = useCallback(async () => {
    try {
      setAccountStatus(RemoteDataState.Loading)
      const resp = await getOperatorAccounts({
        query: {
          query: searchTerm,
          accountTypes,
        },
      })

      if (resp.status !== 200) {
        throw new Error(resp.data.message)
      }

      setAccountStatus(RemoteDataState.Done)
      setAccounts(resp.data)
    } catch (error) {
      setAccountStatus(RemoteDataState.Error)
      dispatch(notify(getAccountsError()))
      console.error({error})
    }
  }, [accountTypes, searchTerm, dispatch])

  const handleGetOrgs = useCallback(async () => {
    try {
      setOrgsStatus(RemoteDataState.Loading)
      const resp = await getOperatorOrgs({
        query: {
          query: searchTerm,
          accountTypes,
          providers,
          regions,
        },
      })

      if (resp.status !== 200) {
        throw new Error(resp.data.message)
      }

      setOrgsStatus(RemoteDataState.Done)
      setOrganizations(resp.data)
    } catch (error) {
      console.error({error})
      setOrgsStatus(RemoteDataState.Error)
      dispatch(notify(getOrgsError()))
    }
  }, [accountTypes, searchTerm, providers, regions, dispatch])

  const handleGetProviders = useCallback(async () => {
    try {
      const resp = await getOperatorProviders({})

      if (resp.status !== 200) {
        throw new Error(resp.data.message)
      }

      setProviderInfo(resp.data)
    } catch (error) {
      console.error({error})
    }
  }, [])

  const {pathname} = useLocation()

  useEffect(() => {
    switch (pathname) {
      case OperatorRoutes.accounts:
        handleGetAccounts()
        break
      case OperatorRoutes.default:
        handleGetAccounts()
        break
      case OperatorRoutes.organizations:
        handleGetProviders()
        handleGetOrgs()
        break
      default:
        return
    }
  }, [pathname, handleGetAccounts, handleGetOrgs, handleGetProviders])

  let status = RemoteDataState.Done

  const statuses = [accountStatus, orgsStatus]

  if (statuses.every(s => s === RemoteDataState.NotStarted)) {
    status = RemoteDataState.NotStarted
  } else if (statuses.includes(RemoteDataState.Error)) {
    status = RemoteDataState.Error
  } else if (statuses.includes(RemoteDataState.Loading)) {
    status = RemoteDataState.Loading
  }

  const hasWritePermissions =
    quartzMe.isOperator && quartzMe?.operatorRole === 'read-write'

  return (
    <OperatorContext.Provider
      value={{
        accounts,
        accountTypes,
        setAccountTypes,
        handleGetAccounts,
        handleGetOrgs,
        handleGetProviders,
        organizations,
        pathname,
        providerInfo,
        searchTerm,
        setSearchTerm,
        providers,
        setProviders,
        regions,
        setRegions,
        status,
        hasWritePermissions,
      }}
    >
      {children}
    </OperatorContext.Provider>
  )
})

export default OperatorProvider
