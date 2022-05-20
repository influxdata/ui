import {
  ComponentColor,
  DropdownMenuTheme,
  MultiSelectDropdown,
} from '@influxdata/clockface'
import React, {FC, useContext} from 'react'
import {OperatorContext} from './context/operator'
import {OperatorRegions} from 'src/types'

const ResourcesCloudProvider: FC = () => {
  const {
    providerInfo,
    providers,
    regions,
    setProviders,
    setRegions,
  } = useContext(OperatorContext)

  const hasSelectedProvider = providers.length > 0

  const availableRegions: OperatorRegions = providers
    .map(p => getRegions(p, providerInfo.regions))
    .flat()

  const providerOptions = providerInfo.providers.map(p => p.provider)
  const regionOptions = availableRegions.flat().map(r => r.region)

  const handleSelectProvider = (selectedOption: string): void => {
    setRegions([])
    providers.includes(selectedOption)
      ? setProviders(prev => prev.filter(x => x !== selectedOption))
      : setProviders(prev => [selectedOption, ...prev])
  }

  const handleSelectRegion = (selectedOption: string): void =>
    regions.includes(selectedOption)
      ? setRegions(prev => prev.filter(x => x !== selectedOption))
      : setRegions(prev => [selectedOption, ...prev])

  return (
    <>
      <MultiSelectDropdown
        style={{width: '220px', marginRight: '10px'}}
        options={providerOptions}
        selectedOptions={providers}
        onSelect={handleSelectProvider}
        menuTheme={DropdownMenuTheme.Onyx}
        emptyText="Cloud Provider"
        buttonColor={ComponentColor.Primary}
      />
      {hasSelectedProvider && (
        <MultiSelectDropdown
          style={{width: '220px', marginRight: '20px'}}
          options={regionOptions}
          selectedOptions={regions}
          onSelect={handleSelectRegion}
          menuTheme={DropdownMenuTheme.Onyx}
          emptyText="Cloud Region"
          buttonColor={ComponentColor.Primary}
        />
      )}
    </>
  )
}

const getRegions = (
  provider: string,
  regions: {
    Azure?: OperatorRegions
    AWS?: OperatorRegions
    GCP?: OperatorRegions
  }
) => {
  switch (provider) {
    case 'Azure':
      return regions.Azure
    case 'AWS':
      return regions.AWS
    case 'GCP':
      return regions.GCP
    default:
      return []
  }
}

export default ResourcesCloudProvider
