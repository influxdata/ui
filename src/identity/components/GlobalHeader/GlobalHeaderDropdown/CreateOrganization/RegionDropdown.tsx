// Libraries
import React, {FC} from 'react'
import {Dropdown} from '@influxdata/clockface'

// Types
import {Cluster} from 'src/client/unityRoutes'

interface Props {
  currentRegion: string
  regions: Cluster[]
  setCurrentRegion: (regionID: string) => void
}

export const RegionDropdown: FC<Props> = ({
  currentRegion,
  regions,
  setCurrentRegion,
}) => {
  const button = (
    active: boolean,
    onClick: (evt: React.MouseEvent<HTMLElement, MouseEvent>) => void
  ) => (
    <Dropdown.Button
      active={active}
      onClick={onClick}
      testID="region-list-dropdown--button"
    >
      {
        regions?.find((cluster: Cluster) => cluster.regionId === currentRegion)
          ?.regionName
      }
    </Dropdown.Button>
  )

  const menu = (onCollapse: () => void) => (
    <Dropdown.Menu onCollapse={onCollapse}>
      {regions.map((cluster: Cluster) => (
        <Dropdown.Item
          key={cluster.regionId}
          id={cluster.regionId}
          value={cluster.regionId}
          onClick={setCurrentRegion}
          testID={`region-list-dropdown--${cluster.regionId}`}
          selected={currentRegion === cluster.regionId}
        >
          {cluster.regionName}
        </Dropdown.Item>
      ))}
    </Dropdown.Menu>
  )

  return <Dropdown button={button} menu={menu} />
}
