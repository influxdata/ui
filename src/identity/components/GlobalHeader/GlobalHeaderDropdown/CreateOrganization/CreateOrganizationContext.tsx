// Libraries
import React, {
  FC,
  createContext,
  ReactChild,
  useState,
  useEffect,
  useCallback,
} from 'react'
import {Cluster} from 'src/client/unityRoutes'
import {createNewOrg, fetchClusterList} from 'src/identity/apis/org'
import {RemoteDataState} from 'src/types'

// Types

// Utils

interface Props {
  children: ReactChild
}

export type ProviderID = 'AWS' | 'GCP' | 'Azure'

export interface CreateOrgContextType {
  orgName: string
  changeOrgName: (_: string) => void
  clusters: ClusterMap
  currentProvider: ProviderID
  changeCurrentProvider: (_: ProviderID) => void
  currentRegion: string
  changeCurrentRegion: (_: string) => void
  createOrgLoadingStatus: RemoteDataState
  changeCreateOrgLoadingStatus: (_: RemoteDataState) => void
  createOrg: () => Promise<void>
}

export const DEFAULT_CREATE_ORG_CONTEXT: CreateOrgContextType = {
  orgName: '',
  changeOrgName: (_: string) => null,
  clusters: {},
  currentProvider: null,
  changeCurrentProvider: (_: ProviderID) => null,
  currentRegion: '',
  changeCurrentRegion: (_: string) => null,
  createOrgLoadingStatus: RemoteDataState.NotStarted,
  changeCreateOrgLoadingStatus: (_: RemoteDataState) => null,
  createOrg: () => null,
}

export const CreateOrgContext = createContext<CreateOrgContextType>(
  DEFAULT_CREATE_ORG_CONTEXT
)

interface ClusterMap {
  // TODO(Subir): This is requiring me to use string. One option is to make it an enum and change all the InstallDependencies.
  // The other option is to keep it a string and cast it as ProviderID in 1 place
  [providerId: string]: Cluster[]
}

// TODO(Subir): Remove this before committing
// const FAKE_AWS: Cluster[] = [
//   {
//     isBeta: false,
//     isProviderAvailable: true,
//     isRegionAvailable: true,
//     priority: 2,
//     providerId: 'AWS',
//     providerName: 'Amazon Web Services',
//     regionId: 'ap-southeast-2',
//     regionName: 'Asia Pacific (Australia)',
//   },
//   {
//     isBeta: false,
//     isProviderAvailable: true,
//     isRegionAvailable: true,
//     priority: 4,
//     providerId: 'AWS',
//     providerName: 'Amazon Web Services',
//     regionId: 'eu-central-1',
//     regionName: 'EU Frankfurt',
//   },
//   {
//     isBeta: false,
//     isProviderAvailable: true,
//     isRegionAvailable: true,
//     priority: 1,
//     providerId: 'AWS',
//     providerName: 'Amazon Web Services',
//     regionId: 'us-east-1',
//     regionName: 'US East (N. Virginia)',
//   },
//   {
//     isBeta: false,
//     isProviderAvailable: true,
//     isRegionAvailable: false,
//     priority: 2,
//     providerId: 'AWS',
//     providerName: 'Amazon Web Services',
//     regionId: 'us-east-1-2',
//     regionName: 'US East (N. Virginia) 2',
//   },
//   {
//     isBeta: false,
//     isProviderAvailable: true,
//     isRegionAvailable: false,
//     priority: 1,
//     providerId: 'AWS',
//     providerName: 'Amazon Web Services',
//     regionId: 'us-east-2',
//     regionName: 'US East (Ohio)',
//   },
//   {
//     isBeta: false,
//     isProviderAvailable: true,
//     isRegionAvailable: false,
//     priority: 3,
//     providerId: 'AWS',
//     providerName: 'Amazon Web Services',
//     regionId: 'us-west-2',
//     regionName: 'US West (Oregon)',
//   },
//   {
//     isBeta: false,
//     isProviderAvailable: true,
//     isRegionAvailable: true,
//     priority: 3,
//     providerId: 'AWS',
//     providerName: 'Amazon Web Services',
//     regionId: 'us-west-2-2',
//     regionName: 'US West (Oregon)',
//   },
// ]
// const FAKE_AZURE: Cluster[] = [
//   {
//     isBeta: false,
//     isProviderAvailable: true,
//     isRegionAvailable: true,
//     priority: 1,
//     providerId: 'Azure',
//     providerName: 'Microsoft Azure',
//     regionId: 'eastus',
//     regionName: 'Virginia',
//   },
//   {
//     isBeta: false,
//     isProviderAvailable: true,
//     isRegionAvailable: true,
//     priority: 2,
//     providerId: 'Azure',
//     providerName: 'Microsoft Azure',
//     regionId: 'westeurope',
//     regionName: 'Amsterdam',
//   },
// ]
// const FAKE_GCP: Cluster[] = [
//   {
//     isBeta: false,
//     isProviderAvailable: true,
//     isRegionAvailable: true,
//     priority: 1,
//     providerId: 'GCP',
//     providerName: 'Google Cloud',
//     regionId: 'eu-west1',
//     regionName: 'Belgium',
//   },
//   {
//     isBeta: false,
//     isProviderAvailable: true,
//     isRegionAvailable: true,
//     priority: 2,
//     providerId: 'GCP',
//     providerName: 'Google Cloud',
//     regionId: 'us-central1',
//     regionName: 'Iowa',
//   },
//   {
//     isBeta: false,
//     isProviderAvailable: true,
//     isRegionAvailable: true,
//     priority: 98,
//     providerId: 'GCP',
//     providerName: 'Google Cloud',
//     regionId: 'us-central1-2',
//     regionName: 'Iowa 2',
//   },
//   {
//     isBeta: false,
//     isProviderAvailable: true,
//     isRegionAvailable: true,
//     priority: 99,
//     providerId: 'GCP',
//     providerName: 'Google Cloud',
//     regionId: 'us-west1',
//     regionName: 'Oregon',
//   },
// ]
// const FAKE_CLUSTERS: Cluster[] = [...FAKE_AWS, ...FAKE_AZURE, ...FAKE_GCP]

export const CreateOrgProvider: FC<Props> = ({children}) => {
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
    })
      .then(() => {
        setCreateOrgLoadingStatus(RemoteDataState.Done)
      })
      .catch(e => {
        setCreateOrgLoadingStatus(RemoteDataState.Error)

        throw e
      })
  }, [orgName, createOrgLoadingStatus, currentProvider, currentRegion])

  const changeCreateOrgLoadingStatus = useCallback(
    (status: RemoteDataState) => {
      setCreateOrgLoadingStatus(status)
    },
    [setCreateOrgLoadingStatus]
  )

  useEffect(() => {
    fetchClusterList().then(clusterData => {
      // setClusters(r?.data)
      // r
      // let clusterData = r.data
      // clusterData = FAKE_CLUSTERS

      const clusterMap = clusterData.reduce((acc, curr) => {
        if (!acc?.[curr.providerId]) {
          acc[curr.providerId] = []
        }
        acc[curr.providerId].push(curr)

        return acc
      }, {} as ClusterMap)
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
  }, [])

  const changeOrgName = useCallback(
    (name: string) => {
      setOrgName(name)
    },
    [setOrgName]
  )

  return (
    <CreateOrgContext.Provider
      value={{
        orgName,
        changeOrgName,
        clusters,
        currentProvider,
        changeCurrentProvider,
        currentRegion,
        changeCurrentRegion,
        createOrgLoadingStatus,
        changeCreateOrgLoadingStatus,
        createOrg,
      }}
    >
      {children}
    </CreateOrgContext.Provider>
  )
}
