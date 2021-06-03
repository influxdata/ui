// Libraries
import React, {FC, useCallback, useEffect, useState} from 'react'

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
import {SelectableDurationTimeRange} from 'src/types'
import {UsageVector} from 'src/types/billing'

export type Props = {
  children: JSX.Element
}

export interface UsageContextType {
  billingDateTime: string
  billingStats: string[]
  handleSetSelectedUsage: (vector: string) => void
  handleSetTimeRange: (timeRange: SelectableDurationTimeRange) => void
  rateLimits: string
  selectedUsage: string
  timeRange: SelectableDurationTimeRange
  usageStats: string
  usageVectors: UsageVector[]
}

export const DEFAULT_CONTEXT: UsageContextType = {
  billingDateTime: '',
  billingStats: [],
  handleSetSelectedUsage: () => {},
  handleSetTimeRange: () => {},
  rateLimits: '',
  selectedUsage: '',
  timeRange: DEFAULT_USAGE_TIME_RANGE,
  usageStats: '',
  usageVectors: [],
}

export const UsageContext = React.createContext<UsageContextType>(
  DEFAULT_CONTEXT
)

export const UsageProvider: FC<Props> = React.memo(({children}) => {
  const [billingDateTime, setBillingDateTime] = useState('')
  const [usageVectors, setUsageVectors] = useState([])
  const [selectedUsage, setSelectedUsage] = useState('')
  const [billingStats, setBillingStats] = useState([])
  const [usageStats, setUsageStats] = useState('')
  const [rateLimits, setRateLimits] = useState('')
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
      console.error('handleGetUsageVectors: ', error)
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
      console.error('handleGetBillingDate: ', error)
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

      const csv = resp.data?.trim().replace('\r\n', '\n')
      // TODO(ariel): keeping this in for testing purposes in staging
      // This will need to be removed for flipping the feature flag on
      console.warn({csv, json: JSON.stringify(resp.data)})

      const csvs = csv.split('\n\n')

      // TODO(ariel): keeping this in for testing purposes in staging
      // This will need to be removed for flipping the feature flag on
      console.warn({csvs})
      setBillingStats(csvs)
    } catch (error) {
      console.error('getBillingStats: ', error)
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

        setUsageStats(resp.data)
      } catch (error) {
        console.error('handleGetUsageStats: ', error)
        setUsageStats('')
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

      setRateLimits(resp.data)
    } catch (error) {
      console.error('handleGetRateLimits: ', error)
      setRateLimits('')
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
