// Libraries
import React, {FC, useEffect, useCallback} from 'react'
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

import {getStore} from 'src/store/configureStore'
import {isFlagEnabled} from 'src/shared/utils/featureFlag'
;(() => {
  if (isFlagEnabled('persistRefresh')) {
    const fromLocalStorageState = JSON.parse(
      window.localStorage.getItem('timeMachineState')
    )

    if (!fromLocalStorageState) {
      return null
    }

    const store = getStore()
    // set the state in redux
    store.dispatch(setActiveTimeMachine('de', fromLocalStorageState))
  }
})()

const DataExplorer: FC = () => {
  const dispatch = useDispatch()
  const timeMachineState = useSelector(getActiveTimeMachine)
  useEffect(() => {
    const bucketQP = readQueryParams()['bucket']
    dispatch(setActiveTimeMachine('de'))
    queryBuilderFetcher.clearCache()
    dispatch(setBuilderBucketIfExists(bucketQP))
  }, [dispatch])

  const setLocalStorageWithReduxState = useCallback(() => {
    const {
      queryBuilder: _a,
      queryResults: _b,
      ...timeMachineToSave
    } = timeMachineState

    window.localStorage.setItem(
      'timeMachineState',
      JSON.stringify(timeMachineToSave)
    )
  }, [timeMachineState])

  useEffect(() => {
    if (isFlagEnabled('persistRefresh')) {
      setLocalStorageWithReduxState()
    }
  }, [timeMachineState, setLocalStorageWithReduxState])

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
