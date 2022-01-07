// Libraries
import React, {FC, useCallback, useEffect, useState} from 'react'
import {useDispatch} from 'react-redux'

// Types
import {Account as UserAccount} from 'src/client/unityRoutes'

// Utils
import {getAccounts, putAccountsDefault} from 'src/client/unityRoutes'

// Metrics
import {event} from 'src/cloud/utils/reporting'

export type Props = {
  children: JSX.Element
}

export interface UserAccountContextType {
  userAccounts: UserAccount[]
  handleGetAccounts: () => void

  defaultAccountId: number
  activeAccountId: number
}
//   todo: add to above when implementing:
//    setDefaultAccountId: (id: number) => void

export const DEFAULT_CONTEXT: UserAccountContextType = {
  userAccounts: [],
  defaultAccountId: -1,
  activeAccountId: -1,
  handleGetAccounts: () => {},
}

export const UserAccountContext = React.createContext<UserAccountContextType>(
  DEFAULT_CONTEXT
)

// todo:  put in dependency array:  whenever the default account changes, should redo the call.
// put this in *after* the ability to change the default account has been added

export const UserAccountProvider: FC<Props> = React.memo(({children}) => {
  const [userAccounts, setUserAccounts] = useState<UserAccount[]>(null)
  const [defaultAccountId, setDefaultAccountId] = useState<number>(null)
  const [activeAccountId, setActiveAccountId] = useState<number>(null)

  const dispatch = useDispatch()

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
  }, [dispatch])


  async function handleSetDefaultAccount(newDefaultAcctId){
    try {
      const resp = await putAccountsDefault({data:{id:newDefaultAcctId}})

      if (resp.status !== 204) {
        console.error('arghh!!!! setting default didn not work :(')
      }
    } catch(error){
      console.log('caught error here while trying to set the default acct.....')
    }
  }


  useEffect(() => {
    handleGetAccounts()
  }, [handleGetAccounts, defaultAccountId, activeAccountId])

  // todo: add to the value object when restoring/doing the default account setting:
  //         setDefaultAccountId,
  return (
    <UserAccountContext.Provider
      value={{
        userAccounts,
        defaultAccountId,
        activeAccountId,
        handleGetAccounts,
      }}
    >
      {children}
    </UserAccountContext.Provider>
  )
})
