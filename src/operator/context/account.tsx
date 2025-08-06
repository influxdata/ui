// Libraries
import React, {FC, useCallback, useEffect, useState} from 'react'
import {useParams, useHistory} from 'react-router-dom'
import {useDispatch} from 'react-redux'

// Utils
import {
  patchOperatorAccountsConvert,
  patchOperatorAccountsReactivate,
  deleteOperatorAccount,
  getOperatorAccount,
  patchOperatorAccountsMigrate,
} from 'src/client/unityRoutes'
import {notify} from 'src/shared/actions/notifications'
import {
  getAccountError,
  convertAccountError,
  deleteAccountError,
  reactivateAccountError,
  migrateAccountError,
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
  migrateStatus: RemoteDataState
  reactivateStatus: RemoteDataState
  handleConvertAccountToContract: (contractStartDate: string) => void
  handleDeleteAccount: () => void
  handleGetAccount: () => void
  handleMigrateOrgs: (toAccountId: string) => void
  handleReactivateAccount: () => void
  organizations: OperatorOrg[]
  setConvertToContractOverlayVisible: (vis: boolean) => void
  convertToContractOverlayVisible: boolean
  setCancelOverlayVisible: (vis: boolean) => void
  cancelOverlayVisible: boolean
  setDeleteOverlayVisible: (vis: boolean) => void
  deleteOverlayVisible: boolean
  setMigrateOverlayVisible: (vis: boolean) => void
  migrateOverlayVisible: boolean
  setReactivateOverlayVisible: (vis: boolean) => void
  reactivateOverlayVisible: boolean
}

export const DEFAULT_CONTEXT: AccountContextType = {
  account: null,
  accountStatus: RemoteDataState.NotStarted,
  convertStatus: RemoteDataState.NotStarted,
  deleteStatus: RemoteDataState.NotStarted,
  migrateStatus: RemoteDataState.NotStarted,
  reactivateStatus: RemoteDataState.NotStarted,
  handleConvertAccountToContract: () => {},
  handleDeleteAccount: () => {},
  handleGetAccount: () => {},
  handleMigrateOrgs: (_: string) => {},
  handleReactivateAccount: () => {},
  organizations: null,
  setConvertToContractOverlayVisible: (_: boolean) => {},
  convertToContractOverlayVisible: false,
  setCancelOverlayVisible: (_: boolean) => {},
  setDeleteOverlayVisible: (_: boolean) => {},
  setMigrateOverlayVisible: (_: boolean) => {},
  setReactivateOverlayVisible: (_: boolean) => {},
  cancelOverlayVisible: false,
  deleteOverlayVisible: false,
  migrateOverlayVisible: false,
  reactivateOverlayVisible: false,
}

export const AccountContext =
  React.createContext<AccountContextType>(DEFAULT_CONTEXT)

export const AccountProvider: FC<Props> = React.memo(({children}) => {
  const [account, setAccount] = useState<OperatorAccount>(null)
  const [organizations, setOrganizations] = useState<OperatorOrg[]>(null)
  const [convertToContractOverlayVisible, setConvertToContractOverlayVisible] =
    useState(false)
  const [cancelOverlayVisible, setCancelOverlayVisible] = useState(false)
  const [deleteOverlayVisible, setDeleteOverlayVisible] = useState(false)
  const [migrateOverlayVisible, setMigrateOverlayVisible] = useState(false)
  const [reactivateOverlayVisible, setReactivateOverlayVisible] =
    useState(false)
  const [accountStatus, setAccountStatus] = useState(RemoteDataState.NotStarted)
  const [convertStatus, setConvertStatus] = useState(RemoteDataState.NotStarted)
  const [deleteStatus, setDeleteStatus] = useState(RemoteDataState.NotStarted)
  const [migrateStatus, setMigrateStatus] = useState(RemoteDataState.NotStarted)
  const [reactivateStatus, setReactivateStatus] = useState(
    RemoteDataState.NotStarted
  )

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

  const handleReactivateAccount = useCallback(async () => {
    try {
      setReactivateStatus(RemoteDataState.Loading)
      const resp = await patchOperatorAccountsReactivate({accountId: accountID})
      if (resp.status !== 200) {
        throw new Error(resp.data.message)
      }
      setReactivateStatus(RemoteDataState.Done)
      history.push('/operator')
    } catch (error) {
      console.error({error})
      dispatch(notify(reactivateAccountError(accountID)))
    }
  }, [dispatch, history, accountID])

  const handleMigrateOrgs = useCallback(
    async (toAccountId: string) => {
      try {
        setMigrateStatus(RemoteDataState.Loading)
        const resp = await patchOperatorAccountsMigrate({
          fromAccountId: accountID,
          toAccountId: toAccountId,
        })

        if (resp.status !== 200) {
          throw new Error(resp.data.message)
        }

        setMigrateStatus(RemoteDataState.Done)
        setMigrateOverlayVisible(false)
        history.push(`/operator/accounts/${toAccountId}`)
      } catch (error) {
        console.error({error})
        dispatch(notify(migrateAccountError(accountID)))
      }
    },
    [dispatch, history, accountID]
  )

  return (
    <AccountContext.Provider
      value={{
        account,
        accountStatus,
        convertStatus,
        deleteStatus,
        migrateStatus,
        reactivateStatus,
        handleConvertAccountToContract,
        handleDeleteAccount,
        handleGetAccount,
        handleMigrateOrgs,
        handleReactivateAccount,
        organizations,
        setConvertToContractOverlayVisible,
        convertToContractOverlayVisible,
        setCancelOverlayVisible,
        cancelOverlayVisible,
        setDeleteOverlayVisible,
        deleteOverlayVisible,
        setMigrateOverlayVisible,
        migrateOverlayVisible,
        setReactivateOverlayVisible,
        reactivateOverlayVisible,
      }}
    >
      {children}
    </AccountContext.Provider>
  )
})

export default AccountProvider
