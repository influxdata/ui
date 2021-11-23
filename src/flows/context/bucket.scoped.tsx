// Libraries
import React, {
  FC,
  createContext,
  useContext,
  useEffect,
  useState,
  useMemo,
} from 'react'

// Contexts
import {FlowQueryContext} from 'src/flows/context/flow.query'
import {PipeContext} from 'src/flows/context/pipe'

// Types
import {Bucket, RemoteDataState} from 'src/types'

interface BucketContextType {
  loading: RemoteDataState
  buckets: Bucket[]
}

const DEFAULT_CONTEXT: BucketContextType = {
  loading: RemoteDataState.NotStarted,
  buckets: [],
}

export const BucketContext = createContext<BucketContextType>(DEFAULT_CONTEXT)

export const BucketProvider: FC = ({children}) => {
  const [loading, setLoading] = useState(RemoteDataState.NotStarted)
  const [buckets, setBuckets] = useState<Bucket[]>([])
  const {getPanelQueries} = useContext(FlowQueryContext)
  const {id} = useContext(PipeContext)
  const scope = getPanelQueries(id)?.scope ?? {}

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

    fetch(`${scope.region}/api/v2/buckets?limit=100&orgID=${scope.org}`, {
      method: 'GET',
      headers,
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
  }, [scope.region, scope.org])

  return useMemo(
    () => (
      <BucketContext.Provider value={{loading, buckets}}>
        {children}
      </BucketContext.Provider>
    ),
    [loading, buckets]
  )
}
