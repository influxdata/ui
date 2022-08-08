// Libraries
import React, {FC, useCallback, useEffect, useState} from 'react'
import {useParams, useHistory} from 'react-router-dom'
import {useDispatch} from 'react-redux'

// Utils
import {
  patchOperatorAccountsConvert,
  deleteOperatorAccount,
  getOperatorAccount,
} from 'src/client/unityRoutes'
import {notify} from 'src/shared/actions/notifications'
import {
  getAccountError,
  convertAccountError,
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
  convertStatus: RemoteDataState
  deleteStatus: RemoteDataState
  handleConvertAccountToContract: (contractStartDate: string) => void
  handleDeleteAccount: () => void
  handleGetAccount: () => void
  organizations: OperatorOrg[]
  setConvertToContractOverlayVisible: (vis: boolean) => void
  convertToContractOverlayVisible: boolean
  setDeleteOverlayVisible: (vis: boolean) => void
  deleteOverlayVisible: boolean
}

export const DEFAULT_CONTEXT: AccountContextType = {
  account: null,
  accountStatus: RemoteDataState.NotStarted,
  convertStatus: RemoteDataState.NotStarted,
  deleteStatus: RemoteDataState.NotStarted,
  handleConvertAccountToContract: () => {},
  handleDeleteAccount: () => {},
  handleGetAccount: () => {},
  organizations: null,
  setConvertToContractOverlayVisible: (_: boolean) => {},
  convertToContractOverlayVisible: false,
  setDeleteOverlayVisible: (_: boolean) => {},
  deleteOverlayVisible: false,
}

export const AccountContext = React.createContext<AccountContextType>(
  DEFAULT_CONTEXT
)

export const AccountProvider: FC<Props> = React.memo(({children}) => {
  const [account, setAccount] = useState<OperatorAccount>(null)
  const [organizations, setOrganizations] = useState<OperatorOrg[]>(null)
  const [
    convertToContractOverlayVisible,
    setConvertToContractOverlayVisible,
  ] = useState(false)
  const [deleteOverlayVisible, setDeleteOverlayVisible] = useState(false)
  const [accountStatus, setAccountStatus] = useState(RemoteDataState.NotStarted)
  const [convertStatus, setConvertStatus] = useState(RemoteDataState.NotStarted)
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

  const handleConvertAccountToContract = useCallback(
    async contractStartDate => {
      try {
        setConvertStatus(RemoteDataState.Loading)
        const resp = await patchOperatorAccountsConvert({
          accountId: accountID,
          data: {contractStartDate},
        })
        if (resp.status !== 200) {
          throw new Error(resp.data.message)
        }
        setConvertStatus(RemoteDataState.Done)
      } catch {
        setConvertStatus(RemoteDataState.Error)
        dispatch(notify(convertAccountError(accountID)))
      } finally {
        await handleGetAccount()
      }
    },
    [dispatch, handleGetAccount, accountID]
  )

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

  return (
    <AccountContext.Provider
      value={{
        account,
        accountStatus,
        convertStatus,
        deleteStatus,
        handleConvertAccountToContract,
        handleDeleteAccount,
        handleGetAccount,
        organizations,
        setConvertToContractOverlayVisible,
        convertToContractOverlayVisible,
        setDeleteOverlayVisible,
        deleteOverlayVisible,
      }}
    >
      {children}
    </AccountContext.Provider>
  )
})

export default AccountProvider
