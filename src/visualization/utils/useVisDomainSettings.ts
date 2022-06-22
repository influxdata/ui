// Libraries
import {useMemo, useState} from 'react'
import {useSelector} from 'react-redux'
import {NumericColumnData, fromFlux} from '@influxdata/giraffe'

// API
import {runQuery, RunQueryResult} from 'src/shared/apis/query'

// Utils
import {useOneWayState} from 'src/shared/utils/useOneWayState'
import {extent} from 'src/shared/utils/vis'
import {getStartTime, getEndTime} from 'src/timeMachine/selectors/index'
import {getOrg} from 'src/organizations/selectors'
import {getAllVariablesForZoomRequery} from 'src/variables/selectors'
import {buildUsedVarsOption} from 'src/variables/utils/buildVarsOption'

// Types
import {InternalFromFluxResult, TimeRange} from 'src/types'
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
  const resetDomain = () => setDomain(initialDomain)

  return [domain, setDomain, resetDomain]
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
  const resetDomain = () => setDomain(initialDomain)
  return [domain, setDomain, resetDomain]
}

interface ZoomRequeryArgs {
  parsedResult: InternalFromFluxResult
  setResult: Function
  preZoomResult: InternalFromFluxResult
  setPreZoomResult: Function
  query: string
  storedDomain: number[]
  data: NumericColumnData | string[]
  timeRange?: TimeRange
}

export const useZoomRequeryXDomainSettings = (args: ZoomRequeryArgs) => {
  const {
    parsedResult,
    setResult,
    preZoomResult,
    setPreZoomResult,
    query,
    storedDomain,
    data,
    timeRange = null,
  } = args

  const orgId = useSelector(getOrg)?.id
  const variables = useSelector(getAllVariablesForZoomRequery)
  const extern = buildUsedVarsOption(query, variables)

  const initialDomain = useMemo(() => {
    if (storedDomain) {
      return storedDomain
    }

    return getValidRange(data, timeRange)
  }, [storedDomain, data]) // eslint-disable-line react-hooks/exhaustive-deps

  const [domain, setDomain] = useState(initialDomain)
  const [preZoomDomain, setPreZoomDomain] = useState<Array<number>>(null)

  const setZoomDomain = (updatedDomain: number[]) => {
    if (!preZoomResult) {
      setPreZoomDomain(initialDomain)
      setPreZoomResult(parsedResult)
    }

    runQuery(orgId, query, extern).promise.then((result: RunQueryResult) => {
      if (result.type === 'SUCCESS') {
        const parsed = fromFlux(result.csv)
        setResult(parsed)
        setDomain(updatedDomain)
      }
    })
  }
  const resetDomain = () => {
    if (preZoomResult) {
      setResult(preZoomResult)
      setPreZoomResult(null)
    }
    setDomain(preZoomDomain)
  }

  return [domain, setZoomDomain, resetDomain]
}

export const useZoomRequeryYDomainSettings = (args: ZoomRequeryArgs) => {
  const {
    parsedResult,
    setResult,
    preZoomResult,
    setPreZoomResult,
    query,
    storedDomain,
    data,
    timeRange = null,
  } = args
  const orgId = useSelector(getOrg)?.id
  const variables = useSelector(getAllVariablesForZoomRequery)
  const extern = buildUsedVarsOption(query, variables)

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

  const [domain, setDomain] = useState(initialDomain)
  const [preZoomDomain, setPreZoomDomain] = useState<Array<number>>(null)

  const setZoomDomain = (updatedDomain: number[]) => {
    if (!preZoomResult) {
      setPreZoomDomain(initialDomain)
      setPreZoomResult(parsedResult)
    }

    runQuery(orgId, query, extern).promise.then((result: RunQueryResult) => {
      if (result.type === 'SUCCESS') {
        const parsed = fromFlux(result.csv)
        setResult(parsed)
        setDomain(updatedDomain)
      }
    })
  }
  const resetDomain = () => {
    if (preZoomResult) {
      setResult(preZoomResult)
      setPreZoomResult(null)
    }
    setDomain(preZoomDomain)
  }

  return [domain, setZoomDomain, resetDomain]
}
