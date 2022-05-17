import React, {FC, useCallback, useContext, useState} from 'react'

// Components
import {ComponentStatus} from '@influxdata/clockface'
import SelectorTitle from 'src/dataExplorer/components/SelectorTitle'
import SearchableDropdown from 'src/shared/components/SearchableDropdown'

// Context
import {NewDataExplorerContext} from 'src/dataExplorer/context/newDataExplorer'

const BucketSelector: FC = () => {
  const {data, updateData} = useContext(NewDataExplorerContext)
  const [searchTerm, setSearchTerm] = useState('')
  const selectedBucket = data?.bucket

  const buckets = [
    {type: 'sample', name: 'Air Sensor Data', id: 'airSensor'},
    {type: 'sample', name: 'Coinbase bitcoin price', id: 'bitcoin'},
    {type: 'sample', name: 'NOAA National Buoy Data', id: 'noaa'},
    {type: 'sample', name: 'USGS Earthquakes', id: 'usgs'},
  ]

  const handleSelectBucket = useCallback(
    (option: string) => {
      // TODO: reset measurement, tags and fields to null
      updateData({bucket: option})
    },
    [updateData, selectedBucket]
  )

  const handleChangeSearchTerm = (value: string) => {
    setSearchTerm(value)
  }

  return (
    <div>
      <SelectorTitle title="Bucket" info="Test info" />
      <SearchableDropdown
        searchTerm={searchTerm}
        searchPlaceholder="Search buckets"
        selectedOption={selectedBucket || 'Select bucket...'}
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
