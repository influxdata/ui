// Libraries
import React, {FC, useCallback, useEffect, useState} from 'react'
import {useParams} from 'react-router-dom'
import {useDispatch} from 'react-redux'

// Utils
import {getOrgLimits, getOrgById, updateOrgLimits} from 'src/operator/api'
import {notify} from 'src/shared/actions/notifications'
import {
  getOrgError,
  getLimitsError,
  updateLimitsError,
  updateLimitsSuccess,
} from 'src/shared/copy/notifications'
import {toDisplayLimits} from 'src/operator/utils'

// Types
import {OrgLimits, Organization} from 'src/types/operator'
import {RemoteDataState} from 'src/types'

export type Props = {
  children: JSX.Element
}

export interface OverlayContextType {
  limits: OrgLimits
  limitsStatus: RemoteDataState
  handleGetLimits: (id: string) => void
  handleGetOrg: (id: string) => void
  handleUpdateLimits: (limits: OrgLimits) => void
  organization: Organization
  orgStatus: RemoteDataState
  setLimits: (_: OrgLimits) => void
  updateLimitStatus: RemoteDataState
}

export const DEFAULT_CONTEXT: OverlayContextType = {
  handleGetLimits: (_: string) => {},
  handleGetOrg: (_: string) => {},
  handleUpdateLimits: (_: OrgLimits) => {},
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
  const {orgID} = useParams()
  const dispatch = useDispatch()

  const [organization, setOrganization] = useState(null)

  const handleGetLimits = useCallback(
    async (id: string) => {
      try {
        setLimitsStatus(RemoteDataState.Loading)
        const resp = await getOrgLimits(id)

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

  useEffect(() => {
    handleGetLimits(orgID)
  }, [handleGetLimits, orgID])

  const handleGetOrg = useCallback(
    async (id: string) => {
      try {
        setOrgStatus(RemoteDataState.Loading)
        const resp = await getOrgById(id)

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

  useEffect(() => {
    handleGetOrg(orgID)
  }, [handleGetOrg, handleGetLimits, orgID])

  const handleUpdateLimits = useCallback(
    async (updatedLimits: OrgLimits) => {
      try {
        setUpdateLimitStatus(RemoteDataState.Loading)
        await updateOrgLimits(orgID, updatedLimits)
        setUpdateLimitStatus(RemoteDataState.Done)
        dispatch(notify(updateLimitsSuccess(orgID)))
      } catch (error) {
        console.error({error})
        dispatch(notify(updateLimitsError(orgID)))
      }
    },
    [dispatch, orgID]
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
