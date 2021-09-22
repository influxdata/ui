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
import GlobalQueryProvider from 'src/shared/contexts/global'
import QueryProvider from 'src/shared/contexts/query'

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
            <QueryProvider>
              <GlobalQueryProvider>
                <TimeMachine />
              </GlobalQueryProvider>
            </QueryProvider>
          </HoverTimeProvider>
        </div>
      </LimitChecker>
    </ErrorBoundary>
  )
}

export default DataExplorer
