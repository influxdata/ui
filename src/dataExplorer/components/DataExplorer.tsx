// Libraries
import React, {FC, useEffect} from 'react'
import {useDispatch, useSelector} from 'react-redux'

// Components
import TimeMachine from 'src/timeMachine/components/TimeMachine'
import LimitChecker from 'src/cloud/components/LimitChecker'

// Actions
import {setActiveTimeMachine} from 'src/timeMachine/actions'
import {setBuilderBucketIfExists} from 'src/timeMachine/actions/queryBuilder'

// Utils
import {HoverTimeProvider} from 'src/dashboards/utils/hoverTime'
import {queryBuilderFetcher} from 'src/timeMachine/apis/QueryBuilderFetcher'
import {readQueryParams} from 'src/shared/utils/queryParams'
import ErrorBoundary from 'src/shared/components/ErrorBoundary'

import {getActiveTimeMachine} from 'src/timeMachine/selectors'

import {usePersistReduxState} from 'src/shared/utils/reloadPersistState'
import {timeMachineReducer} from 'src/timeMachine/reducers'

const DataExplorer: FC = () => {
  const dispatch = useDispatch()
  const timeMachineState = useSelector(getActiveTimeMachine)
  useEffect(() => {
    const bucketQP = readQueryParams()['bucket']
    dispatch(setActiveTimeMachine('de'))
    queryBuilderFetcher.clearCache()
    dispatch(setBuilderBucketIfExists(bucketQP))
  }, [dispatch])

  // usePersistReduxState(timeMachineState, 'timeMachineState', dispatch, s =>
  //   setActiveTimeMachine('de', s)
  // )
  // const setReduxStateFromLocalStorage = () => {
  //   console.log('here')
  //   const fromLocalStorageState = JSON.parse(
  //     window.localStorage.getItem('timeMachineState')
  //   )

  //   console.log(fromLocalStorageState, 'hello')
  //   if (!fromLocalStorageState) {
  //     return null
  //   }

  //   // set the state in redux
  //   dispatch(setActiveTimeMachine('de', fromLocalStorageState))
  // }

  // useEffect(() => {
  //   const setLocalStorageWithReduxState = e => {
  //     e.preventDefault()
  //     window.localStorage.setItem(
  //       'timeMachineState',
  //       JSON.stringify(timeMachineState)
  //     )
  //     return undefined
  //     console.log('here')
  //   }
  //   window.onbeforeunload = setLocalStorageWithReduxState
  //   setReduxStateFromLocalStorage()
  //   return () => {
  //     window.localStorage.clear()
  //     window.removeEventListener('beforeunload', setLocalStorageWithReduxState)
  //   }
  // }, [timeMachineState])

  return (
    <ErrorBoundary>
      <LimitChecker>
        <div className="data-explorer">
          <HoverTimeProvider>
            <TimeMachine />
          </HoverTimeProvider>
        </div>
      </LimitChecker>
    </ErrorBoundary>
  )
}

export default DataExplorer
