// Libraries
import React, {FC, useCallback, useEffect, useState} from 'react'
import {useDispatch} from 'react-redux'

// Types
import {Account as UserAccount} from 'src/client/unityRoutes'
import {
  accountDefaultSettingError,
  accountDefaultSettingSuccess,
  accountRenameError,
  accountRenameSuccess,
} from 'src/shared/copy/notifications'

// Utils
import {
  getAccounts,
  putAccountsDefault,
  patchAccount,
} from 'src/client/unityRoutes'

import {notify} from 'src/shared/actions/notifications'

// Metrics
import {event} from 'src/cloud/utils/reporting'

export type Props = {
  children: JSX.Element
}

export interface UserAccountContextType {
  userAccounts: UserAccount[]
  handleGetAccounts: () => void
  handleSetDefaultAccount: (newId: number) => void
  handleRenameActiveAccount: (accountId: number, newName: string) => void
  defaultAccountId: number
  activeAccountId: number
}

export const DEFAULT_CONTEXT: UserAccountContextType = {
  userAccounts: [],
  defaultAccountId: -1,
  activeAccountId: -1,
  handleGetAccounts: () => {},
  handleSetDefaultAccount: () => {},
  handleRenameActiveAccount: () => {},
}

export const UserAccountContext = React.createContext<UserAccountContextType>(
  DEFAULT_CONTEXT
)

export const UserAccountProvider: FC<Props> = React.memo(({children}) => {
  const [userAccounts, setUserAccounts] = useState<UserAccount[]>(null)
  const [defaultAccountId, setDefaultAccountId] = useState<number>(null)
  const [activeAccountId, setActiveAccountId] = useState<number>(null)

  const dispatch = useDispatch()

  /**
   * get the name of the account as specified by ID
   *
   * needed for the notifications, no need to
   * pass the name as an argument when all the data is here
   * */
  const getAccountNameById = id => {
    const selectedAcctArray = userAccounts.filter(account => account.id === id)
    // name is guaranteed to be there
    if (selectedAcctArray && selectedAcctArray.length) {
      return selectedAcctArray[0].name
    }
  }

  const handleGetAccounts = useCallback(async () => {
    try {
      const resp = await getAccounts({})
      if (resp.status !== 200) {
        // set user account status to error;...TODO
        throw new Error(resp.data.message)
      }
      const {data} = resp
      if (Array.isArray(data)) {
        setUserAccounts(data)

        const defaultAcctArray = data.filter(line => line.isDefault)
        if (defaultAcctArray && defaultAcctArray.length === 1) {
          const defaultId = defaultAcctArray[0].id
          setDefaultAccountId(defaultId)
        }

        // isActive: true is for the currently logged in/active account
        const activeAcctArray = data.filter(line => line.isActive)
        if (activeAcctArray && activeAcctArray.length === 1) {
          const activeId = activeAcctArray[0].id
          setActiveAccountId(activeId)
        }
      }
    } catch (error) {
      event('multiAccount.retrieveAccounts.error', {error})
    }
  }, [dispatch, defaultAccountId])

  async function handleSetDefaultAccount(newDefaultAcctId) {
    const accountName = getAccountNameById(newDefaultAcctId)

    try {
      const resp = await putAccountsDefault({data: {id: newDefaultAcctId}})
      setDefaultAccountId(newDefaultAcctId)

      if (resp.status !== 204) {
        dispatch(notify(accountDefaultSettingError(accountName)))
      } else {
        dispatch(notify(accountDefaultSettingSuccess(accountName)))
      }
    } catch (error) {
      dispatch(notify(accountDefaultSettingError(accountName)))
    }
  }

  async function handleRenameActiveAccount(accountId, newName) {
    const isActiveAcct = acct => acct.isActive
    const activeIndex = userAccounts.findIndex(isActiveAcct)
    const oldName = userAccounts[activeIndex].name

    try {
      const resp = await patchAccount({accountId, data: {name: newName}})

      if (resp.status !== 200) {
        dispatch(notify(accountRenameError(oldName)))
      } else {
        dispatch(notify(accountRenameSuccess(oldName, newName)))
        event('multiAccount.renameAccount')

        // change the name, and reset the active accts:
        userAccounts[activeIndex].name = newName
        setUserAccounts(userAccounts)
      }
    } catch (error) {
      dispatch(notify(accountRenameError(oldName)))
    }
  }

  useEffect(() => {
    handleGetAccounts()
  }, [handleGetAccounts, defaultAccountId, activeAccountId])

  return (
    <UserAccountContext.Provider
      value={{
        userAccounts,
        defaultAccountId,
        activeAccountId,
        handleGetAccounts,
        handleSetDefaultAccount,
        handleRenameActiveAccount,
      }}
    >
      {children}
    </UserAccountContext.Provider>
  )
})
