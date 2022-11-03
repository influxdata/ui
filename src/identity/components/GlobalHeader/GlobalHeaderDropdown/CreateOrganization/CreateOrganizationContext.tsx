// Libraries
import React, {
  FC,
  createContext,
  ReactChild,
  useState,
  useEffect,
  useCallback,
} from 'react'

// Components
import {Cluster} from 'src/client/unityRoutes'

// Types
import {RemoteDataState} from 'src/types'

// Utils
import {createNewOrg, fetchClusterList} from 'src/identity/apis/org'
import {useSelector} from 'react-redux'
import {selectQuartzOrgs} from 'src/identity/selectors'

interface Props {
  children: ReactChild
}

export type ProviderID = 'AWS' | 'GCP' | 'Azure'
export type CreateOrgError =
  | null
  | 'NAME_CONFLICT'
  | 'UNAUTHORIZED'
  | 'SERVER_ERROR'
  | 'CLUSTERS_FETCH_ERROR'
  | 'GENERIC_ERROR'

export interface CreateOrgContextType {
  changeCreateOrgLoadingStatus: (_: RemoteDataState) => void
  changeCurrentProvider: (_: ProviderID) => void
  changeCurrentRegion: (_: string) => void
  changeOrgName: (_: string) => void
  clusters: ClusterMap
  createOrg: () => Promise<void>
  createOrgLoadingStatus: RemoteDataState
  currentRegion: string
  currentProvider: ProviderID
  error: CreateOrgError
  orgName: string
  setError: (_: CreateOrgError) => void
}

export const DEFAULT_CREATE_ORG_CONTEXT: CreateOrgContextType = {
  changeCreateOrgLoadingStatus: (_: RemoteDataState) => null,
  changeCurrentProvider: (_: ProviderID) => null,
  changeCurrentRegion: (_: string) => null,
  changeOrgName: (_: string) => null,
  clusters: {},
  createOrg: () => null,
  createOrgLoadingStatus: RemoteDataState.NotStarted,
  currentRegion: '',
  currentProvider: null,
  error: null,
  orgName: '',
  setError: (_: CreateOrgError) => null,
}

export const CreateOrgContext = createContext<CreateOrgContextType>(
  DEFAULT_CREATE_ORG_CONTEXT
)

interface ClusterMap {
  [providerId: string]: Cluster[]
}

export const CreateOrgProvider: FC<Props> = ({children}) => {
  const quartzOrganizations = useSelector(selectQuartzOrgs)
  const [orgName, setOrgName] = useState(DEFAULT_CREATE_ORG_CONTEXT.orgName)
  const [clusters, setClusters] = useState<ClusterMap>(
    DEFAULT_CREATE_ORG_CONTEXT.clusters
  )
  const [currentProvider, setCurrentProvider] = useState<ProviderID>(
    DEFAULT_CREATE_ORG_CONTEXT.currentProvider
  )
  const [currentRegion, setCurrentRegion] = useState<string>(
    DEFAULT_CREATE_ORG_CONTEXT.currentRegion
  )
  const [error, setError] = useState(DEFAULT_CREATE_ORG_CONTEXT.error)

  const [createOrgLoadingStatus, setCreateOrgLoadingStatus] =
    useState<RemoteDataState>(RemoteDataState.NotStarted)

  const changeCurrentProvider = useCallback(
    (provider: ProviderID) => {
      setCurrentProvider(provider)
    },
    [setCurrentProvider]
  )

  const changeCurrentRegion = useCallback(
    (region: string) => {
      setCurrentRegion(region)
    },
    [setCurrentRegion]
  )

  const createOrg = useCallback((): Promise<void> => {
    if (createOrgLoadingStatus === RemoteDataState.Loading) {
      return new Promise(resolve => resolve(null))
    }

    setCreateOrgLoadingStatus(RemoteDataState.Loading)
    return createNewOrg({
      orgName,
      provider: currentProvider,
      region: currentRegion,
    }).then(() => {
      setCreateOrgLoadingStatus(RemoteDataState.Done)
    })
  }, [orgName, createOrgLoadingStatus, currentProvider, currentRegion])

  const changeCreateOrgLoadingStatus = useCallback(
    (status: RemoteDataState) => {
      setCreateOrgLoadingStatus(status)
    },
    [setCreateOrgLoadingStatus]
  )

  useEffect(() => {
    fetchClusterList()
      .then(clusterData => {
        if (clusterData.length < 1) {
          setCreateOrgLoadingStatus(RemoteDataState.Error)
          setError('CLUSTERS_FETCH_ERROR')
          return
        }
        const initialMap: ClusterMap = {}
        const clusterMap = clusterData.reduce((previousMap, currentItem) => {
          if (!previousMap?.[currentItem.providerId]) {
            previousMap[currentItem.providerId] = []
          }
          previousMap[currentItem.providerId].push(currentItem)

          return previousMap
        }, initialMap)
        const providers = Object.keys(clusterMap)
        providers.forEach(providerId => {
          clusterMap[providerId] = clusterMap[providerId].sort(
            (a, b) => a.priority - b.priority
          )
        })
        setClusters(clusterMap)
        if (!!providers.length) {
          setCurrentProvider(providers[0] as ProviderID)
          setCurrentRegion(clusterMap[providers[0]][0].regionId)
        }
      })
      .catch(() => {
        setCreateOrgLoadingStatus(RemoteDataState.Error)
        setError('CLUSTERS_FETCH_ERROR')
      })
  }, [])

  const changeOrgName = useCallback(
    (name: string) => {
      setOrgName(name)
      if (quartzOrganizations.orgs.find(org => org.name === name)) {
        setCreateOrgLoadingStatus(RemoteDataState.Error)
        setError('NAME_CONFLICT')
      } else {
        setCreateOrgLoadingStatus(RemoteDataState.NotStarted)
        setError(null)
      }
    },
    [quartzOrganizations.orgs]
  )

  return (
    <CreateOrgContext.Provider
      value={{
        changeCreateOrgLoadingStatus,
        changeCurrentProvider,
        changeCurrentRegion,
        changeOrgName,
        clusters,
        createOrg,
        createOrgLoadingStatus,
        currentRegion,
        currentProvider,
        error,
        orgName,
        setError,
      }}
    >
      {children}
    </CreateOrgContext.Provider>
  )
}
