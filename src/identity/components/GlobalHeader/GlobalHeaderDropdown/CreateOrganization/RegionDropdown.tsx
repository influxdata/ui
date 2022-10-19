import React, {FC, useCallback, useMemo} from 'react'
import {ComponentStatus, Dropdown} from '@influxdata/clockface'

// Components
import {Cluster} from 'src/client/unityRoutes'

const SINGLE_PROVIDER_WIDTH = 375

interface Props {
  clusters: any
  currentProvider: any
  currentRegion: any
  setCurrentRegion: any
}

export const RegionDropdown: FC<Props> = ({
  clusters,
  currentProvider,
  currentRegion,
  setCurrentRegion,
}) => {
  const handleRegionChange = useCallback(
    region => {
      setCurrentRegion(region)
    },
    [setCurrentRegion]
  )
  const regions = useMemo(() => {
    return clusters?.[currentProvider]
  }, [clusters, currentProvider])

  const clustersLength = Object.keys(clusters).length
  const dropdownStyle = {}
  if (clustersLength === 1) {
    dropdownStyle['width'] = SINGLE_PROVIDER_WIDTH
  }

  return (
    <Dropdown
      style={dropdownStyle}
      button={(active, onClick) => (
        <Dropdown.Button
          status={
            !!clustersLength
              ? ComponentStatus.Default
              : ComponentStatus.Disabled
          }
          active={active}
          onClick={onClick}
          testID="variable-type-dropdown--button"
        >
          {
            regions?.find(region => region.regionId === currentRegion)
              ?.regionName
          }
        </Dropdown.Button>
      )}
      menu={onCollapse => (
        <Dropdown.Menu onCollapse={onCollapse}>
          {regions?.map((cluster: Cluster) => (
            <Dropdown.Item
              key={cluster.regionId}
              id={cluster.regionId}
              value={cluster.regionId}
              onClick={handleRegionChange}
              testID={`variable-type-dropdown-${cluster.regionId}`}
              selected={currentRegion === cluster.regionId}
            >
              {cluster.regionName}
            </Dropdown.Item>
          ))}
        </Dropdown.Menu>
      )}
    />
  )
}
