import React, {FC, useCallback, useContext, useMemo} from 'react'
import {Dropdown} from '@influxdata/clockface'

// Components
import {CreateOrgContext} from 'src/identity/components/GlobalHeader/GlobalHeaderDropdown/CreateOrganization/CreateOrganizationContext'
import {Cluster} from 'src/client/unityRoutes'

const SINGLE_PROVIDER_WIDTH = 375

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

  const dropdownStyle = {}
  if (Object.keys(clusters).length === 1) {
    dropdownStyle['width'] = SINGLE_PROVIDER_WIDTH
  }

  return (
    <Dropdown
      style={dropdownStyle}
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
