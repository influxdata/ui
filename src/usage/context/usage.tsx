// Libraries
import React, {FC, useCallback, useEffect, useState} from 'react'
import {useDispatch, useSelector} from 'react-redux'

// Utils
import {
  getBillingStartDate,
  getUsage,
  getUsageBillingStats,
  getUsageVectors,
  getUsageRateLimits,
} from 'src/client/unityRoutes'
import {getTimeRange} from 'src/dashboards/selectors'
import {setTimeRange} from 'src/timeMachine/actions'

// Constants
import {DEFAULT_TIME_RANGE} from 'src/shared/constants/timeRanges'

// Types
import {TimeRange} from 'src/types'
import {UsageVector} from 'src/types/billing'

export type Props = {
  children: JSX.Element
}

export interface UsageContextType {
  billingDateTime: string
  billingStats: string[]
  handleSetSelectedUsage: (vector: string) => void
  handleSetTimeRange: (timeRange: TimeRange) => void
  rateLimits: string
  selectedUsage: string
  timeRange: TimeRange
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
  timeRange: DEFAULT_TIME_RANGE,
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

  // TODO(ariel): update the timerange to be fixed to the enum provided
  // This is to ensure that the usage page doesn't crash on large selections
  const timeRange = useSelector(getTimeRange)
  const dispatch = useDispatch()

  const handleSetTimeRange = (range: TimeRange) => {
    dispatch(setTimeRange(range))
  }

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
    const resp = await getUsageBillingStats({})

    if (resp.status !== 200) {
      throw new Error(resp.data.message)
    }

    const csvs = resp.data?.split('\n\n')

    setBillingStats(csvs)
  }, [setBillingStats])

  useEffect(() => {
    handleGetBillingStats()
  }, [handleGetBillingStats])

  const handleGetUsageStats = useCallback(async () => {
    try {
      const resp = await getUsage({
        vector_name: selectedUsage,
        query: {range: timeRange.duration},
      })

      if (resp.status !== 200) {
        throw new Error(resp.data.message)
      }

      setUsageStats(resp.data)
    } catch (error) {
      console.error('handleGetUsageStats: ', error)
    }
  }, [selectedUsage, timeRange])

  useEffect(() => {
    handleGetUsageStats()
  }, [handleGetUsageStats])

  const handleGetRateLimits = useCallback(async () => {
    const resp = await getUsageRateLimits(timeRange)

    if (resp.status !== 200) {
      throw new Error(resp.data.message)
    }

    setRateLimits(resp.data)
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
