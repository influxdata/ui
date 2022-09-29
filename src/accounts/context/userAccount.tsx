// Libraries
import React, {FC, useCallback, useEffect, useState} from 'react'
import {useDispatch} from 'react-redux'

// Types
import {UserAccount} from 'src/client/unityRoutes'

// Notifications
import {notify} from 'src/shared/actions/notifications'
import {
  accountDefaultSettingError,
  accountDefaultSettingSuccess,
  accountRenameError,
  accountRenameSuccess,
} from 'src/shared/copy/notifications'

// Metrics
import {event} from 'src/cloud/utils/reporting'

// API
import {
  getUserAccounts,
  updateDefaultQuartzAccount,
  updateUserAccount,
} from 'src/identity/apis/auth'

// Utils
import {reportErrorThroughHoneyBadger} from 'src/shared/utils/errors'
import {setCurrentIdentityAccountName} from 'src/identity/actions/creators'

export type Props = {
  children: JSX.Element
}

interface SetDefaultAccountOptions {
  disablePopUps: boolean
}

export interface UserAccountContextType {
  userAccounts: UserAccount[]
  handleGetAccounts: () => void
  handleSetDefaultAccount: (
    newId: number,
    options?: SetDefaultAccountOptions
  ) => void
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

export const UserAccountContext =
  React.createContext<UserAccountContextType>(DEFAULT_CONTEXT)

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
      const accounts = await getUserAccounts()
      setUserAccounts(accounts)
      const defaultAcct = accounts.find(acct => acct.isDefault === true)
      if (typeof defaultAcct === 'object' && defaultAcct.hasOwnProperty('id')) {
        const defaultId = defaultAcct.id
        setDefaultAccountId(defaultId)
      }

      // isActive: true is for the currently logged in/active account
      const activeAcct = accounts.find(acct => acct.isActive === true)
      if (typeof activeAcct === 'object' && activeAcct.hasOwnProperty('id')) {
        const activeId = activeAcct.id
        setActiveAccountId(activeId)
      }
    } catch (error) {
      reportErrorThroughHoneyBadger(error, {
        name: 'failed to retrieve user account data',
      })
    }
  }, [setActiveAccountId, setDefaultAccountId])

  async function handleSetDefaultAccount(
    newDefaultAcctId: number,
    setDefaultAccountOptions?: SetDefaultAccountOptions
  ) {
    const accountName = getAccountNameById(newDefaultAcctId)

    try {
      await updateDefaultQuartzAccount(newDefaultAcctId)
      setDefaultAccountId(newDefaultAcctId)

      if (!setDefaultAccountOptions?.disablePopUps) {
        dispatch(notify(accountDefaultSettingSuccess(accountName)))
      }
    } catch (error) {
      if (!setDefaultAccountOptions?.disablePopUps) {
        dispatch(notify(accountDefaultSettingError(accountName)))
      } else {
        throw Error('Failed to update default account.')
      }
    }
  }

  const handleRenameActiveAccount = useCallback(
    async (accountId, newName) => {
      const activeAccount = userAccounts.find(acct => acct.isActive === true)
      try {
        const accountData = await updateUserAccount(accountId, newName)
        event('multiAccount.renameAccount')
        dispatch(setCurrentIdentityAccountName(accountData))
        dispatch(notify(accountRenameSuccess(activeAccount.name, newName)))

        const updatedAccounts = userAccounts.map(acct => {
          if (acct.id === activeAccount.id) {
            return {...acct, name: accountData.name}
          }

          return acct
        })
        setUserAccounts(updatedAccounts)
      } catch (error) {
        dispatch(notify(accountRenameError(activeAccount.name)))
        reportErrorThroughHoneyBadger(error, {
          name: 'error renaming user account',
          context: {
            accountID: activeAccount.id,
            accountName: activeAccount.name,
          },
        })
      }
    },
    [dispatch, userAccounts, setUserAccounts]
  )

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
