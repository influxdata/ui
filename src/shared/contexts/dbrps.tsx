// Libraries
import React, {createContext, FC, useEffect, useMemo, useRef} from 'react'
import {createLocalStorageStateHook} from 'use-local-storage-state'

// Types
import {DBRP, getDbrps, GetDbrpsParams} from 'src/client'
import {QueryScope} from 'src/shared/contexts/query'
import {RemoteDataState} from 'src/types'

interface DBRPContextType {
  loading: RemoteDataState
  dbrps: DBRP[]
}

const DEFAULT_CONTEXT: DBRPContextType = {
  loading: RemoteDataState.NotStarted,
  dbrps: [],
}

export const DBRPContext = createContext<DBRPContextType>(DEFAULT_CONTEXT)

const DBRP_LOCAL_STORAGE_KEY = 'dbrps'
const useLocalStorageState = createLocalStorageStateHook(
  DBRP_LOCAL_STORAGE_KEY,
  {}
)

interface Props {
  scope: QueryScope
}

export const DBRPProvider: FC<Props> = ({children, scope}) => {
  const cacheKey = `${scope.region};;<${scope.org}>`
  const [dbrpCache, setDBRPCache] = useLocalStorageState()
  const dbrps = dbrpCache[cacheKey]?.dbrps ?? DEFAULT_CONTEXT.dbrps
  const lastFetch = dbrpCache[cacheKey]?.lastFetch ?? 0
  const loading = dbrpCache[cacheKey]?.loading ?? DEFAULT_CONTEXT.loading
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

  // make sure to fetch dbrps on mount
  useEffect(() => {
    const TWELVE_HOURS = 12 * 60 * 60 * 1000
    if (Date.now() - lastFetch > TWELVE_HOURS) {
      fetchDBRPs()
    } else if (loading === RemoteDataState.NotStarted) {
      fetchDBRPs()
    }

    return () => {
      // reset the dbrp in local storage on ummount
      // using `window.localStorage` since `createLocalStorageStateHook` has a bug
      // to set local storage to an empty {}
      window.localStorage.setItem(DBRP_LOCAL_STORAGE_KEY, JSON.stringify({}))
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

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
        orgID: scope.org,
      },
    } as GetDbrpsParams)
      .then(resp => {
        if (resp.status !== 200) {
          throw new Error(resp.data.message)
        }

        updateCache({
          loading: RemoteDataState.Done,
          lastFetch: Date.now(),
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

  return useMemo(
    () => (
      <DBRPContext.Provider value={{loading, dbrps}}>
        {children}
      </DBRPContext.Provider>
    ),
    [loading, dbrps, children]
  )
}
