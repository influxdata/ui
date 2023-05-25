// Libraries
import React, {FC, useCallback, useEffect, useMemo, useState} from 'react'
import {fromFlux, FromFluxResult} from '@influxdata/giraffe'
import {useSelector} from 'react-redux'

// Utils
import {
  getBillingStartDate,
  getUsage,
  getUsageBillingStats,
  getUsageVectors,
  getUsageRateLimits,
} from 'src/client/unityRoutes'
import {isFlagEnabled} from 'src/shared/utils/featureFlag'

// Constants
import {PAYG_CREDIT_DAYS} from 'src/shared/constants'
import {DEFAULT_USAGE_TIME_RANGE} from 'src/shared/constants/timeRanges'
import {MILLISECONDS_IN_ONE_DAY} from 'src/utils/datetime/constants'

// Selectors
import {selectCurrentIdentity} from 'src/identity/selectors'

// Types
import {
  RemoteDataState,
  SelectableDurationTimeRange,
  UsageVector,
} from 'src/types'

export type Props = {
  children: JSX.Element
}

interface Usage {
  amount: number
  status: RemoteDataState
}

const DEFAULT_USAGE: Usage = {
  amount: 0,
  status: RemoteDataState.NotStarted,
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
  creditUsage: Usage
  creditDaysUsed: number
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
  creditUsage: DEFAULT_USAGE,
  creditDaysUsed: 0,
  paygCreditEnabled: false,
}

export const UsageContext =
  React.createContext<UsageContextType>(DEFAULT_CONTEXT)

export const calculateCreditDaysUsed = (creditStartDate: string): number => {
  if (!creditStartDate) {
    return NaN
  }
  const startDate = new Date(creditStartDate)
  const current = new Date()
  const diffTime = current.getTime() - startDate.getTime()
  return Math.floor(diffTime / MILLISECONDS_IN_ONE_DAY)
}

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

  const [creditUsage, setCreditUsage] = useState<Usage>(DEFAULT_USAGE)
  const [timeRange, setTimeRange] = useState<SelectableDurationTimeRange>(
    DEFAULT_USAGE_TIME_RANGE
  )

  const {account} = useSelector(selectCurrentIdentity)

  const paygCreditStartDate = account.paygCreditStartDate ?? ''

  const creditDaysUsed = useMemo(
    () => calculateCreditDaysUsed(paygCreditStartDate),
    [paygCreditStartDate]
  )

  const paygCreditEnabled =
    creditDaysUsed >= 0 && creditDaysUsed < PAYG_CREDIT_DAYS

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
    // Calculation Formula
    // Credit usage: $250 - (
    //   (sum of 30-day writes * $0.002) +
    //   (sum of 30-day query count * $0.01 / 100) +
    //   (sum of 30-day query storage * $0.002) +
    //   (sum of 30-day data out * $0.09)
    //  )
    const vectors = {
      storage_gb: v => v * 0.002,
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

  const handleGetCreditUsage = useCallback(() => {
    if (paygCreditEnabled) {
      try {
        setCreditUsage(prev => ({
          ...prev,
          status: RemoteDataState.Loading,
        }))
        const vectors = ['storage_gb', 'writes_mb', 'reads_gb', 'query_count']
        const promises = []

        let daysWith250Credit = PAYG_CREDIT_DAYS

        if (isFlagEnabled('credit250fix')) {
          const secondsPerDay = 1000 * 3600 * 24
          const currentDate = new Date()
          const secondsWith250Credit =
            currentDate.getTime() - new Date(paygCreditStartDate).getTime()
          const creditDays = Math.floor(secondsWith250Credit / secondsPerDay)

          if (creditDays <= 0 || isNaN(creditDays)) {
            throw new Error('invalid number of credit days')
          }

          daysWith250Credit = creditDays
        }

        vectors.forEach(vector_name => {
          promises.push(
            getUsage({
              vector_name,
              query: {range: `${daysWith250Credit}d`},
            }).then(resp => {
              if (resp.status !== 200) {
                throw new Error(resp.data.message)
              }

              return new Promise(resolve =>
                resolve(getComputedUsage(vector_name, resp.data))
              )
            })
          )
        })

        Promise.all(promises)
          .then(result => {
            const amount: number = result
              .reduce((a: number, b) => a + parseFloat(b), 0)
              .toFixed(2)
            setCreditUsage({
              amount,
              status: RemoteDataState.Done,
            })
          })
          .catch(err => console.error(err))
      } catch (error) {
        setCreditUsage(prev => ({
          ...prev,
          status: RemoteDataState.Done,
        }))
      }
    }
  }, [paygCreditEnabled])

  useEffect(() => {
    handleGetCreditUsage()
  }, [creditUsage?.amount, handleGetCreditUsage])

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
        creditDaysUsed,
        paygCreditEnabled,
      }}
    >
      {children}
    </UsageContext.Provider>
  )
})

export default UsageProvider
