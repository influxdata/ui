import React, {FC, useCallback, useContext, useState} from 'react'

// Components
import {ComponentStatus} from '@influxdata/clockface'
import SelectorTitle from 'src/dataExplorer/components/SelectorTitle'
import SearchableDropdown from 'src/shared/components/SearchableDropdown'
import {NewDataExplorerContext} from 'src/dataExplorer/components/SchemaSelector'

const MeasurementSelector: FC = () => {
  const {data, updateData} = useContext(NewDataExplorerContext)
  const [searchTerm, setSearchTerm] = useState('')
  const selectedMeasurement = data?.measurement

  const measurements = [
    'airSensors',
    'average_temperature',
    'coindesk',
    'earthquake',
    'explosion',
  ]

  const handleSelect = useCallback(
    (option: string): void => {
      updateData({measurement: option})
    },
    [updateData, selectedMeasurement]
  )

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
