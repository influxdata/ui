// Libraries
import React, {FC, useCallback, useEffect, useState} from 'react'
import {useParams, useHistory} from 'react-router-dom'
import {useDispatch} from 'react-redux'

// Utils
import {
  getAccountById,
  deleteAccountById,
  removeUserFromAccount,
} from 'src/operator/api'
import {notify} from 'src/shared/actions/notifications'
import {
  getAccountError,
  deleteAccountError,
} from 'src/shared/copy/notifications'

// Types
import {Account} from 'src/types/operator'
import {RemoteDataState} from 'src/types'

export type Props = {
  children: JSX.Element
}

export interface AccountContextType {
  account: Account
  accountStatus: RemoteDataState
  deleteStatus: RemoteDataState
  handleDeleteAccount: () => void
  handleGetAccount: () => void
  handleRemoveUserFromAccount: (id: string) => void
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
  setVisible: (_: boolean) => {},
  visible: false,
}

export const AccountContext = React.createContext<AccountContextType>(
  DEFAULT_CONTEXT
)

export const AccountProvider: FC<Props> = React.memo(({children}) => {
  const [account, setAccount] = useState(null)
  const [visible, setVisible] = useState(false)
  const [accountStatus, setAccountStatus] = useState(RemoteDataState.NotStarted)
  const [deleteStatus, setDeleteStatus] = useState(RemoteDataState.NotStarted)

  const {accountID} = useParams()
  const history = useHistory()
  const dispatch = useDispatch()

  const handleGetAccount = useCallback(async () => {
    try {
      setAccountStatus(RemoteDataState.Loading)
      const resp = await getAccountById(accountID)

      if (resp.status !== 200) {
        setAccountStatus(RemoteDataState.Error)
        throw new Error(resp.data.message)
      }

      setAccount(resp.data)
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
      const resp = await deleteAccountById(accountID)
      if (resp.status !== 204) {
        throw new Error(resp.data.message)
      }
      setDeleteStatus(RemoteDataState.Done)
      history.push('/operator')
    } catch (error) {
      console.error({error})
      dispatch(notify(deleteAccountError(accountID)))
    }
  }, [dispatch]) // eslint-disable-line react-hooks/exhaustive-deps

  const handleRemoveUserFromAccount = useCallback(
    async (userID: string) => {
      try {
        setDeleteStatus(RemoteDataState.Loading)
        const resp = await removeUserFromAccount(accountID, userID)
        if (resp.status !== 204) {
          throw new Error(resp.data.message)
        }
        setDeleteStatus(RemoteDataState.Done)
        history.push('/operator')
      } catch (error) {
        console.error({error})
        dispatch(notify(deleteAccountError(accountID)))
      } finally {
        await handleGetAccount()
      }
    },
    [dispatch] // eslint-disable-line react-hooks/exhaustive-deps
  )

  return (
    <AccountContext.Provider
      value={{
        account,
        accountStatus,
        handleDeleteAccount,
        handleGetAccount,
        handleRemoveUserFromAccount,
        deleteStatus,
        setVisible,
        visible,
      }}
    >
      {children}
    </AccountContext.Provider>
  )
})

export default AccountProvider
