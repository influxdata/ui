import React, {FC, useContext, useMemo, useState} from 'react'

// Components
import {ComponentStatus} from '@influxdata/clockface'
import SelectorTitle from 'src/dataExplorer/components/SelectorTitle'
import SearchableDropdown from 'src/shared/components/SearchableDropdown'

// Context
import {NewDataExplorerContext} from 'src/dataExplorer/context/newDataExplorer'

const MeasurementSelector: FC = () => {
  const {
    measurements,
    selectedBucket,
    selectedMeasurement,
    selectMeasurement,
  } = useContext(NewDataExplorerContext)
  const [searchTerm, setSearchTerm] = useState('')

  const handleSelect = (option: string): void => {
    selectMeasurement(option)
  }

  const handleChangeSearchTerm = (value: string) => {
    setSearchTerm(value)
  }

  return useMemo(() => {
    if (!selectedBucket) {
      return null
    }

    return (
      <div>
        <SelectorTitle title="Measurement" info="Test info" />
        <SearchableDropdown
          searchTerm={searchTerm}
          searchPlaceholder="Search measurements"
          selectedOption={selectedMeasurement || 'Select measurement...'}
          onSelect={handleSelect}
          onChangeSearchTerm={handleChangeSearchTerm}
          options={measurements}
          buttonStatus={ComponentStatus.Default}
          testID="measurement-selector--dropdown"
          buttonTestID="measurement-selector--dropdown-button"
          menuTestID="measurement-selector--dropdown--menu"
          emptyText="No Measurements Found"
          iconOn={true}
        />
      </div>
    )
  }, [selectedBucket, measurements])
}

export default MeasurementSelector
