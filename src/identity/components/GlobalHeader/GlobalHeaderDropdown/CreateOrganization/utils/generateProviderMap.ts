import {Cluster} from 'src/client/unityRoutes'

export const generateProviderMap = (clusterArr: Cluster[]) => {
  const providerMap = {}

  clusterArr.forEach(cluster => {
    const {providerId} = cluster
    if (!providerMap[providerId]) {
      providerMap[providerId] = [cluster]
    } else {
      providerMap[providerId].push(cluster)
    }
  })
  for (const provider in providerMap) {
    providerMap[provider].sort(
      (a: Cluster, b: Cluster) => a.priority - b.priority
    )
  }

  return providerMap
}
