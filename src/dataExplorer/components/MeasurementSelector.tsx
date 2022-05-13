import React, {FC, useState} from 'react'

// Components
import {ComponentStatus} from '@influxdata/clockface'
import SelectorTitle from 'src/dataExplorer/components/SelectorTitle'
import SearchableDropdown from 'src/shared/components/SearchableDropdown'

const MeasurementSelector: FC = () => {
  // TODO: change to context later
  const [selectedMeasurement, setSelectedMeasurement] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')

  const measurements = [
    'airSensors',
    'average_temperature',
    'coindesk',
    'earthquake',
    'explosion',
  ]

  const handleSelect = (option: string) => {
    const selected = measurements.find(m => m === option)
    setSelectedMeasurement(selected)
  }

  const handleChangeSearchTerm = (value: string) => {
    setSearchTerm(value)
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
}

export default MeasurementSelector
