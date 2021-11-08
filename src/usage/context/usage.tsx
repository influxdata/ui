// Libraries
import React, {FC, useCallback, useEffect, useMemo, useState} from 'react'
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
import {
  RemoteDataState,
  SelectableDurationTimeRange,
  UsageVector,
} from 'src/types'
import {useSelector} from 'react-redux'
import {getMe} from 'src/me/selectors'

export type Props = {
  children: JSX.Element
}

export interface UsageContextType {
  billingDateTime: string
  billingStats: FromFluxResult[]
  billingStatsStatus: RemoteDataState
  handleSetSelectedUsage: (vector: string) => void
  handleSetTimeRange: (timeRange: SelectableDurationTimeRange) => void
  rateLimits: FromFluxResult
  rateLimitsStatus: RemoteDataState
  selectedUsage: string
  timeRange: SelectableDurationTimeRange
  usageStats: FromFluxResult
  usageStatsStatus: RemoteDataState
  usageVectors: UsageVector[]
  creditUsage: number
  creditUsageStatus: RemoteDataState
  creditDaysRemaining: number
  paygCreditEnabled: boolean
}

export const DEFAULT_CONTEXT: UsageContextType = {
  billingDateTime: '',
  billingStats: [],
  billingStatsStatus: RemoteDataState.NotStarted,
  handleSetSelectedUsage: () => {},
  handleSetTimeRange: () => {},
  rateLimits: null,
  rateLimitsStatus: RemoteDataState.NotStarted,
  selectedUsage: '',
  timeRange: DEFAULT_USAGE_TIME_RANGE,
  usageStats: null,
  usageStatsStatus: RemoteDataState.NotStarted,
  usageVectors: [],
  creditUsage: 0,
  creditUsageStatus: RemoteDataState.NotStarted,
  creditDaysRemaining: 0,
  paygCreditEnabled: false,
}

export const UsageContext = React.createContext<UsageContextType>(
  DEFAULT_CONTEXT
)

export const UsageProvider: FC<Props> = React.memo(({children}) => {
  const [billingDateTime, setBillingDateTime] = useState('')
  const [usageVectors, setUsageVectors] = useState([])
  const [selectedUsage, setSelectedUsage] = useState('')
  const [billingStats, setBillingStats] = useState<FromFluxResult[]>([])
  const [billingStatsStatus, setBillingStatsStatus] = useState(
    RemoteDataState.NotStarted
  )
  const [usageStats, setUsageStats] = useState<FromFluxResult>(null)
  const [usageStatsStatus, setUsageStatsStatus] = useState(
    RemoteDataState.NotStarted
  )
  const [rateLimits, setRateLimits] = useState<FromFluxResult>(null)
  const [rateLimitsStatus, setRateLimitsStatus] = useState(
    RemoteDataState.NotStarted
  )

  const [creditUsage, setCreditUsage] = useState(0)
  const [creditUsageStatus, setCreditUsageStatus] = useState(
    DEFAULT_CONTEXT.creditUsageStatus
  )
  const [timeRange, setTimeRange] = useState<SelectableDurationTimeRange>(
    DEFAULT_USAGE_TIME_RANGE
  )
  const {quartzMe} = useSelector(getMe)
  const creditDaysRemaining = useMemo(() => {
    const startDate = new Date(quartzMe?.paygCreditStartDate)
    const current = new Date()
    const diffTime = Math.abs(current.getTime() - startDate.getTime())
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

    return 30 - diffDays
  }, [quartzMe?.paygCreditStartDate])

  const paygCreditEnabled = creditDaysRemaining > 0 && creditDaysRemaining <= 30

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

  const getComputedUsage = (vector_name: string, csvData: string) => {
    const vectors = {
      storage_gb: v => v * 0.02,
      writes_mb: v => v * 0.002,
      reads_gb: v => v * 0.09,
      query_count: v => (v * 0.01) / 100,
    }

    const values = fromFlux(csvData).table.getColumn(vector_name) as Array<any>
    if (!values) {
      return 0
    }

    const tot = values.reduce((a, b) => a + b, 0)
    return vectors[vector_name](tot)
  }

  const handleGetCreditUsage = useCallback(async () => {
    try {
      setCreditUsageStatus(RemoteDataState.Loading)
      const vectors = ['storage_gb', 'writes_mb', 'reads_gb', 'query_count']
      const promises = []

      vectors.forEach(vector_name => {
        promises.push(
          new Promise(async resolve => {
            const resp = await getUsage({vector_name, query: {range: '30d'}})
            if (resp.status !== 200) {
              throw new Error(resp.data.message)
            }

            resolve(getComputedUsage(vector_name, resp.data))
          })
        )
      })

      Promise.all(promises).then(result => {
        const usage: number = result
          .reduce((a: number, b) => a + parseFloat(b), 0)
          .toFixed(2)
        console.log({usage, result})
        setCreditUsage(usage)
        setCreditUsageStatus(RemoteDataState.Done)
      })
    } catch (error) {
      setCreditUsageStatus(RemoteDataState.Error)
    }
  }, [])
  useEffect(() => {
    handleGetCreditUsage()
  }, [handleGetCreditUsage])

  const handleGetBillingStats = useCallback(async () => {
    try {
      setBillingStatsStatus(RemoteDataState.Loading)
      const resp = await getUsageBillingStats({})

      if (resp.status !== 200) {
        throw new Error(resp.data.message)
      }

      const csv = resp.data?.trim().replace(/\r\n/g, '\n')

      const csvs = csv.split('\n\n').map(c => fromFlux(c))

      setBillingStatsStatus(RemoteDataState.Done)
      setBillingStats(csvs)
    } catch (error) {
      console.error(error)
      setBillingStatsStatus(RemoteDataState.Error)
    }
  }, [setBillingStats])

  useEffect(() => {
    handleGetBillingStats()
  }, [handleGetBillingStats])

  const handleGetUsageStats = useCallback(
    async (duration: string, selectedUsage: string) => {
      if (selectedUsage.length > 0) {
        try {
          setUsageStatsStatus(RemoteDataState.Loading)
          const vector = usageVectors.find(
            vector => selectedUsage === vector.name
          )

          const resp = await getUsage({
            vector_name: vector.fluxKey,
            query: {range: duration},
          })

          if (resp.status !== 200) {
            throw new Error(resp.data.message)
          }

          const fromFluxResult = fromFlux(resp.data)

          setUsageStats(fromFluxResult)
          setUsageStatsStatus(RemoteDataState.Done)
        } catch (error) {
          console.error(error)
          setUsageStatsStatus(RemoteDataState.Error)
          setUsageStats(null)
        }
      }
    },
    [usageVectors]
  )

  useEffect(() => {
    handleGetUsageStats(timeRange.duration, selectedUsage)
  }, [handleGetUsageStats, timeRange.duration, selectedUsage])

  const handleGetRateLimits = useCallback(async (duration: string) => {
    try {
      setRateLimitsStatus(RemoteDataState.Loading)
      const resp = await getUsageRateLimits({
        query: {range: duration},
      })

      if (resp.status !== 200) {
        throw new Error(resp.data.message)
      }

      const fromFluxResult = fromFlux(resp.data)

      setRateLimits(fromFluxResult)
      setRateLimitsStatus(RemoteDataState.Done)
    } catch (error) {
      setRateLimitsStatus(RemoteDataState.Error)
      console.error(error)
      setRateLimits(null)
    }
  }, [])

  useEffect(() => {
    handleGetRateLimits(timeRange.duration)
  }, [handleGetRateLimits, timeRange.duration])

  return (
    <UsageContext.Provider
      value={{
        billingDateTime,
        billingStats,
        billingStatsStatus,
        handleSetSelectedUsage,
        handleSetTimeRange,
        rateLimits,
        rateLimitsStatus,
        selectedUsage,
        timeRange,
        usageStats,
        usageStatsStatus,
        usageVectors,
        creditUsage,
        creditUsageStatus,
        creditDaysRemaining,
        paygCreditEnabled,
      }}
    >
      {children}
    </UsageContext.Provider>
  )
})

export default UsageProvider
