// Libraries
import React, {FC, useCallback, useEffect, useState} from 'react'

// Utils
import {getAccounts, getOrgs} from 'src/operator/api'

// Types
import {Account, Organizations} from 'src/types/operator'
import {RemoteDataState} from 'src/types'

export type Props = {
  children: JSX.Element
}

export interface OperatorContextType {
  accounts: Account[]
  activeTab: string
  handleGetAccounts: () => void
  handleGetOrgs: () => void
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
  const [activeTab, setActiveTab] = useState('organizations')
  const [accounts, setAccounts] = useState([])
  const [status, setStatus] = useState(RemoteDataState.NotStarted)
  const [searchTerm, setSearchTerm] = useState('')

  const [organizations, setOrganizations] = useState([])

  // TODO(ariel): might need to debounce
  const handleGetAccounts = useCallback(async () => {
    setStatus(RemoteDataState.Loading)
    const resp = await getAccounts(searchTerm)

    if (resp.status !== 200) {
      setStatus(RemoteDataState.Error)
      throw new Error(resp.data.message)
    }

    setStatus(RemoteDataState.Done)
    setAccounts(resp.data)
  }, [searchTerm])

  const handleGetOrgs = useCallback(async () => {
    setStatus(RemoteDataState.Loading)
    const resp = await getOrgs(searchTerm)

    if (resp.status !== 200) {
      setStatus(RemoteDataState.Error)
      throw new Error(resp.data.message)
    }

    setStatus(RemoteDataState.Done)
    setOrganizations(resp.data)
  }, [searchTerm])

  useEffect(() => {
    if (activeTab === 'organizations') {
      handleGetOrgs()
    } else {
      handleGetAccounts()
    }
  }, [activeTab, handleGetAccounts, handleGetOrgs])

  return (
    <OperatorContext.Provider
      value={{
        accounts,
        activeTab,
        handleGetAccounts,
        handleGetOrgs,
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
