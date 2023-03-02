// Libraries
import React, {createContext, FC, useEffect, useMemo, useRef} from 'react'
import {createLocalStorageStateHook} from 'use-local-storage-state'
import {useSelector} from 'react-redux'

// Types
import {DBRP, getDbrps, GetDbrpsParams} from 'src/client'
import {QueryScope} from 'src/shared/contexts/query'
import {Organization, RemoteDataState} from 'src/types'

// Utilities
// import {getDbrpsForOrg} from 'src/shared/selectors/app'
import {getOrg} from 'src/organizations/selectors'

interface DBRPContextType {
  loading: RemoteDataState
  dbrps: DBRP[]
  refresh: () => void
}

const DEFAULT_CONTEXT: DBRPContextType = {
  loading: RemoteDataState.NotStarted,
  dbrps: [],
  refresh: () => {},
}

export const DBRPContext = createContext<DBRPContextType>(DEFAULT_CONTEXT)

const useLocalStorageState = createLocalStorageStateHook('dbrps', {})

interface Props {
  scope: QueryScope
}

export const DBRPProvider: FC<Props> = ({children, scope}) => {
  const org: Organization = useSelector(getOrg)
  const cacheKey = `${scope.region};;<${scope.org}>`
  const [dbrpCache, setDBRPCache] = useLocalStorageState()
  const loading = dbrpCache[cacheKey]?.loading ?? DEFAULT_CONTEXT.loading
  const dbrps = dbrpCache[cacheKey]?.dbrps ?? DEFAULT_CONTEXT.dbrps
  // TODO: lastFetch
  const controller = useRef<AbortController>(null)

  useEffect(() => {
    if (controller.current) {
      return () => {
        try {
          // Cancelling active query so that there's no memory leak
          // in this component when unmounting
          controller.current.abort()
        } catch (e) {
          // Do nothing
        }
      }
    }
  }, [controller])

  const updateCache = (update: any): void => {
    dbrpCache[cacheKey] = {
      ...dbrpCache[cacheKey],
      ...update,
    }
    setDBRPCache({...dbrpCache})
  }

  const fetchDBRPs = (): void => {
    if (controller.current) {
      controller.current.abort()
      controller.current = null
    } else {
      controller.current = new AbortController()
    }

    updateCache({loading: RemoteDataState.Loading})

    getDbrps({
      query: {
        orgID: org.id,
      },
    } as GetDbrpsParams)
      .then(resp => {
        if (resp.status !== 200) {
          throw new Error(resp.data.message)
        }

        console.log({data: resp.data})

        updateCache({
          loading: RemoteDataState.Done,
          dbrps: resp.data.content,
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

  const refresh = (): void => {
    fetchDBRPs()
  }

  return useMemo(
    () => (
      <DBRPContext.Provider value={{loading, dbrps, refresh}}>
        {children}
      </DBRPContext.Provider>
    ),
    [loading, dbrps]
  )
}
