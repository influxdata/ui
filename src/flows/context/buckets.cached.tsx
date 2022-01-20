import React, {FC, useEffect, useState} from 'react'
import {hashCode} from 'src/shared/apis/queryCache'

// Actions

// Selectors

// Types
import {Bucket, RemoteDataState} from 'src/types'
import {createLocalStorageStateHook} from 'use-local-storage-state'

type UnixTimestamp = number

interface BucketsCache {
  expires: UnixTimestamp
  buckets: Bucket[]
}

export interface BucketsCacheState {
  isDirty: boolean
}

interface BucketsCacheMap {
  [key: string]: BucketsCache
}
export type Props = {
  children: JSX.Element
}
export interface BucketsCacheContextType {
  loading: RemoteDataState
  bucketsMap: BucketsCacheMap
  bucketsCacheState: BucketsCacheState
  getAllBuckets: (
    region: string,
    orgID: string,
    token?: string
  ) => Promise<Bucket[]>
}

export const DEFAULT_CONTEXT: BucketsCacheContextType = {
  loading: RemoteDataState.NotStarted,
  bucketsMap: {},
  bucketsCacheState: {isDirty: false},
  getAllBuckets: (_: string, __: string, ___?: string) =>
    new Promise<[]>(r => r([])),
}

export const BucketsCacheContext = React.createContext<BucketsCacheContextType>(
  DEFAULT_CONTEXT
)

const getHash = (region: string, orgID: string, token = '') => {
  return hashCode(`${region}::::${orgID}::::${token}`)
}

const useLocalStorageState = createLocalStorageStateHook(
  'BucketsCache',
  DEFAULT_CONTEXT.bucketsMap
)

const useBucketsCacheStorage = createLocalStorageStateHook(
  'BucketsCacheState',
  DEFAULT_CONTEXT.bucketsCacheState
)

// In Seconds
const BUCKETS_CACHING_TIME = 30

const getCurrentTimestamp = (): UnixTimestamp => {
  return Math.round(new Date().getTime() / 1000)
}

export const BucketsCacheProvider: FC<Props> = ({children}) => {
  const [loading, setLoading] = useState(RemoteDataState.NotStarted)
  const [bucketsMap, updateBucketsMap] = useLocalStorageState()
  const [bucketsCacheState, updateBucketsCacheState] = useBucketsCacheStorage()

  const setCleanupTimer = id => {
    const timeout = (bucketsMap[id]?.expires - getCurrentTimestamp()) * 1000
    setTimeout(() => {
      if (bucketsMap[id]?.expires) {
        delete bucketsMap[id]
        updateBucketsMap({...bucketsMap})
      }
    }, timeout)
  }

  useEffect(() => {
    if (bucketsCacheState.isDirty) {
      updateBucketsCacheState({isDirty: false})
      updateBucketsMap({})

      return
    }

    Object.keys(bucketsMap).forEach(key => {
      setCleanupTimer(key)
    })
  }, [])

  useEffect(() => {})

  const addToBucketsMap = (id, buckets) => {
    // Direct state mutation required
    const expires = getCurrentTimestamp() + BUCKETS_CACHING_TIME
    bucketsMap[id] = {
      buckets,
      expires,
    }
    updateBucketsMap({...bucketsMap})
    setCleanupTimer(id)
  }

  const fetchOne = async (url, headers, page, limit = 100) => {
    const fullurl = `${url}&page=${page}&limit=${limit}`
    const response = await fetch(fullurl, {
      method: 'GET',
      headers,
    })
    const json = await response.json()
    return json.buckets
  }

  const fetchAll = async (url: string, token: string) => {
    const headers = {
      'Content-Type': 'application/json',
      'Accept-Encoding': 'gzip',
    }

    if (token) {
      headers['Authorization'] = `Token ${token}`
    }

    let page = 1

    // To check if the list response has exhausted
    const bucketIDs = new Set()

    const buckets = []
    let results = await fetchOne(url, headers, page)
    do {
      for (let i = 0; i < results.length; i++) {
        const bid = results[i].id
        if (bucketIDs.has(bid)) {
          return buckets
        }

        bucketIDs.add(bid)
        buckets.push(results[i])
      }
      page += 1
      results = await fetchOne(url, headers, page)
    } while (results.length)

    return buckets
  }

  const isExpired = (map: BucketsCache): boolean => {
    return !map?.expires || getCurrentTimestamp() - map.expires >= 0
  }

  const getAllBuckets = async (
    region: string,
    orgID: string,
    token = ''
  ): Promise<Bucket[]> => {
    const hash = getHash(region, orgID, token)
    let buckets
    setLoading(RemoteDataState.Loading)
    if (isExpired(bucketsMap[hash])) {
      buckets = await fetchAll(`${region}/api/v2/buckets?orgID=${orgID}`, token)
      addToBucketsMap(hash, buckets)
    } else {
      buckets = bucketsMap[hash].buckets
    }

    return new Promise(resolve => {
      setLoading(RemoteDataState.Done)
      resolve(buckets)
    })
  }

  return (
    <BucketsCacheContext.Provider
      value={{
        loading,
        bucketsMap,
        getAllBuckets,
        bucketsCacheState,
      }}
    >
      {children}
    </BucketsCacheContext.Provider>
  )
}
