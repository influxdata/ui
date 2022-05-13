import React, {FC, useState} from 'react'

// Components
import {ComponentStatus} from '@influxdata/clockface'
import SelectorTitle from 'src/dataExplorer/components/SelectorTitle'
import SearchableDropdown from 'src/shared/components/SearchableDropdown'

const BucketSelector: FC = () => {
  // TODO: change to context later
  const [selectedBucket, setSelectedBucket] = useState(null)

  const buckets = [
    {type: 'sample', name: 'Air Sensor Data', id: 'airSensor'},
    {type: 'sample', name: 'Coinbase bitcoin price', id: 'bitcoin'},
    {type: 'sample', name: 'NOAA National Buoy Data', id: 'noaa'},
    {type: 'sample', name: 'USGS Earthquakes', id: 'usgs'},
  ]

  const handleSelectBucket = (option: string) => {
    const selected = buckets.find(b => b.name === option)
    setSelectedBucket(selected)
  }

  const handleChangeSearchTerm = (value: string) => {
    // TODO
    /* eslint-disable no-console */
    console.log(value)
    /* eslint-disable no-console */
  }

  return (
    <div>
      <SelectorTitle title="Bucket" />
      <SearchableDropdown
        searchTerm="" // TODO: variable
        searchPlaceholder="Search buckets"
        selectedOption={selectedBucket?.name || 'Select bucket...'}
        onSelect={handleSelectBucket}
        onChangeSearchTerm={handleChangeSearchTerm}
        options={buckets.map(b => b.name)}
        buttonStatus={ComponentStatus.Default}
        testID="bucket-selector--dropdown"
        buttonTestID="bucket-selector--dropdown-button"
        menuTestID="bucket-selector--dropdown-menu"
        emptyText="No Buckets Found"
        iconOn={true}
      />
    </div>
  )
}

export default BucketSelector
