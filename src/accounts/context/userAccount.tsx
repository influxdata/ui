// Libraries
import React, {FC, useCallback, useEffect, useState} from 'react'
// import {useParams, useHistory} from 'react-router-dom'
import {useDispatch} from 'react-redux'

// Types
import {Account as UserAccount} from 'src/client/unityRoutes'

// Utils
import {getAccounts} from 'src/client/unityRoutes'

export type Props = {
  children: JSX.Element
}

export interface UserAccountContextType {
  userAccounts: UserAccount[]
  handleGetAccounts: () => void
  setDefaultAccountId: (id: number) => void
  defaultAccountId: number
  activeAccountId: number
}

// isActive: true is for the currently logged in/active account

export const DEFAULT_CONTEXT: UserAccountContextType = {
  userAccounts: [],
  defaultAccountId: -1,
  activeAccountId: -1,
  handleGetAccounts: () => {},
  setDefaultAccountId: (id: number) => {
    console.log('would set id here....', id)
  },
}

export const UserAccountContext = React.createContext<UserAccountContextType>(
  DEFAULT_CONTEXT
)

//todo:  put in dependency array:  whenever the default account changes, should redo the call.

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
      //console.log('got the data response!', resp.data)
      const {data} = resp
      if (Array.isArray(data)) {
        setUserAccounts(data)

        const defaultAcctArray = data.filter(line => line.isDefault)
        if (defaultAcctArray && defaultAcctArray.length === 1) {
          const defaultId = defaultAcctArray[0].id
          //console.log('got the default id....', defaultId)
          setDefaultAccountId(defaultId)
        }

        const activeAcctArray = data.filter(line => line.isActive)
        if (activeAcctArray && activeAcctArray.length === 1) {
          const activeId = activeAcctArray[0].id
          setActiveAccountId(activeId)
        }
      }
    } catch (error) {
      console.log('caught error...', error)
    }
  }, [dispatch])

  useEffect(() => {
    handleGetAccounts()
  }, [handleGetAccounts, defaultAccountId, activeAccountId])

  return (
    <UserAccountContext.Provider
      value={{
        userAccounts,
        defaultAccountId,
        activeAccountId,
        setDefaultAccountId,
        handleGetAccounts,
      }}
    >
      {children}
    </UserAccountContext.Provider>
  )
})

export default UserAccountProvider
