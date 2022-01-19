// Libraries
import React, {
  FC,
  createContext,
  useContext,
  useEffect,
  useState,
  useMemo,
  useRef,
} from 'react'

// Contexts
import {FlowQueryContext} from 'src/flows/context/flow.query'
import {PipeContext} from 'src/flows/context/pipe'

// Types
import {Bucket, RemoteDataState} from 'src/types'

interface BucketContextType {
  loading: RemoteDataState
  buckets: Bucket[]
  addBucket: (_: Bucket) => void
}

const DEFAULT_CONTEXT: BucketContextType = {
  loading: RemoteDataState.NotStarted,
  buckets: [],
  addBucket: (_: Bucket) => {},
}

export const BucketContext = createContext<BucketContextType>(DEFAULT_CONTEXT)

export const BucketProvider: FC = ({children}) => {
  const [loading, setLoading] = useState(RemoteDataState.NotStarted)
  const [buckets, setBuckets] = useState<Bucket[]>([])
  const {getPanelQueries} = useContext(FlowQueryContext)
  const {id} = useContext(PipeContext)
  const scope = getPanelQueries(id)?.scope ?? {}
  const controller = useRef(new AbortController())

  useEffect(() => {
    return () => {
      try {
        // Cancelling active query so that there's no memory leak in this component when unmounting
        controller.current.abort()
      } catch (e) {
        // Do nothing
      }
    }
  }, [controller])

  useEffect(() => {
    if (!scope.region || !scope.org) {
      return
    }

    // TODO: cancel any active queries

    setLoading(RemoteDataState.Loading)

    const headers = {
      'Content-Type': 'application/json',
      'Accept-Encoding': 'gzip',
    }

    if (scope.token) {
      headers['Authorization'] = `Token ${scope.token}`
    }

    fetch(`${scope.region}/api/v2/buckets?limit=-1&orgID=${scope.org}`, {
      method: 'GET',
      headers,
      signal: controller.current.signal,
    })
      .then(response => {
        return response.json()
      })
      .then(response => {
        const bucks = response.buckets
          .map(bucket => ({
            id: bucket.id,
            orgID: bucket.orgID,
            type: bucket.type,
            name: bucket.name,
          }))
          .reduce(
            (acc, curr) => {
              if (curr.type === 'system') {
                acc.system.push(curr)
              } else {
                acc.user.push(curr)
              }
              return acc
            },
            {
              system: [],
              user: [],
              sample: [
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
              ],
            }
          )

        bucks.system.sort((a, b) =>
          `${a.name}`.toLowerCase().localeCompare(`${b.name}`.toLowerCase())
        )
        bucks.user.sort((a, b) =>
          `${a.name}`.toLowerCase().localeCompare(`${b.name}`.toLowerCase())
        )
        bucks.sample.sort((a, b) =>
          `${a.name}`.toLowerCase().localeCompare(`${b.name}`.toLowerCase())
        )
        setLoading(RemoteDataState.Done)
        setBuckets([...bucks.user, ...bucks.system, ...bucks.sample])
      })
      .catch(() => {})
  }, [scope.region, scope.org, controller])

  const addBucket = (bucket: Bucket) => {
    setBuckets([...buckets, bucket])
  }

  return useMemo(
    () => (
      <BucketContext.Provider value={{loading, buckets, addBucket}}>
        {children}
      </BucketContext.Provider>
    ),
    [loading, buckets]
  )
}
