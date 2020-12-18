// Libraries
import React, {FC, useCallback} from 'react'
import {useDispatch, useSelector} from 'react-redux'

// Components
import {ViewTypeDropdown} from 'src/visualization'

// Selectors
import {getActiveTimeMachine} from 'src/timeMachine/selectors'

// Types
import {AppState} from 'src/types'

// Actions
import {setType} from 'src/timeMachine/actions'

export const TimeMachineViewTypeDropdown: FC<{}> = () => {
  const dispatch = useDispatch()

  const viewType = useSelector((state: AppState) => {
    const {view} = getActiveTimeMachine(state)

    return view.properties.type
  })

  const updateType = useCallback(
    selectedType => {
      dispatch(setType(selectedType))
    },
    [dispatch]
  )

  return (
    <ViewTypeDropdown viewType={viewType} onUpdateType={updateType as any} />
  )
}

export default TimeMachineViewTypeDropdown
