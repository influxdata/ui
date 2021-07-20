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
import {readQueryParams} from 'src/shared/utils/queryParams'
import ErrorBoundary from 'src/shared/components/ErrorBoundary'
import GlobalQueryProvider from 'src/query/context/index'
import {isFlagEnabled} from 'src/shared/utils/featureFlag'

const DataExplorer: FC = () => {
  const dispatch = useDispatch()

  useEffect(() => {
    const bucketQP = readQueryParams()['bucket']
    dispatch(setActiveTimeMachine('de'))
    queryBuilderFetcher.clearCache()
    dispatch(setBuilderBucketIfExists(bucketQP))
  }, [dispatch])

  return (
    <ErrorBoundary>
      <LimitChecker>
        <div className="data-explorer">
          <HoverTimeProvider>
            {isFlagEnabled('Subir') && (
              <GlobalQueryProvider>
                <TimeMachine />
              </GlobalQueryProvider>
            )}
            {!isFlagEnabled('Subir') && <TimeMachine />}
          </HoverTimeProvider>
        </div>
      </LimitChecker>
    </ErrorBoundary>
  )
}

export default DataExplorer
