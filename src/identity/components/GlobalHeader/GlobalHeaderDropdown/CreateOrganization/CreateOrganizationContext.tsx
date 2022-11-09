// Libraries
import React, {
  createContext,
  FC,
  ReactChild,
  useCallback,
  useEffect,
  useState,
} from 'react'

// Components
import {Cluster, OrganizationCreateRequest} from 'src/client/unityRoutes'

// Types
import {RemoteDataState} from 'src/types'

// Utils
import {createNewOrg, fetchClusterList} from 'src/identity/apis/org'
import {selectCurrentAccountId, selectQuartzOrgs} from 'src/identity/selectors'
import {useDispatch, useSelector} from 'react-redux'
import {getQuartzOrganizationsThunk} from 'src/identity/quartzOrganizations/actions/thunks'

export type ProviderIDs = OrganizationCreateRequest['provider']

interface Props {
  children: ReactChild
}

export enum CreateOrgError {
  NameConflict = 'name-conflict',
  Unauthorized = 'unauthorized',
  ServerError = 'server-error',
  ClustersFetchError = 'clusters-fetch-error',
  GenericError = 'generic-error',
}

export interface CreateOrgContextType {
  changeCreateOrgLoadingStatus: (status: RemoteDataState) => void
  changeCurrentProvider: (providerId: ProviderIDs) => void
  changeCurrentRegion: (regionId: string) => void
  changeOrgName: (name: string) => void
  clusters: ClusterMap
  createOrg: () => Promise<void>
  createOrgLoadingStatus: RemoteDataState
  currentRegion: string
  currentProvider: ProviderIDs
  error: CreateOrgError
  orgName: string
  setError: (err: CreateOrgError) => void
}

export const DEFAULT_CREATE_ORG_CONTEXT: CreateOrgContextType = {
  changeCreateOrgLoadingStatus: (_: RemoteDataState) => null,
  changeCurrentProvider: (_: ProviderIDs) => null,
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

type ClusterMap = {
  [providerId in ProviderIDs]?: Cluster[]
}

export const CreateOrgProvider: FC<Props> = ({children}) => {
  const accountId = useSelector(selectCurrentAccountId)
  const quartzOrganizations = useSelector(selectQuartzOrgs)
  const dispatch = useDispatch()

  const [orgName, setOrgName] = useState(DEFAULT_CREATE_ORG_CONTEXT.orgName)
  const [clusters, setClusters] = useState<ClusterMap>(
    DEFAULT_CREATE_ORG_CONTEXT.clusters
  )
  const [currentProvider, setCurrentProvider] = useState<ProviderIDs>(
    DEFAULT_CREATE_ORG_CONTEXT.currentProvider
  )
  const [currentRegion, setCurrentRegion] = useState<string>(
    DEFAULT_CREATE_ORG_CONTEXT.currentRegion
  )
  const [error, setError] = useState(DEFAULT_CREATE_ORG_CONTEXT.error)

  useEffect(() => {
    if (quartzOrganizations.status === RemoteDataState.NotStarted) {
      dispatch(getQuartzOrganizationsThunk(accountId))
    }
  }, [accountId, dispatch, quartzOrganizations.status])

  const [createOrgLoadingStatus, setCreateOrgLoadingStatus] =
    useState<RemoteDataState>(RemoteDataState.NotStarted)

  const changeCurrentProvider = useCallback(
    (providerId: ProviderIDs) => {
      setCurrentProvider(providerId)
    },
    [setCurrentProvider]
  )

  const changeCurrentRegion = useCallback(
    (regionId: string) => {
      setCurrentRegion(regionId)
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
      .then((clusterData: Cluster[]) => {
        if (clusterData.length < 1) {
          setCreateOrgLoadingStatus(RemoteDataState.Error)
          setError(CreateOrgError.ClustersFetchError)
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

        const providers = Object.keys(clusterMap) as ProviderIDs[]
        providers.forEach(providerId => {
          clusterMap[providerId] = clusterMap[providerId].sort(
            (a, b) => a.priority - b.priority
          )
        })
        setClusters(clusterMap)
        if (!!providers.length) {
          setCurrentProvider(providers[0])
          setCurrentRegion(clusterMap[providers[0]][0].regionId)
        }
      })
      .catch(() => {
        setCreateOrgLoadingStatus(RemoteDataState.Error)
        setError(CreateOrgError.ClustersFetchError)
      })
  }, [])

  const changeOrgName = useCallback(
    (name: string) => {
      setOrgName(name)
      if (quartzOrganizations.orgs.find(org => org.name === name)) {
        setCreateOrgLoadingStatus(RemoteDataState.Error)
        setError(CreateOrgError.NameConflict)
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
