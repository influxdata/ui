// Libraries
import React, {FC, useCallback, useEffect, useState} from 'react'
import {useParams, useHistory} from 'react-router-dom'
import {useDispatch} from 'react-redux'

// Utils
import {
  deleteOperatorAccount,
  getOperatorAccount,
  deleteOperatorAccountsUser,
} from 'src/client/unityRoutes'
import {notify} from 'src/shared/actions/notifications'
import {
  getAccountError,
  deleteAccountError,
} from 'src/shared/copy/notifications'

// Types
import {OperatorAccount, OperatorOrg, RemoteDataState} from 'src/types'

export type Props = {
  children: JSX.Element
}

export interface AccountContextType {
  account: OperatorAccount
  accountStatus: RemoteDataState
  deleteStatus: RemoteDataState
  handleDeleteAccount: () => void
  handleGetAccount: () => void
  handleRemoveUserFromAccount: (id: string) => void
  organizations: OperatorOrg[]
  setVisible: (vis: boolean) => void
  visible: boolean
}

export const DEFAULT_CONTEXT: AccountContextType = {
  account: null,
  accountStatus: RemoteDataState.NotStarted,
  deleteStatus: RemoteDataState.NotStarted,
  handleDeleteAccount: () => {},
  handleGetAccount: () => {},
  handleRemoveUserFromAccount: (_: string) => {},
  organizations: null,
  setVisible: (_: boolean) => {},
  visible: false,
}

export const AccountContext = React.createContext<AccountContextType>(
  DEFAULT_CONTEXT
)

export const AccountProvider: FC<Props> = React.memo(({children}) => {
  const [account, setAccount] = useState<OperatorAccount>(null)
  const [organizations, setOrganizations] = useState<OperatorOrg[]>(null)
  const [visible, setVisible] = useState(false)
  const [accountStatus, setAccountStatus] = useState(RemoteDataState.NotStarted)
  const [deleteStatus, setDeleteStatus] = useState(RemoteDataState.NotStarted)

  const {accountID} = useParams<{accountID: string}>()
  const history = useHistory()
  const dispatch = useDispatch()

  const handleGetAccount = useCallback(async () => {
    try {
      setAccountStatus(RemoteDataState.Loading)
      const resp = await getOperatorAccount({accountId: accountID})

      if (resp.status !== 200) {
        setAccountStatus(RemoteDataState.Error)
        throw new Error(resp.data.message)
      }

      const {organizations}: {organizations: OperatorOrg[]} = resp.data

      setAccount(resp.data)
      setOrganizations(organizations)
      setAccountStatus(RemoteDataState.Done)
    } catch (error) {
      setAccountStatus(RemoteDataState.Error)
      console.error({error})
      dispatch(notify(getAccountError(accountID)))
    }
  }, [dispatch, accountID])

  useEffect(() => {
    handleGetAccount()
  }, [handleGetAccount, accountID])

  const handleDeleteAccount = useCallback(async () => {
    try {
      setDeleteStatus(RemoteDataState.Loading)
      const resp = await deleteOperatorAccount({accountId: accountID})
      if (resp.status !== 204) {
        throw new Error(resp.data.message)
      }
      setDeleteStatus(RemoteDataState.Done)
      history.push('/operator')
    } catch (error) {
      console.error({error})
      dispatch(notify(deleteAccountError(accountID)))
    }
  }, [dispatch, history, accountID])

  const handleRemoveUserFromAccount = useCallback(
    async (userID: string) => {
      try {
        setDeleteStatus(RemoteDataState.Loading)
        const resp = await deleteOperatorAccountsUser({
          accountId: accountID,
          userId: userID,
        })
        if (resp.status !== 204) {
          throw new Error(resp.data.message)
        }
        setDeleteStatus(RemoteDataState.Done)
      } catch (error) {
        console.error({error})
        dispatch(notify(deleteAccountError(accountID)))
      } finally {
        await handleGetAccount()
      }
    },
    [dispatch, handleGetAccount, accountID]
  )

  return (
    <AccountContext.Provider
      value={{
        account,
        accountStatus,
        deleteStatus,
        handleDeleteAccount,
        handleGetAccount,
        handleRemoveUserFromAccount,
        organizations,
        setVisible,
        visible,
      }}
    >
      {children}
    </AccountContext.Provider>
  )
})

export default AccountProvider
