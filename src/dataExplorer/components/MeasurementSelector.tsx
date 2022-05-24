import React, {FC, useContext, useMemo, useState} from 'react'

// Components
import {ComponentStatus, RemoteDataState} from '@influxdata/clockface'
import SelectorTitle from 'src/dataExplorer/components/SelectorTitle'
import SearchableDropdown from 'src/shared/components/SearchableDropdown'

// Context
import {NewDataExplorerContext} from 'src/dataExplorer/context/newDataExplorer'

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
  const {
    measurements,
    selectedBucket,
    selectedMeasurement,
    loadingMeasurements,
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
          buttonStatus={convertStatus(loadingMeasurements)}
          testID="measurement-selector--dropdown"
          buttonTestID="measurement-selector--dropdown-button"
          menuTestID="measurement-selector--dropdown--menu"
          emptyText="No Measurements Found"
          iconOn={true}
        />
      </div>
    )
  }, [selectedBucket, selectedMeasurement, measurements, loadingMeasurements])
}

export default MeasurementSelector
