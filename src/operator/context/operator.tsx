// Libraries
import React, {FC, useCallback, useEffect, useState} from 'react'
import {useDispatch, useSelector} from 'react-redux'
import {useLocation} from 'react-router-dom'

// Utils
import {notify} from 'src/shared/actions/notifications'
import {getOperatorAccounts, getOperatorOrgs} from 'src/client/unityRoutes'
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
  setAccountTypes: (accountTypes: AccountType[]) => void
  handleGetAccounts: () => void
  handleGetOrgs: () => void
  organizations: OperatorOrg[]
  pathname: string
  searchTerm: string
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
  organizations: [],
  pathname: OperatorRoutes.default,
  searchTerm: '',
  setSearchTerm: () => {},
  status: RemoteDataState.NotStarted,
  hasWritePermissions: false,
}

export const OperatorContext = React.createContext<OperatorContextType>(
  DEFAULT_CONTEXT
)

export const OperatorProvider: FC<Props> = React.memo(({children}) => {
  const [accounts, setAccounts] = useState<OperatorAccount[]>([])
  const [accountStatus, setAccountStatus] = useState(RemoteDataState.NotStarted)
  const [orgsStatus, setOrgsStatus] = useState(RemoteDataState.NotStarted)
  const [searchTerm, setSearchTerm] = useState('')
  const [accountTypes, setAccountTypes] = useState<AccountType[]>([])
  const dispatch = useDispatch()
  const quartzMe = useSelector(getQuartzMe)

  const [organizations, setOrganizations] = useState<OperatorOrg[]>([])

  const handleGetAccounts = useCallback(async () => {
    try {
      setAccountStatus(RemoteDataState.Loading)
      const resp = await getOperatorAccounts({
        query: {
          query: searchTerm,
          accountTypes: accountTypes,
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
        query: {query: searchTerm, accountTypes: accountTypes},
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
  }, [accountTypes, searchTerm, dispatch])

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
        handleGetOrgs()
        break
      default:
        return
    }
  }, [pathname, handleGetAccounts, handleGetOrgs])

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
        organizations,
        pathname,
        searchTerm,
        setSearchTerm,
        status,
        hasWritePermissions,
      }}
    >
      {children}
    </OperatorContext.Provider>
  )
})

export default OperatorProvider
