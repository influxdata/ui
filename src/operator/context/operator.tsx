// Libraries
import React, {FC, useCallback, useEffect, useState} from 'react'
import {useDispatch} from 'react-redux'

// Utils
import {notify} from 'src/shared/actions/notifications'
import {getMe, getAccounts, getOrgs} from 'src/operator/api'
import {getAccountsError, getOrgsError} from 'src/shared/copy/notifications'

// Types
import {Account, Me, Organizations} from 'src/types/operator'
import {RemoteDataState} from 'src/types'

export type Props = {
  children: JSX.Element
}

export interface OperatorContextType {
  accounts: Account[]
  activeTab: string
  handleGetAccounts: () => void
  handleGetOrgs: () => void
  operator: Me
  operatorStatus: RemoteDataState
  organizations: Organizations
  searchTerm: string
  setActiveTab: (tab: string) => void
  setSearchTerm: (searchTerm?: string) => void
  status: RemoteDataState
}

export const DEFAULT_CONTEXT: OperatorContextType = {
  accounts: [],
  activeTab: 'organizations',
  handleGetAccounts: () => {},
  handleGetOrgs: () => {},
  operator: null,
  operatorStatus: RemoteDataState.NotStarted,
  organizations: [],
  searchTerm: '',
  setActiveTab: () => {},
  setSearchTerm: () => {},
  status: RemoteDataState.NotStarted,
}

export const OperatorContext = React.createContext<OperatorContextType>(
  DEFAULT_CONTEXT
)

export const OperatorProvider: FC<Props> = React.memo(({children}) => {
  const [activeTab, setActiveTab] = useState('accounts')
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

  // TODO(ariel): might need to debounce
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

  useEffect(() => {
    if (activeTab === 'organizations') {
      handleGetOrgs()
    } else {
      handleGetAccounts()
    }
  }, [activeTab, handleGetAccounts, handleGetOrgs])

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
        activeTab,
        handleGetAccounts,
        handleGetOrgs,
        operator,
        operatorStatus,
        organizations,
        searchTerm,
        setActiveTab,
        setSearchTerm,
        status,
      }}
    >
      {children}
    </OperatorContext.Provider>
  )
})

export default OperatorProvider
