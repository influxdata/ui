// Libraries
import React, {FC, useCallback, useState} from 'react'
import {useDispatch} from 'react-redux'

// Utils
import {
  getOperatorOrgsLimits,
  getOperatorOrg,
  postOperatorOrgsReactivate,
  putOperatorOrgsLimits,
  patchOperatorOrgsMigrate,
} from 'src/client/unityRoutes'
import {notify} from 'src/shared/actions/notifications'
import {
  getOrgError,
  getLimitsError,
  updateLimitsError,
  updateLimitsSuccess,
  reactivateOrgError,
  reactivateOrgSuccess,
  migrateOrgError,
} from 'src/shared/copy/notifications'
import {toDisplayLimits} from 'src/operator/utils'

// Types
import {OperatorOrgLimits, OperatorOrg} from 'src/types'
import {RemoteDataState} from 'src/types'
import {useHistory} from 'react-router-dom'

export type Props = {
  children: JSX.Element
}

export interface OverlayContextType {
  limits: OperatorOrgLimits
  limitsStatus: RemoteDataState
  handleGetLimits: (id: string) => void
  handleGetOrg: (id: string) => void
  handleReactivateOrg: (id: string) => void
  handleUpdateLimits: (id: string, limits: OperatorOrgLimits) => void
  organization: OperatorOrg
  orgStatus: RemoteDataState
  reactivateOrgStatus: RemoteDataState
  setLimits: (_: OperatorOrgLimits) => void
  updateLimitStatus: RemoteDataState
  setMigrateOverlayVisible: (vis: boolean) => void
  migrateOverlayVisible: boolean
  migrateStatus: RemoteDataState
  handleMigrateOrg: (id: string, toAccountId: string) => void
}

export const DEFAULT_CONTEXT: OverlayContextType = {
  handleGetLimits: (_: string) => {},
  handleGetOrg: (_: string) => {},
  handleReactivateOrg: (_id: string) => {},
  handleUpdateLimits: (_id: string, _limits: OperatorOrgLimits) => {},
  limits: null,
  limitsStatus: RemoteDataState.NotStarted,
  organization: null,
  orgStatus: RemoteDataState.NotStarted,
  reactivateOrgStatus: RemoteDataState.NotStarted,
  setLimits: (_: OperatorOrgLimits) => {},
  updateLimitStatus: RemoteDataState.NotStarted,
  setMigrateOverlayVisible: (_: boolean) => {},
  migrateOverlayVisible: false,
  migrateStatus: RemoteDataState.NotStarted,
  handleMigrateOrg: (_id: string, _accountId: string) => {},
}

export const OverlayContext =
  React.createContext<OverlayContextType>(DEFAULT_CONTEXT)

export const OverlayProvider: FC<Props> = React.memo(({children}) => {
  const [limits, setLimits] = useState(null)
  const [limitsStatus, setLimitsStatus] = useState(RemoteDataState.NotStarted)
  const [reactivateOrgStatus, setReactivateOrgStatus] = useState(
    RemoteDataState.NotStarted
  )
  const [updateLimitStatus, setUpdateLimitStatus] = useState(
    RemoteDataState.NotStarted
  )
  const [orgStatus, setOrgStatus] = useState(RemoteDataState.NotStarted)
  const [migrateOverlayVisible, setMigrateOverlayVisible] = useState(false)
  const [migrateStatus, setMigrateStatus] = useState(RemoteDataState.NotStarted)

  const history = useHistory()
  const dispatch = useDispatch()

  const [organization, setOrganization] = useState(null)

  const handleGetLimits = useCallback(
    async (id: string) => {
      try {
        setLimitsStatus(RemoteDataState.Loading)
        const resp = await getOperatorOrgsLimits({orgId: id})

        if (resp.status !== 200) {
          setLimitsStatus(RemoteDataState.Error)
          throw new Error(resp.data.message)
        }

        setLimitsStatus(RemoteDataState.Done)
        const displayLimits = toDisplayLimits(resp.data)
        setLimits(displayLimits)
      } catch (error) {
        setLimitsStatus(RemoteDataState.Error)
        console.error({error})
        dispatch(notify(getLimitsError(id)))
      }
    },
    [dispatch]
  )

  const handleGetOrg = useCallback(
    async (id: string) => {
      try {
        setOrgStatus(RemoteDataState.Loading)
        const resp = await getOperatorOrg({orgId: id})

        if (resp.status !== 200) {
          setOrgStatus(RemoteDataState.Error)
          throw new Error(resp.data.message)
        }

        setOrgStatus(RemoteDataState.Done)
        setOrganization(resp.data)
      } catch (error) {
        setOrgStatus(RemoteDataState.Error)
        console.error({error})
        dispatch(notify(getOrgError(id)))
      }
    },
    [dispatch]
  )

  const handleReactivateOrg = useCallback(
    async (id: string) => {
      try {
        setReactivateOrgStatus(RemoteDataState.Loading)
        await postOperatorOrgsReactivate({orgId: id})
        setReactivateOrgStatus(RemoteDataState.Done)
        dispatch(notify(reactivateOrgSuccess(id)))
      } catch (error) {
        console.error(error)
        dispatch(notify(reactivateOrgError(id)))
      }
    },
    [dispatch]
  )

  const handleUpdateLimits = useCallback(
    async (id: string, updatedLimits: OperatorOrgLimits) => {
      try {
        setUpdateLimitStatus(RemoteDataState.Loading)
        await putOperatorOrgsLimits({orgId: id, data: updatedLimits})
        setUpdateLimitStatus(RemoteDataState.Done)
        dispatch(notify(updateLimitsSuccess(id)))
      } catch (error) {
        console.error({error})
        dispatch(notify(updateLimitsError(id)))
      }
    },
    [dispatch]
  )

  const handleMigrateOrg = useCallback(
    async (id: string, toAccountId: string) => {
      try {
        setMigrateStatus(RemoteDataState.Loading)
        const resp = await patchOperatorOrgsMigrate({
          orgId: id,
          toAccountId: toAccountId,
        })

        if (resp.status !== 200) {
          throw new Error(resp.data.message)
        }

        setMigrateOverlayVisible(false)
        setMigrateStatus(RemoteDataState.Done)
        history.push(`/operator/accounts/${toAccountId}`)
      } catch (error) {
        console.error({error})
        dispatch(notify(migrateOrgError(id, toAccountId)))
      }
    },
    [history, dispatch]
  )

  return (
    <OverlayContext.Provider
      value={{
        handleGetLimits,
        handleGetOrg,
        handleReactivateOrg,
        handleUpdateLimits,
        limits,
        limitsStatus,
        organization,
        orgStatus,
        reactivateOrgStatus,
        setLimits,
        updateLimitStatus,
        setMigrateOverlayVisible,
        migrateOverlayVisible,
        migrateStatus,
        handleMigrateOrg,
      }}
    >
      {children}
    </OverlayContext.Provider>
  )
})

export default OverlayProvider
