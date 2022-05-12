import React, {FC, useState} from 'react'

// Components
import {ComponentStatus} from '@influxdata/clockface'
import SearchableDropdown from 'src/shared/components/SearchableDropdown'

const MeasurementSelector: FC = () => {
  // TODO: change to context later
  const [selectedMeasurement, setSelectedMeasurement] = useState(null)

  const measurements = []

  const handleSelect = (option: string) => {
    const selected = measurements.find(m => m.name === option)
    setSelectedMeasurement(selected)
  }

  const handleChangeSearchTerm = (value: string) => {
    console.log(value)
  }

  return (
    <SearchableDropdown
      searchTerm="" // TODO: variable
      searchPlaceholder="Search measurements"
      selectedOption={selectedMeasurement || 'Select measurement...'}
      onSelect={handleSelect}
      onChangeSearchTerm={handleChangeSearchTerm}
      options={measurements}
      buttonStatus={ComponentStatus.Default}
      testID="measurement-selector--dropdown"
      buttonTestID="measurement-selector--dropdown-button"
      menuTestID="measurement-selector--dropdown--menu"
      emptyText="No Measurement Found"
      iconOn={true}
    />
  )
}

export default MeasurementSelector
