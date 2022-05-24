import React, {FC, useContext, useMemo, useState} from 'react'

// Components
import {ComponentStatus, RemoteDataState} from '@influxdata/clockface'
import SelectorTitle from 'src/dataExplorer/components/SelectorTitle'
import SearchableDropdown from 'src/shared/components/SearchableDropdown'

// Context
import {NewDataExplorerContext} from 'src/dataExplorer/context/newDataExplorer'
import {MeasurementContext} from 'src/dataExplorer/context/measurements'

const convertStatus = (remoteDataState: RemoteDataState): ComponentStatus => {
  switch (remoteDataState) {
    case RemoteDataState.Error:
      return ComponentStatus.Error
    case RemoteDataState.Loading:
      return ComponentStatus.Loading
    default:
      return ComponentStatus.Default
  }
}

const MeasurementSelector: FC = () => {
  const {selectedBucket, selectedMeasurement, selectMeasurement} = useContext(
    NewDataExplorerContext
  )
  const {measurements, loading} = useContext(MeasurementContext)
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
          buttonStatus={convertStatus(loading)}
          testID="measurement-selector--dropdown"
          buttonTestID="measurement-selector--dropdown-button"
          menuTestID="measurement-selector--dropdown--menu"
          emptyText="No Measurements Found"
        />
      </div>
    )
  }, [selectedBucket, selectedMeasurement, measurements, loading])
}

export default MeasurementSelector
