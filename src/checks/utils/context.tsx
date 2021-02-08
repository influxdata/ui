import React, {FC, useCallback, useState} from 'react'
import {useSelector, useDispatch} from 'react-redux'
import {updateThresholds} from 'src/alerting/actions/alertBuilder'
import {getByID} from 'src/resources/selectors'

import {
  AppState,
  Check,
  CheckType,
  DashboardQuery,
  ResourceType,
  StatusRow,
  Threshold,
} from 'src/types'

export interface CheckContextType {
  id: string
  type: CheckType
  query: DashboardQuery

  statuses: StatusRow[][]
  thresholds: Threshold[]

  updateStatuses: (statuses: StatusRow[][]) => void
  updateThresholds: (thresholds: Threshold[]) => void
}

export const CheckContext = React.createContext<CheckContextType>({
  id: '',
  type: 'custom',
  query: null,

  statuses: [],
  thresholds: [],

  updateStatuses: () => {},
  updateThresholds: () => {},
})

interface ProviderProps {
  id: string
}

export const AlertProvider: FC = ({children}) => {
  const {type, thresholds} = useSelector((state: AppState) => {
    return state.alertBuilder
  })
  const [statuses, setStatuses] = useState([])

  return (
    <CheckContext.Provider
      value={{
        id: 'new',
        type,
        query: null,

        statuses: statuses,
        thresholds,

        updateStatuses: setStatuses,
        updateThresholds: () => {},
      }}
    >
      {children}
    </CheckContext.Provider>
  )
}

const CheckProvider: FC<ProviderProps> = ({id, children}) => {
  const dispatch = useDispatch()
  const check = useSelector((state: AppState) => {
    return getByID<Check>(state, ResourceType.Checks, id)
  })
  const [statuses, setStatuses] = useState([])

  const update = useCallback(
    (thresholds: Threshold[]) => {
      dispatch(updateThresholds(thresholds))
    },
    [dispatch]
  )

  return (
    <CheckContext.Provider
      value={{
        id: id,
        type: check.type,
        query: check.query,

        statuses: statuses,
        thresholds: check.type === 'threshold' ? check.thresholds : [],

        updateStatuses: setStatuses,
        updateThresholds: update,
      }}
    >
      {children}
    </CheckContext.Provider>
  )
}

export default CheckProvider
