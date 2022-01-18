import React, {FC, useEffect, useState} from 'react'

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

const getHash = (id: string) => {
  return id
}

const useLocalStorageState = createLocalStorageStateHook(
  'bucketsMap',
  DEFAULT_CONTEXT.bucketsMap
)

export const BucketsCacheProvider: FC<Props> = ({children}) => {
  const [loading, setLoading] = useState(RemoteDataState.NotStarted)
  const [bucketsMap, updateBucketsMap] = useLocalStorageState()
  const [removeMe, setRemoveMe] = useState(true)

  useEffect(() => {
    if (!removeMe) {
      return
    }

    updateBucketsMap({})
    setRemoveMe(false)
  })

  console.log({bucketsMap})

  const fetchOne = async (url, headers, page, limit = 100) => {
    const fullurl = `${url}&page=${page}&limit=${limit}`
    console.log(fullurl)
    const response = await fetch(fullurl, {
      method: 'GET',
      headers,
      // signal: controller.current.signal,
    })
    const json = await response.json()
    console.log({json})
    return json.buckets
  }

  const fetchAll = async (url: string, token: string) => {
    console.log('fetching all')
    const headers = {
      'Content-Type': 'application/json',
      'Accept-Encoding': 'gzip',
    }

    if (token) {
      headers['Authorization'] = `Token ${token}`
    }

    let page = 1
    const bucks = []
    const bucketIDs = new Set()
    let bukz = await fetchOne(url, headers, page)
    do {
      for (let i = 0; i < bukz.length; i++) {
        const bid = bukz[i].id
        if (bucketIDs.has(bid)) {
          return bucks
        }

        bucketIDs.add(bid)
        bucks.push(bukz[i])
      }
      page += 1
      bukz = await fetchOne(url, headers, page)
    } while (bukz.length)

    return bucks
  }

  const getAllBuckets = async (
    region: string,
    orgID: string,
    token?: string
  ): Promise<Bucket[]> => {
    const hash = getHash(`${region}::::${orgID}::::${token}`)
    let bucks: Bucket[]
    setLoading(RemoteDataState.Loading)
    if (bucketsMap[hash] === undefined) {
      console.log('GETTING... in IFFF')
      bucks = await fetchAll(`${region}/api/v2/buckets?orgID=${orgID}`, token)
      updateBucketsMap({...bucketsMap, [hash]: bucks})
    } else {
      console.log('GETTING... in ELSEEE')
      bucks = bucketsMap[hash]
    }

    setLoading(RemoteDataState.Done)
    return new Promise<Bucket[]>(resolve => {
      resolve(bucks)
    })
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
