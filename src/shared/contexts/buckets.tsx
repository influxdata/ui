// Libraries
import React, {
  FC,
  createContext,
  useEffect,
  useMemo,
  useRef,
  useContext,
} from 'react'
import {useDispatch} from 'react-redux'
import {createLocalStorageStateHook} from 'use-local-storage-state'
import {normalize} from 'normalizr'

import {arrayOfBuckets} from 'src/schemas'
import {notify} from 'src/shared/actions/notifications'
import {setBuckets} from 'src/buckets/actions/creators'

// Contexts
import {CLOUD} from 'src/shared/constants'
import {
  measurementSchemaAdditionSuccessful,
  measurementSchemaAdditionFailed,
} from 'src/shared/copy/notifications'

// Types
import {Bucket, BucketEntities, RemoteDataState} from 'src/types'
import {QueryScope} from 'src/shared/contexts/query'
import {PipeContext} from 'src/flows/context/pipe'

let MeasurementSchemaCreateRequest = null
if (CLOUD) {
  MeasurementSchemaCreateRequest = require('src/client/generatedRoutes')
    .MeasurementSchemaCreateRequest
}

export interface ExtendedBucket extends Bucket {
  schemas: typeof MeasurementSchemaCreateRequest[]
}

interface BucketContextType {
  loading: RemoteDataState
  buckets: Bucket[]
  addBucket: (_: Bucket) => void
  createBucket: (_: Bucket) => void
  refresh: () => void
}

const DEFAULT_CONTEXT: BucketContextType = {
  loading: RemoteDataState.NotStarted,
  buckets: [],
  addBucket: (_: Bucket) => {},
  createBucket: (_: Bucket) => {},
  refresh: () => {},
}

export const BucketContext = createContext<BucketContextType>(DEFAULT_CONTEXT)

const useLocalStorageState = createLocalStorageStateHook('buckets', {})

interface Props {
  omitSampleData?: boolean
  scope: QueryScope
}

export const BucketProvider: FC<Props> = ({
  children,
  omitSampleData = false,
  scope,
}) => {
  const cacheKey = `${scope.region};;<${scope.org}>`
  const [bucketCache, setBucketCache] = useLocalStorageState()
  const {data} = useContext(PipeContext)
  const dispatch = useDispatch()
  const buckets = bucketCache[cacheKey]?.buckets ?? []
  const lastFetch = bucketCache[cacheKey]?.lastFetch ?? 0
  const loading = bucketCache[cacheKey]?.loading ?? RemoteDataState.NotStarted
  const controller = useRef<AbortController>(null)

  useEffect(() => {
    if (controller.current) {
      return () => {
        try {
          // Cancelling active query so that there's no memory leak in this component when unmounting
          controller.current.abort()
        } catch (e) {
          // Do nothing
        }
      }
    }
  }, [controller])

  // keep the redux store in sync
  useEffect(() => {
    dispatch(
      setBuckets(
        RemoteDataState.Done,
        normalize<Bucket, BucketEntities, string[]>(
          buckets.filter(b => b.type !== 'sample'),
          arrayOfBuckets
        )
      )
    )
  }, [buckets])

  // TODO: load bucket creation limits on org change
  // expose limits to frontend

  const updateCache = (update: any): void => {
    bucketCache[cacheKey] = {
      ...bucketCache[cacheKey],
      ...update,
    }
    setBucketCache({
      ...bucketCache,
    })
  }

  const fetchBuckets = () => {
    if (controller.current) {
      controller.current.abort()
      controller.current = null
    } else {
      controller.current = new AbortController()
    }

    updateCache({
      loading: RemoteDataState.Loading,
    })

    const headers = {
      'Content-Type': 'application/json',
      'Accept-Encoding': 'gzip',
    }

    if (scope?.token) {
      headers['Authorization'] = `Token ${scope.token}`
    }

    fetch(
      `${scope?.region}/api/v2/buckets?limit=${CLOUD ? -1 : 100}&orgID=${
        scope?.org
      }`,
      {
        method: 'GET',
        headers,
        signal: controller.current.signal,
      }
    )
      .then(response => {
        return response.json()
      })
      .then(response => {
        controller.current = null
        const base: any = {
          system: [],
          user: [],
        }

        const bucks = response.buckets.reduce((acc, curr) => {
          if (curr.type === 'system') {
            acc.system.push(curr)
          } else {
            acc.user.push(curr)
          }
          return acc
        }, base)

        bucks.system.sort((a, b) =>
          `${a.name}`.toLowerCase().localeCompare(`${b.name}`.toLowerCase())
        )
        bucks.user.sort((a, b) =>
          `${a.name}`.toLowerCase().localeCompare(`${b.name}`.toLowerCase())
        )
        updateCache({
          loading: RemoteDataState.Done,
          lastFetch: Date.now(),
          buckets: [...bucks.user, ...bucks.system],
        })
      })
      .catch(error => {
        console.error({error})
        controller.current = null
        updateCache({
          loading: RemoteDataState.Error,
        })
      })
  }

  // make sure to fetch buckets on mount
  useEffect(() => {
    if (Date.now() - lastFetch > 12 * 60 * 60 * 1000) {
      fetchBuckets()
    } else if (loading === RemoteDataState.NotStarted) {
      fetchBuckets()
    }
  }, [])

  const createBucket = (bucket: ExtendedBucket) => {
    bucket.orgID = scope.org
    let schemas = []
    if (bucket.schemas && bucket.schemas.length) {
      bucket.schemaType = 'explicit'
      schemas = bucket.schemas
    } else {
      bucket.schemaType = 'implicit'
    }

    delete bucket.schemas

    const headers = {
      'Content-Type': 'application/json',
      'Accept-Encoding': 'gzip',
    }

    if (scope?.token) {
      headers['Authorization'] = `Token ${scope.token}`
    }

    fetch(`${scope?.region}/api/v2/buckets`, {
      method: 'POST',
      headers,
      body: JSON.stringify(bucket),
    })
      .then(response => {
        return response.json()
      })
      .then(response => {
        addBucket(response)

        return Promise.all(
          schemas.map(schema =>
            fetch(
              `${scope?.region}/api/v2/buckets/${response.id}/schema/measurements`,
              {
                method: 'POST',
                headers,
                body: JSON.stringify(schema),
              }
            ).then(resp => {
              if (resp.status !== 201) {
                dispatch(
                  notify(
                    measurementSchemaAdditionFailed(response.name, schema.name)
                  )
                )
              } else {
                dispatch(
                  notify(
                    measurementSchemaAdditionSuccessful(
                      response.name,
                      schema.name
                    )
                  )
                )
              }
            })
          )
        )
      })
  }

  const addBucket = (bucket: Bucket) => {
    const bucks = buckets.reduce(
      (acc, curr) => {
        if (!acc[curr.type]) {
          acc[curr.type] = []
        }
        acc[curr.type].push(curr)
        return acc
      },
      {[bucket.type]: [bucket]}
    )

    bucks.system.sort((a, b) =>
      `${a.name}`.toLowerCase().localeCompare(`${b.name}`.toLowerCase())
    )
    bucks.user.sort((a, b) =>
      `${a.name}`.toLowerCase().localeCompare(`${b.name}`.toLowerCase())
    )

    updateCache({
      buckets: [...bucks.user, ...bucks.system],
    })
  }

  const refresh = () => {
    fetchBuckets()
  }
  const outBuckets = useMemo(
    () =>
      buckets
        .filter(b => b.type !== 'sample')
        .concat(
          omitSampleData
            ? []
            : [
                {
                  type: 'sample',
                  name: 'Air Sensor Data',
                  id: 'airSensor',
                },
                {
                  type: 'sample',
                  name: 'Coinbase bitcoin price',
                  id: 'bitcoin',
                },
                {
                  type: 'sample',
                  name: 'NOAA National Buoy Data',
                  id: 'noaa',
                },
                {
                  type: 'sample',
                  name: 'USGS Earthquakes',
                  id: 'usgs',
                },
              ]
        ),
    [buckets]
  )

  return useMemo(
    () => (
      <BucketContext.Provider
        value={{loading, buckets: outBuckets, createBucket, addBucket, refresh}}
      >
        {children}
      </BucketContext.Provider>
    ),
    [data.bucket, loading, outBuckets]
  )
}
