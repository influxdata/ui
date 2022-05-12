import React, {FC} from 'react'

// Components
import {ComponentStatus} from '@influxdata/clockface'
import SearchableDropdown from 'src/shared/components/SearchableDropdown'

const BucketSelector: FC = () => {
  const buckets = [
    {type: 'sample', name: 'Air Sensor Data', id: 'airSensor'},
    {type: 'sample', name: 'Coinbase bitcoin price', id: 'bitcoin'},
    {type: 'sample', name: 'NOAA National Buoy Data', id: 'noaa'},
    {type: 'sample', name: 'USGS Earthquakes', id: 'usgs'},
  ]

  return (
    <SearchableDropdown
      searchTerm="" // TODO: variable
      searchPlaceholder="Search buckets"
      selectedOption="Select bucket..." // TODO
      onSelect={option => console.log(option)}
      onChangeSearchTerm={value => console.log(value)}
      options={[1, 2, 3]}
      buttonStatus={ComponentStatus.Default}
      testID="bucket-selector--dropdown"
      buttonTestID="bucket-selector--dropdown-button"
      menuTestID="bucket-selector--dropdown-menu"
      emptyText="No Buckets Found"
      iconOn={true}
    />
  )
}

export default BucketSelector
