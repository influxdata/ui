import React, {
  FC,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react'

// Components
import {ComponentStatus} from '@influxdata/clockface'
import SelectorTitle from 'src/dataExplorer/components/SelectorTitle'
import SearchableDropdown from 'src/shared/components/SearchableDropdown'

// Context
import {FluxQueryBuilderContext} from 'src/dataExplorer/context/fluxQueryBuilder'
import {MeasurementsContext} from 'src/dataExplorer/context/measurements'

// Types
import {RemoteDataState} from 'src/types'
import {event} from 'src/cloud/utils/reporting'

const MEASUREMENT_TOOLTIP = `The measurement acts as a container for tags, \
fields, and the time column, and the measurement name is the description of \
the data that are stored in the associated fields. Measurement names are \
strings, and, for any SQL users out there, a measurement is conceptually \
similar to a table.`

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
    FluxQueryBuilderContext
  )
  const {measurements, loading} = useContext(MeasurementsContext)
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    setSearchTerm('')
  }, [selectedBucket])

  const handleSelect = useCallback(
    (option: string): void => {
      selectMeasurement(option)
      event('measurementSelected', {search: searchTerm.length})
    },
    [searchTerm, selectMeasurement]
  )

  const handleChangeSearchTerm = (value: string) => {
    setSearchTerm(value)
  }

  return useMemo(() => {
    if (!selectedBucket) {
      return null
    }

    return (
      <div>
        <SelectorTitle title="Measurement" info={MEASUREMENT_TOOLTIP} />
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
  }, [
    selectedBucket,
    selectedMeasurement,
    measurements,
    loading,
    searchTerm,
    handleSelect,
  ])
}

export default MeasurementSelector
