// Libraries
import React, {
  FC,
  createContext,
  useEffect,
  useState,
  useMemo,
  useRef,
} from 'react'
import {useSelector} from 'react-redux'
import {getSortedBuckets} from 'src/buckets/selectors'

// Contexts

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
const SAMPLE_BUCKETS: any = [
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

export const BucketProvider: FC = ({children}) => {
  const [loading, setLoading] = useState(RemoteDataState.NotStarted)
  const [buckets, setBuckets] = useState<Bucket[]>([])
  const controller = useRef(new AbortController())
  const allBuckets = useSelector(getSortedBuckets)

  useEffect(() => {
    if (buckets.length) {
      return
    }

    setLoading(RemoteDataState.Loading)

    const tempBuckets = allBuckets.map(bucket => {
      return {
        id: bucket.id,
        name: bucket.name,
        orgID: bucket.orgID,
        type: bucket.type,
      }
    })

    setLoading(RemoteDataState.Done)
    setBuckets([...tempBuckets, ...SAMPLE_BUCKETS])
  }, [buckets, allBuckets])

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
