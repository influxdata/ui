// Libraries
import React, {FC, useCallback, useState} from 'react'
import {useDispatch} from 'react-redux'

// Utils
import {
  getOperatorOrgsLimits,
  getOperatorOrg,
  putOperatorOrgsLimits,
} from 'src/client/unityRoutes'
import {notify} from 'src/shared/actions/notifications'
import {
  getOrgError,
  getLimitsError,
  updateLimitsError,
  updateLimitsSuccess,
} from 'src/shared/copy/notifications'
import {toDisplayLimits} from 'src/operator/utils'

// Types
import {OrgLimits, OperatorOrg} from 'src/types'
import {RemoteDataState} from 'src/types'

export type Props = {
  children: JSX.Element
}

export interface OverlayContextType {
  limits: OrgLimits
  limitsStatus: RemoteDataState
  handleGetLimits: (id: string) => void
  handleGetOrg: (id: string) => void
  handleUpdateLimits: (id: string, limits: OrgLimits) => void
  organization: OperatorOrg
  orgStatus: RemoteDataState
  setLimits: (_: OrgLimits) => void
  updateLimitStatus: RemoteDataState
}

export const DEFAULT_CONTEXT: OverlayContextType = {
  handleGetLimits: (_: string) => {},
  handleGetOrg: (_: string) => {},
  handleUpdateLimits: (_id: string, _limits: OrgLimits) => {},
  limits: null,
  limitsStatus: RemoteDataState.NotStarted,
  organization: null,
  orgStatus: RemoteDataState.NotStarted,
  setLimits: (_: OrgLimits) => {},
  updateLimitStatus: RemoteDataState.NotStarted,
}

export const OverlayContext = React.createContext<OverlayContextType>(
  DEFAULT_CONTEXT
)

export const OverlayProvider: FC<Props> = React.memo(({children}) => {
  const [limits, setLimits] = useState(null)
  const [limitsStatus, setLimitsStatus] = useState(RemoteDataState.NotStarted)
  const [updateLimitStatus, setUpdateLimitStatus] = useState(
    RemoteDataState.NotStarted
  )
  const [orgStatus, setOrgStatus] = useState(RemoteDataState.NotStarted)

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
        setLimits(resp.data)
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

  const handleUpdateLimits = useCallback(
    async (id: string, updatedLimits: OrgLimits) => {
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

  return (
    <OverlayContext.Provider
      value={{
        handleGetLimits,
        handleGetOrg,
        handleUpdateLimits,
        limits,
        limitsStatus,
        organization,
        orgStatus,
        setLimits,
        updateLimitStatus,
      }}
    >
      {children}
    </OverlayContext.Provider>
  )
})

export default OverlayProvider
