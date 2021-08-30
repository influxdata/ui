// Libraries
import React, {FC, createContext, useContext, useEffect, useState} from 'react'

// Contexts
import {FlowQueryContext} from 'src/flows/context/flow.query'

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

interface Props {
  panel: string
}

export const BucketProvider: FC<Props> = ({panel, children}) => {
  const [loading, setLoading] = useState(RemoteDataState.NotStarted)
  const [buckets, setBuckets] = useState<Bucket[]>([])
  const {getPanelQueries} = useContext(FlowQueryContext)
  const {scope} = getPanelQueries(panel)

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
            {system: [], user: []}
          )

        bucks.system.sort((a, b) =>
          `${a.name}`.toLowerCase().localeCompare(`${b.name}`.toLowerCase())
        )
        bucks.user.sort((a, b) =>
          `${a.name}`.toLowerCase().localeCompare(`${b.name}`.toLowerCase())
        )
        setLoading(RemoteDataState.Done)
        setBuckets([...bucks.user, ...bucks.system])
      })
  }, [scope.region, scope.org])

  return (
    <BucketContext.Provider value={{loading, buckets}}>
      {children}
    </BucketContext.Provider>
  )
}
