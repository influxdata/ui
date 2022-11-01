// Libraries
import {useEffect, useMemo, useState} from 'react'
import {useSelector} from 'react-redux'
import {NumericColumnData, fromFlux} from '@influxdata/giraffe'
import {isEqual} from 'lodash'

// API
import {
  getCachedResultsOrRunQuery,
  resetQueryCacheByQuery,
} from 'src/shared/apis/queryCache'

// Selectors
import {getOrg} from 'src/organizations/selectors'
import {getStartTime, getEndTime} from 'src/timeMachine/selectors/index'
import {getAllVariablesForZoomRequery} from 'src/variables/selectors'

// Utils
import {useOneWayState} from 'src/shared/utils/useOneWayState'
import {extent} from 'src/shared/utils/vis'
import {event} from 'src/cloud/utils/reporting'
import {
  getWindowPeriodFromVariables,
  normalizeWindowPeriodForZoomRequery,
} from 'src/variables/utils/getWindowVars'
import {isFlagEnabled} from 'src/shared/utils/featureFlag'

// Types
import {AppState, InternalFromFluxResult, TimeRange} from 'src/types'
import {RunQueryResult} from 'src/shared/apis/query'
import {RemoteDataState} from '@influxdata/clockface'

/*
  This hook helps map the domain setting stored for line graph to the
  appropriate settings on a @influxdata/giraffe `Config` object.

  If the domain setting is present, it should be used. If the domain setting is
  not present, then the min/max values shown should be derived from the data
  passed to the plot.
*/
export const getValidRange = (
  data: string[] | NumericColumnData = [],
  timeRange: TimeRange | null
) => {
  const range = extent(data as number[])
  if (timeRange === null) {
    return range
  }
  if (range && range.length >= 2) {
    const startTime = getStartTime(timeRange)
    const endTime = getEndTime(timeRange)
    const start = Math.min(startTime, range[0])
    const end = Math.max(endTime, range[1])
    return [start, end]
  }
  return range
}

export const useVisXDomainSettings = (
  storedDomain: number[],
  data: NumericColumnData,
  timeRange: TimeRange | null = null
) => {
  const initialDomain = useMemo(() => {
    if (storedDomain) {
      return storedDomain
    }

    return getValidRange(data, timeRange)
  }, [storedDomain, data]) // eslint-disable-line react-hooks/exhaustive-deps

  const [domain, setDomain] = useOneWayState(initialDomain)

  const setVisXDomain = (domain: NumericColumnData) => {
    setDomain(domain)
    event('plot.zoom_in.xAxis', {zoomRequery: 'false'})
  }

  const resetDomain = () => {
    setDomain(initialDomain)
    event('plot.zoom_restore.xAxis', {zoomRequery: 'false'})
  }

  return [domain, setVisXDomain, resetDomain]
}

const isValidStoredDomainValue = (value): boolean => {
  return (
    typeof value === 'number' && !Number.isNaN(value) && Number.isFinite(value)
  )
}

export const getRemainingRange = (
  data: string[] | NumericColumnData = [],
  timeRange: TimeRange | null,
  storedDomain: number[]
) => {
  const range = extent(data as number[])
  if (Array.isArray(range) && range.length >= 2) {
    const startTime = getStartTime(timeRange)
    const endTime = getEndTime(timeRange)
    const start = isValidStoredDomainValue(storedDomain[0])
      ? storedDomain[0]
      : Math.min(startTime, range[0])
    const end = isValidStoredDomainValue(storedDomain[1])
      ? storedDomain[1]
      : Math.max(endTime, range[1])
    return [start, end]
  }
  return range
}

export const useVisYDomainSettings = (
  storedDomain: number[],
  data: NumericColumnData | string[],
  timeRange: TimeRange | null = null
) => {
  const initialDomain = useMemo(() => {
    if (
      !Array.isArray(storedDomain) ||
      storedDomain.every(val => val === null)
    ) {
      return getValidRange(data, timeRange)
    }
    if (storedDomain.includes(null)) {
      return getRemainingRange(data, timeRange, storedDomain)
    }
    return storedDomain
  }, [storedDomain, data]) // eslint-disable-line react-hooks/exhaustive-deps

  const [domain, setDomain] = useOneWayState(initialDomain)

  const setVisYDomain = (domain: NumericColumnData | string) => {
    setDomain(domain)
    event('plot.zoom_in.yAxis', {zoomRequery: 'false'})
  }

  const resetDomain = () => {
    setDomain(initialDomain)
    event('plot.zoom_restore.yAxis', {zoomRequery: 'false'})
  }

  return [domain, setVisYDomain, resetDomain]
}

interface ZoomRequeryArgs {
  activeQueryIndex: number
  adaptiveZoomHide: boolean
  data: NumericColumnData | string[]
  parsedResult: InternalFromFluxResult
  preZoomResult: InternalFromFluxResult
  queries: string[]
  setPreZoomResult: Function
  setRequeryStatus: Function
  setResult: Function
  storedDomain: number[]
  timeRange?: TimeRange
  transmitWindowPeriod?: (windowPeriod: number | string) => void
}

const isNotEqual = (firstValue: any, secondValue: any): boolean =>
  isEqual(firstValue, secondValue) === false

export const useZoomRequeryXDomainSettings = (args: ZoomRequeryArgs) => {
  const {
    activeQueryIndex,
    adaptiveZoomHide,
    data,
    parsedResult,
    preZoomResult,
    queries,
    setPreZoomResult,
    setRequeryStatus,
    setResult,
    storedDomain,
    timeRange = null,
    transmitWindowPeriod,
  } = args

  const {type: timeRangeType} = timeRange ? timeRange : {type: 'duration'}
  const [selectedTimeRange, setSelectedTimeRange] = useState(timeRange)
  const initialDomain = useMemo(() => {
    if (storedDomain) {
      return storedDomain
    }

    return getValidRange(data, timeRange)
  }, [storedDomain, data]) // eslint-disable-line react-hooks/exhaustive-deps

  /*
   * preZoomDomain:
   *   - can be changed only by the query results
   *   - can be changed by the time range dropdown
   *   - uses one-way state to capture the very first set of values
   */
  const [preZoomDomain, setPreZoomDomain] = useOneWayState(initialDomain)

  /*
   * domain:
   *   - can be changed by user action: zooming or unzooming
   *   - zooming will trigger a new query if the windowPeriod changes
   *   - unzooming will revert the query results back to its original state
   *     (before zooming), but does not query
   *
   *   - can be changed also by the preZoomDomain, by syncing,
   *     to keep the graph fitted, and does not query
   */
  const [domain, setDomain] = useState(initialDomain)

  const getAllVariablesWithTimeDomain = (state: AppState) =>
    getAllVariablesForZoomRequery(state, timeRange ? domain : [], timeRangeType)
  const orgId = useSelector(getOrg)?.id
  const variables = useSelector(getAllVariablesWithTimeDomain)

  const [windowPeriod, setWindowPeriod] = useState<number>(
    normalizeWindowPeriodForZoomRequery(
      getWindowPeriodFromVariables(
        queries?.[activeQueryIndex] ?? '',
        variables
      ),
      timeRange,
      domain,
      data
    )
  )

  useEffect(() => {
    if (
      isFlagEnabled('zoomRequery') &&
      adaptiveZoomHide === false &&
      queries.length &&
      activeQueryIndex >= 0
    ) {
      const updatedWindowPeriod = normalizeWindowPeriodForZoomRequery(
        getWindowPeriodFromVariables(queries[activeQueryIndex], variables),
        timeRange,
        domain,
        data
      )

      if (isNotEqual(windowPeriod, updatedWindowPeriod)) {
        setWindowPeriod(updatedWindowPeriod)

        if (isNotEqual(preZoomDomain, domain)) {
          setRequeryStatus(RemoteDataState.Loading)
          Promise.all(
            queries.map(query => {
              resetQueryCacheByQuery(query, variables)
              return getCachedResultsOrRunQuery(
                orgId,
                query,
                variables,
                isFlagEnabled('zoomRequery') && !adaptiveZoomHide,
                updatedWindowPeriod
              ).promise.then((result: RunQueryResult) => {
                if (result.type === 'SUCCESS') {
                  return result.csv ?? ''
                } else {
                  return ''
                }
              })
            })
          ).then(
            pendingResults => {
              const combinedResults = pendingResults.join('\n\n')
              if (combinedResults.trim().length > 0) {
                setResult(fromFlux(combinedResults))
              }
              setRequeryStatus(RemoteDataState.Done)
            },
            () => setRequeryStatus(RemoteDataState.Error)
          )
        }
      }
    }
  }, [domain]) // eslint-disable-line react-hooks/exhaustive-deps

  // sync preZoomDomain and domain:
  //   if it is the value axis (not time), or
  //   if it is the time axis only when not zoomed in, and
  //      - they are different, or
  //      - the time range has changed
  useEffect(() => {
    if (
      !preZoomResult &&
      (isNotEqual(preZoomDomain, domain) ||
        (timeRange && isNotEqual(timeRange, selectedTimeRange)))
    ) {
      setSelectedTimeRange(timeRange)
      setDomain(preZoomDomain)
    }
  }, [domain, preZoomDomain, preZoomResult, selectedTimeRange, timeRange])

  // send back the window period if it is the time axis, otherwise
  //   cross syncing - time axis zoom changes the limits of the value axis
  useEffect(() => {
    if (timeRange) {
      transmitWindowPeriod(windowPeriod)
    } else {
      setDomain(preZoomDomain)
    }
  }, [preZoomDomain, timeRange, transmitWindowPeriod, windowPeriod])

  // Suppresses adaptive zoom feature; must come after all hooks
  if (
    !isFlagEnabled('zoomRequery') ||
    adaptiveZoomHide ||
    queries.length === 0 ||
    activeQueryIndex < 0
  ) {
    const setVisXDomain = (domain: NumericColumnData) => {
      setPreZoomDomain(domain)
      event('plot.zoom_in.xAxis', {zoomRequery: 'false'})
    }

    const resetDomain = () => {
      setPreZoomDomain(initialDomain)
      event('plot.zoom_restore.xAxis', {zoomRequery: 'false'})
    }
    return [preZoomDomain, setVisXDomain, resetDomain]
  }

  const setZoomDomain = (updatedDomain: number[]) => {
    setRequeryStatus(RemoteDataState.NotStarted)
    if (!preZoomResult) {
      setPreZoomResult(parsedResult)
    }
    setDomain(updatedDomain)
    event('plot.zoom_in.xAxis', {zoomRequery: 'true'}, {orgId})
  }

  const resetZoomDomain = () => {
    setRequeryStatus(RemoteDataState.NotStarted)
    if (preZoomResult) {
      setResult(preZoomResult)
      setPreZoomResult(null)
    }
    setDomain(preZoomDomain)
    event('plot.zoom_restore.xAxis', {zoomRequery: 'true'}, {orgId})
  }

  return [domain, setZoomDomain, resetZoomDomain]
}

export const useZoomRequeryYDomainSettings = (args: ZoomRequeryArgs) => {
  const {
    activeQueryIndex,
    adaptiveZoomHide,
    data,
    parsedResult,
    preZoomResult,
    queries,
    setPreZoomResult,
    setRequeryStatus,
    setResult,
    storedDomain,
    timeRange = null,
    transmitWindowPeriod,
  } = args

  const {type: timeRangeType} = timeRange ? timeRange : {type: 'duration'}
  const [selectedTimeRange, setSelectedTimeRange] = useState(timeRange)
  const initialDomain = useMemo(() => {
    if (
      !Array.isArray(storedDomain) ||
      storedDomain.every(val => val === null)
    ) {
      return getValidRange(data, timeRange)
    }
    if (storedDomain.includes(null)) {
      return getRemainingRange(data, timeRange, storedDomain)
    }
    return storedDomain
  }, [storedDomain, data]) // eslint-disable-line react-hooks/exhaustive-deps

  /*
   * preZoomDomain:
   *   - can be changed only by the query results
   *   - can be changed by the time range dropdown
   *   - uses one-way state to capture the very first set of values
   */
  const [preZoomDomain, setPreZoomDomain] = useOneWayState(initialDomain)

  /*
   * domain:
   *   - can be changed by user action: zooming or unzooming
   *   - zooming will trigger a new query if the windowPeriod changes
   *   - unzooming will revert the query results back to its original state
   *     (before zooming), but does not query
   *
   *   - can be changed also by the preZoomDomain, by syncing,
   *     to keep the graph fitted, and does not query
   */
  const [domain, setDomain] = useState(initialDomain)

  const getAllVariablesWithTimeDomain = (state: AppState) =>
    getAllVariablesForZoomRequery(state, timeRange ? domain : [], timeRangeType)
  const orgId = useSelector(getOrg)?.id
  const variables = useSelector(getAllVariablesWithTimeDomain)

  const [windowPeriod, setWindowPeriod] = useState<number>(
    normalizeWindowPeriodForZoomRequery(
      getWindowPeriodFromVariables(
        queries?.[activeQueryIndex] ?? '',
        variables
      ),
      timeRange,
      domain,
      data
    )
  )

  useEffect(() => {
    if (
      isFlagEnabled('zoomRequery') &&
      adaptiveZoomHide === false &&
      queries.length &&
      activeQueryIndex >= 0
    ) {
      const updatedWindowPeriod = normalizeWindowPeriodForZoomRequery(
        getWindowPeriodFromVariables(queries[activeQueryIndex], variables),
        timeRange,
        domain,
        data
      )

      if (isNotEqual(windowPeriod, updatedWindowPeriod)) {
        setWindowPeriod(updatedWindowPeriod)

        if (isNotEqual(preZoomDomain, domain)) {
          setRequeryStatus(RemoteDataState.Loading)
          Promise.all(
            queries.map(query => {
              resetQueryCacheByQuery(query, variables)
              return getCachedResultsOrRunQuery(
                orgId,
                query,
                variables,
                isFlagEnabled('zoomRequery') && !adaptiveZoomHide,
                updatedWindowPeriod
              ).promise.then((result: RunQueryResult) => {
                if (result.type === 'SUCCESS') {
                  return result.csv ?? ''
                } else {
                  return ''
                }
              })
            })
          ).then(
            pendingResults => {
              const combinedResults = pendingResults.join('\n\n')
              if (combinedResults.trim().length > 0) {
                setResult(fromFlux(combinedResults))
              }
              setRequeryStatus(RemoteDataState.Done)
            },
            () => setRequeryStatus(RemoteDataState.Error)
          )
        }
      }
    }
  }, [domain]) // eslint-disable-line react-hooks/exhaustive-deps

  // sync preZoomDomain and domain:
  //   if it is the value axis (not time), or
  //   if it is the time axis only when not zoomed in, and
  //      - they are different, or
  //      - the time range has changed
  useEffect(() => {
    if (
      !preZoomResult &&
      (isNotEqual(preZoomDomain, domain) ||
        (timeRange && isNotEqual(timeRange, selectedTimeRange)))
    ) {
      setSelectedTimeRange(timeRange)
      setDomain(preZoomDomain)
    }
  }, [domain, preZoomDomain, preZoomResult, selectedTimeRange, timeRange])

  // send back the window period if it is the time axis, otherwise
  //   cross syncing - time axis zoom changes the limits of the value axis
  useEffect(() => {
    if (timeRange) {
      transmitWindowPeriod(windowPeriod)
    } else {
      setDomain(preZoomDomain)
    }
  }, [preZoomDomain, timeRange, transmitWindowPeriod, windowPeriod])

  // Suppresses adaptive zoom feature; must come after all hooks
  if (
    !isFlagEnabled('zoomRequery') ||
    adaptiveZoomHide ||
    queries.length === 0 ||
    activeQueryIndex < 0
  ) {
    const setVisYDomain = (domain: NumericColumnData | string) => {
      setPreZoomDomain(domain)
      event('plot.zoom_in.yAxis', {zoomRequery: 'false'})
    }

    const resetDomain = () => {
      setPreZoomDomain(initialDomain)
      event('plot.zoom_restore.yAxis', {zoomRequery: 'false'})
    }
    return [preZoomDomain, setVisYDomain, resetDomain]
  }

  const setZoomDomain = (updatedDomain: number[]) => {
    setRequeryStatus(RemoteDataState.NotStarted)
    if (!preZoomResult) {
      setPreZoomResult(parsedResult)
    }
    setDomain(updatedDomain)
    event('plot.zoom_in.yAxis', {zoomRequery: 'true'}, {orgId})
  }

  const resetDomain = () => {
    setRequeryStatus(RemoteDataState.NotStarted)
    if (preZoomResult) {
      setResult(preZoomResult)
      setPreZoomResult(null)
    }
    setDomain(preZoomDomain)
    event('plot.zoom_restore.yAxis', {zoomRequery: 'true'}, {orgId})
  }

  return [domain, setZoomDomain, resetDomain]
}
