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
    'h2o_feet',
    'h2o_pH',
    'h2o_quality',
    'h2o_temperature',
    'ice quake',
    'ndbc',
    'quarry blast',
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
      <SelectorTitle title="Measurement" />
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
