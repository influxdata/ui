import React, {FC, useContext, useState} from 'react'

// Components
import {ComponentStatus} from '@influxdata/clockface'
import SelectorTitle from 'src/dataExplorer/components/SelectorTitle'
import SearchableDropdown from 'src/shared/components/SearchableDropdown'

// Contexts
import {NewDataExplorerContext} from 'src/dataExplorer/context/newDataExplorer'
import {BucketContext} from 'src/shared/contexts/buckets'

const BUCKET_TOOLTIP = `A bucket is a named location where time series data \
is stored. You can think of a bucket like you would a database in SQL systems.`

const BucketSelector: FC = () => {
  const {selectedBucket, selectBucket} = useContext(NewDataExplorerContext)
  const {buckets} = useContext(BucketContext)
  const [searchTerm, setSearchTerm] = useState('')

  const handleSelectBucket = (name: string) => {
    const bucket = buckets.find(b => b.name === name)
    if (!bucket) {
      return
    }
    selectBucket(bucket)
  }

  const handleChangeSearchTerm = (value: string) => {
    setSearchTerm(value)
  }

  return (
    <div>
      <SelectorTitle title="Bucket" info={BUCKET_TOOLTIP} />
      <SearchableDropdown
        searchTerm={searchTerm}
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
      />
    </div>
  )
}

export default BucketSelector
