import React, {FC, useEffect, useState} from 'react'
import {hashCode} from 'src/shared/apis/queryCache'

// Actions

// Selectors

// Types
import {Bucket, RemoteDataState} from 'src/types'
import {createLocalStorageStateHook} from 'use-local-storage-state'

interface BucketsMap {
  [key: string]: Bucket[]
}
export type Props = {
  children: JSX.Element
}
export interface BucketsCacheContextType {
  loading: RemoteDataState
  bucketsMap: BucketsMap
  getAllBuckets: (
    region: string,
    orgID: string,
    token?: string
  ) => Promise<Bucket[]>
}

export const DEFAULT_CONTEXT: BucketsCacheContextType = {
  loading: RemoteDataState.NotStarted,
  bucketsMap: {},
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
  'bucketsMap',
  DEFAULT_CONTEXT.bucketsMap
)

// In Seconds
const BUCKETS_CACHING_TIME = 30 * 1000

export const BucketsCacheProvider: FC<Props> = ({children}) => {
  const [loading, setLoading] = useState(RemoteDataState.NotStarted)
  const [bucketsMap, updateBucketsMap] = useLocalStorageState()
  const [removeMe, setRemoveMe] = useState(true)

  const removeBucketsTimer = (id: string) => {
    // Direct state mutation required
    if (bucketsMap[id]) {
      delete bucketsMap[id]
    }
    updateBucketsMap({...bucketsMap})
  }
  const addToBucketsMap = (id, buckets) => {
    // Direct state mutation required
    bucketsMap[id] = buckets
    updateBucketsMap({...bucketsMap})
    setTimeout(() => {
      if (bucketsMap[id]) {
        removeBucketsTimer(id)
      }
    }, BUCKETS_CACHING_TIME)
  }

  // FIXME: Remove this
  useEffect(() => {
    if (!removeMe) {
      return
    }

    updateBucketsMap({})
    setRemoveMe(false)
  })

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
    const buckets = []
    const bucketIDs = new Set()
    let bucketz = await fetchOne(url, headers, page)
    do {
      for (let i = 0; i < bucketz.length; i++) {
        const bid = bucketz[i].id
        if (bucketIDs.has(bid)) {
          return buckets
        }

        bucketIDs.add(bid)
        buckets.push(bucketz[i])
      }
      page += 1
      bucketz = await fetchOne(url, headers, page)
    } while (bucketz.length)

    return buckets
  }

  const getAllBuckets = (
    region: string,
    orgID: string,
    token?: string
  ): Promise<Bucket[]> => {
    const hash = getHash(region, orgID, token)
    let bucksPromise
    setLoading(RemoteDataState.Loading)

    if (!bucketsMap[hash]) {
      bucksPromise = fetchAll(
        `${region}/api/v2/buckets?orgID=${orgID}`,
        token ?? ''
      )
      addToBucketsMap(hash, bucksPromise)
    } else {
      bucksPromise = bucketsMap[hash]
    }

    setLoading(RemoteDataState.Done)
    return bucksPromise
  }

  return (
    <BucketsCacheContext.Provider
      value={{
        loading,
        bucketsMap,
        getAllBuckets,
      }}
    >
      {children}
    </BucketsCacheContext.Provider>
  )
}
