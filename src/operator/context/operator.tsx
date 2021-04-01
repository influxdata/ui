// Libraries
import React, {FC, useCallback, useEffect, useState} from 'react'
import {useDispatch} from 'react-redux'
import {useLocation} from 'react-router-dom'

// Utils
import {notify} from 'src/shared/actions/notifications'
import {getMe, getAccounts, getOrgs} from 'src/operator/api'
import {getAccountsError, getOrgsError} from 'src/shared/copy/notifications'

// Types
import {Account, Me, Organization} from 'src/types/operator'
import {RemoteDataState} from 'src/types'
import {OperatorRoutes} from 'src/operator/constants'

export type Props = {
  children: JSX.Element
}

export interface OperatorContextType {
  accounts: Account[]
  handleGetAccounts: () => void
  handleGetOrgs: () => void
  operator: Me
  operatorStatus: RemoteDataState
  organizations: Organization[]
  pathname: string
  searchTerm: string
  setSearchTerm: (searchTerm?: string) => void
  status: RemoteDataState
}

export const DEFAULT_CONTEXT: OperatorContextType = {
  accounts: [],
  handleGetAccounts: () => {},
  handleGetOrgs: () => {},
  operator: null,
  operatorStatus: RemoteDataState.NotStarted,
  organizations: [],
  pathname: OperatorRoutes.default,
  searchTerm: '',
  setSearchTerm: () => {},
  status: RemoteDataState.NotStarted,
}

export const OperatorContext = React.createContext<OperatorContextType>(
  DEFAULT_CONTEXT
)

export const OperatorProvider: FC<Props> = React.memo(({children}) => {
  const [accounts, setAccounts] = useState([])
  const [operator, setOperator] = useState(null)
  const [accountStatus, setAccountStatus] = useState(RemoteDataState.NotStarted)
  const [orgsStatus, setOrgsStatus] = useState(RemoteDataState.NotStarted)
  const [operatorStatus, setOperatorStatus] = useState(
    RemoteDataState.NotStarted
  )
  const [searchTerm, setSearchTerm] = useState('')
  const dispatch = useDispatch()

  const [organizations, setOrganizations] = useState([])

  const handleGetAccounts = useCallback(async () => {
    try {
      setAccountStatus(RemoteDataState.Loading)
      const resp = await getAccounts(searchTerm)

      if (resp.status !== 200) {
        setAccountStatus(RemoteDataState.Error)
        throw new Error(resp.data.message)
      }

      setAccountStatus(RemoteDataState.Done)
      setAccounts(resp.data)
    } catch (error) {
      setAccountStatus(RemoteDataState.Error)
      dispatch(notify(getAccountsError()))
      console.error({error})
    }
  }, [searchTerm, dispatch])

  const handleGetOrgs = useCallback(async () => {
    try {
      setOrgsStatus(RemoteDataState.Loading)
      const resp = await getOrgs(searchTerm)

      if (resp.status !== 200) {
        setOrgsStatus(RemoteDataState.Error)
        throw new Error(resp.data.message)
      }

      setOrgsStatus(RemoteDataState.Done)
      setOrganizations(resp.data)
    } catch (error) {
      console.error({error})
      setOrgsStatus(RemoteDataState.Error)
      dispatch(notify(getOrgsError()))
    }
  }, [searchTerm, dispatch])

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

  const handleGetMe = useCallback(async () => {
    try {
      setOperatorStatus(RemoteDataState.Loading)
      const resp = await getMe()

      if (resp.status !== 200) {
        setOperatorStatus(RemoteDataState.Error)
        throw new Error(resp.data.message)
      }

      setOperatorStatus(RemoteDataState.Done)
      setOperator(resp.data)
    } catch (error) {
      console.error({error})
      setOperatorStatus(RemoteDataState.Error)
      dispatch(notify(getOrgsError()))
    }
  }, [dispatch])

  useEffect(() => {
    handleGetMe()
  }, [handleGetMe])

  let status = RemoteDataState.Done

  const statuses = [accountStatus, orgsStatus]

  if (statuses.every(s => s === RemoteDataState.NotStarted)) {
    status = RemoteDataState.NotStarted
  } else if (statuses.includes(RemoteDataState.Error)) {
    status = RemoteDataState.Error
  } else if (statuses.includes(RemoteDataState.Loading)) {
    status = RemoteDataState.Loading
  }

  return (
    <OperatorContext.Provider
      value={{
        accounts,
        handleGetAccounts,
        handleGetOrgs,
        operator,
        operatorStatus,
        organizations,
        pathname,
        searchTerm,
        setSearchTerm,
        status,
      }}
    >
      {children}
    </OperatorContext.Provider>
  )
})

export default OperatorProvider
