// Libraries
import React, {FC, useCallback, useEffect, useState} from 'react'
import {fromFlux, FromFluxResult} from '@influxdata/giraffe'

// Utils
import {
  getBillingStartDate,
  getUsage,
  getUsageBillingStats,
  getUsageVectors,
  getUsageRateLimits,
} from 'src/client/unityRoutes'

// Constants
import {DEFAULT_USAGE_TIME_RANGE} from 'src/shared/constants/timeRanges'

// Types
import {SelectableDurationTimeRange, UsageVector} from 'src/types'

export type Props = {
  children: JSX.Element
}

export interface UsageContextType {
  billingDateTime: string
  billingStats: FromFluxResult[]
  handleSetSelectedUsage: (vector: string) => void
  handleSetTimeRange: (timeRange: SelectableDurationTimeRange) => void
  rateLimits: FromFluxResult
  selectedUsage: string
  timeRange: SelectableDurationTimeRange
  usageStats: FromFluxResult
  usageVectors: UsageVector[]
}

export const DEFAULT_CONTEXT: UsageContextType = {
  billingDateTime: '',
  billingStats: [],
  handleSetSelectedUsage: () => {},
  handleSetTimeRange: () => {},
  rateLimits: null,
  selectedUsage: '',
  timeRange: DEFAULT_USAGE_TIME_RANGE,
  usageStats: null,
  usageVectors: [],
}

export const UsageContext = React.createContext<UsageContextType>(
  DEFAULT_CONTEXT
)

export const UsageProvider: FC<Props> = React.memo(({children}) => {
  const [billingDateTime, setBillingDateTime] = useState('')
  const [usageVectors, setUsageVectors] = useState([])
  const [selectedUsage, setSelectedUsage] = useState('')
  const [billingStats, setBillingStats] = useState<FromFluxResult[]>([])
  const [usageStats, setUsageStats] = useState<FromFluxResult>(null)
  const [rateLimits, setRateLimits] = useState<FromFluxResult>(null)
  const [timeRange, setTimeRange] = useState<SelectableDurationTimeRange>(
    DEFAULT_USAGE_TIME_RANGE
  )

  const handleSetTimeRange = useCallback(
    (range: SelectableDurationTimeRange) => {
      setTimeRange(range)
    },
    [setTimeRange]
  )

  const handleSetSelectedUsage = useCallback(
    (vector: string) => {
      setSelectedUsage(vector)
    },
    [setSelectedUsage]
  )

  const handleGetUsageVectors = useCallback(async () => {
    try {
      const resp = await getUsageVectors({})

      if (resp.status !== 200) {
        throw new Error(resp.data.message)
      }

      const vectors = resp.data

      setUsageVectors(vectors)
      handleSetSelectedUsage(vectors?.[0]?.name)
    } catch (error) {
      console.error(error)
    }
  }, [setUsageVectors, handleSetSelectedUsage])

  useEffect(() => {
    handleGetUsageVectors()
  }, [handleGetUsageVectors])

  const handleGetBillingDate = useCallback(async () => {
    try {
      const resp = await getBillingStartDate({})

      if (resp.status !== 200) {
        throw new Error(resp.data.message)
      }

      setBillingDateTime(resp.data.dateTime)
    } catch (error) {
      console.error(error)
    }
  }, [setBillingDateTime])

  useEffect(() => {
    handleGetBillingDate()
  }, [handleGetBillingDate])

  const handleGetBillingStats = useCallback(async () => {
    try {
      const resp = await getUsageBillingStats({})

      if (resp.status !== 200) {
        throw new Error(resp.data.message)
      }

      const csv = resp.data?.trim().replace(/\r\n/g, '\n')

      const csvs = csv.split('\n\n').map(c => fromFlux(c))

      setBillingStats(csvs)
    } catch (error) {
      console.error(error)
    }
  }, [setBillingStats])

  useEffect(() => {
    handleGetBillingStats()
  }, [handleGetBillingStats])

  const handleGetUsageStats = useCallback(async () => {
    if (selectedUsage.length > 0) {
      try {
        const vector = usageVectors.find(
          vector => selectedUsage === vector.name
        )

        const resp = await getUsage({
          vector_name: vector.fluxKey,
          query: {range: timeRange.duration},
        })

        if (resp.status !== 200) {
          throw new Error(resp.data.message)
        }

        const fromFluxResult = fromFlux(resp.data)

        setUsageStats(fromFluxResult)
      } catch (error) {
        console.error(error)
        setUsageStats(null)
      }
    }
  }, [selectedUsage, timeRange, usageVectors])

  useEffect(() => {
    handleGetUsageStats()
  }, [handleGetUsageStats])

  const handleGetRateLimits = useCallback(async () => {
    try {
      const resp = await getUsageRateLimits({
        query: {range: timeRange.duration},
      })

      if (resp.status !== 200) {
        throw new Error(resp.data.message)
      }

      const fromFluxResult = fromFlux(resp.data)

      setRateLimits(fromFluxResult)
    } catch (error) {
      console.error(error)
      setRateLimits(null)
    }
  }, [timeRange])

  useEffect(() => {
    handleGetRateLimits()
  }, [handleGetRateLimits])

  return (
    <UsageContext.Provider
      value={{
        billingDateTime,
        billingStats,
        handleSetSelectedUsage,
        handleSetTimeRange,
        rateLimits,
        selectedUsage,
        timeRange,
        usageStats,
        usageVectors,
      }}
    >
      {children}
    </UsageContext.Provider>
  )
})

export default UsageProvider
