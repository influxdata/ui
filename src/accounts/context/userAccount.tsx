// Libraries
import React, {FC, useCallback, useEffect, useState} from 'react'
import {useDispatch, useSelector} from 'react-redux'
import {cloneDeep} from 'lodash'

// Types
import {Account, UserAccount} from 'src/client/unityRoutes'

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
  fetchUserAccounts,
  fetchAccountDetails,
  updateDefaultQuartzAccount,
  updateUserAccount,
} from 'src/identity/apis/account'

// Selectors
import {selectCurrentIdentity} from 'src/identity/selectors'

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
  accountDetails: Account
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
  accountDetails: null,
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
  const [accountDetails, setAccountDetails] = useState<Account>(null)

  const {account} = useSelector(selectCurrentIdentity)

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
      const accounts = await fetchUserAccounts()
      setUserAccounts(accounts)
      const defaultAcct = accounts.find(acct => acct.isDefault === true)
      if (typeof defaultAcct === 'object' && defaultAcct.hasOwnProperty('id')) {
        const defaultId = defaultAcct.id
        setDefaultAccountId(defaultId)
      }

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
      const oldDefaultAcctId = defaultAccountId

      await updateDefaultQuartzAccount(newDefaultAcctId)

      const accountsClone = cloneDeep(userAccounts)

      accountsClone.forEach(account => {
        if (account.id === oldDefaultAcctId) {
          account.isDefault = false
        }
        if (account.id === newDefaultAcctId) {
          account.isDefault = true
        }
      })
      setDefaultAccountId(newDefaultAcctId)
      setUserAccounts(accountsClone)

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

  const handleGetAccountDetails = useCallback(async () => {
    try {
      const accountDetails = await fetchAccountDetails(account.id)
      setAccountDetails(accountDetails)
    } catch (error) {
      reportErrorThroughHoneyBadger(error, {
        name: 'failed to retrieve user account details',
      })
    }
  }, [account.id])

  useEffect(() => {
    handleGetAccounts()
    handleGetAccountDetails()
  }, [handleGetAccounts, handleGetAccountDetails])

  return (
    <UserAccountContext.Provider
      value={{
        accountDetails,
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
