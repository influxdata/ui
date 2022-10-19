import React, {FC, useCallback, useContext, useMemo} from 'react'
import {Dropdown} from '@influxdata/clockface'

// Style
import './ProviderChooser.scss'

// Components
import {CreateOrgContext} from 'src/identity/components/GlobalHeader/GlobalHeaderDropdown/CreateOrganization/CreateOrganizationContext'
import {Cluster} from 'src/client/unityRoutes'

export const RegionDropdown: FC = () => {
  const {clusters, currentProvider, currentRegion, changeCurrentRegion} =
    useContext(CreateOrgContext)
  const handleRegionChange = useCallback(
    region => {
      changeCurrentRegion(region)
    },
    [changeCurrentRegion]
  )
  const regions = useMemo(() => {
    return clusters?.[currentProvider]
  }, [clusters, currentProvider])

  return (
    <Dropdown
      button={(active, onClick) => (
        <Dropdown.Button
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
          {regions?.map((c: Cluster) => (
            <Dropdown.Item
              key={c.regionId}
              id={c.regionId}
              value={c.regionId}
              onClick={handleRegionChange}
              testID={`variable-type-dropdown-${c.regionId}`}
              selected={currentRegion === c.regionId}
            >
              {c.regionName}
            </Dropdown.Item>
          ))}
        </Dropdown.Menu>
      )}
    />
  )
}
