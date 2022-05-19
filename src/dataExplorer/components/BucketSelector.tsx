import React, {FC, useContext, useState} from 'react'

// Components
import {ComponentStatus} from '@influxdata/clockface'
import SelectorTitle from 'src/dataExplorer/components/SelectorTitle'
import SearchableDropdown from 'src/shared/components/SearchableDropdown'

// Context
import {NewDataExplorerContext} from 'src/dataExplorer/context/newDataExplorer'
import {BucketContext} from 'src/shared/contexts/buckets'

const BucketSelector: FC = () => {
  const {selectedBucket, selectBucket} = useContext(NewDataExplorerContext)
  const {buckets} = useContext(BucketContext)
  const [searchTerm, setSearchTerm] = useState('')

  const handleSelectBucket = (option: string) => {
    selectBucket(option)
  }

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
