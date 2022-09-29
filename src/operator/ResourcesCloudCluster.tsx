import {
  ComponentColor,
  DropdownMenuTheme,
  MultiSelectDropdown,
} from '@influxdata/clockface'
import React, {FC, useContext} from 'react'
import {OperatorContext} from './context/operator'
import {getRegions} from './utils'

const ResourcesCloudCluster: FC = () => {
  const {providerInfo, providers, regions, setProviders, setRegions} =
    useContext(OperatorContext)

  const hasSelectedProvider = providers.length > 0

  const providerOptions = providerInfo.providers.map(p => p.provider)
  const regionOptions: string[] = providers
    .flatMap(p => getRegions(p, providerInfo.regions))
    .map(r => r.region)

  const handleSelectProvider = (selectedOption: string): void => {
    setRegions([])
    providers.includes(selectedOption)
      ? setProviders(prev =>
          prev.filter(provider => provider !== selectedOption)
        )
      : setProviders(prev => [selectedOption, ...prev])
  }

  const handleSelectRegion = (selectedOption: string): void =>
    regions.includes(selectedOption)
      ? setRegions(prev => prev.filter(region => region !== selectedOption))
      : setRegions(prev => [selectedOption, ...prev])

  return (
    <>
      <MultiSelectDropdown
        style={providersStyle}
        options={providerOptions}
        selectedOptions={providers}
        onSelect={handleSelectProvider}
        menuTheme={DropdownMenuTheme.Onyx}
        emptyText="Cloud Provider"
        buttonColor={ComponentColor.Primary}
      />
      {hasSelectedProvider && (
        <MultiSelectDropdown
          style={regionsStyle}
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

const providersStyle = {width: '220px', marginRight: '10px'}
const regionsStyle = {width: '220px', marginRight: '20px'}

export default ResourcesCloudCluster
