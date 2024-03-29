// Libraries
import React, {FC, useEffect} from 'react'
import {useDispatch} from 'react-redux'

// Components
import TimeMachine from 'src/timeMachine/components/TimeMachine'
import LimitChecker from 'src/cloud/components/LimitChecker'

// Actions
import {setActiveTimeMachine} from 'src/timeMachine/actions'
import {setBuilderBucketIfExists} from 'src/timeMachine/actions/queryBuilderThunks'

// Utils
import {HoverTimeProvider} from 'src/dashboards/utils/hoverTime'
import {queryBuilderFetcher} from 'src/timeMachine/apis/QueryBuilderFetcher'
import ErrorBoundary from 'src/shared/components/ErrorBoundary'

const DataExplorer: FC = () => {
  const dispatch = useDispatch()

  useEffect(() => {
    const bucketQP = new URLSearchParams(window.location.search).get('bucket')
    dispatch(setActiveTimeMachine('de'))
    queryBuilderFetcher.clearCache()
    dispatch(setBuilderBucketIfExists(bucketQP))
  }, [dispatch])

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
