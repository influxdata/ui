import React, {FC, useCallback, useContext, useEffect} from 'react'

// Components
import {toComponentStatus} from 'src/shared/utils/toComponentStatus'
import SelectorTitle from 'src/dataExplorer/components/SelectorTitle'
import SearchableDropdown from 'src/shared/components/SearchableDropdown'

// Context
import {ScriptQueryBuilderContext} from 'src/dataExplorer/context/scriptQueryBuilder'
import {MeasurementsContext} from 'src/dataExplorer/context/measurements'

// Types
import {event} from 'src/cloud/utils/reporting'

const MEASUREMENT_TOOLTIP = `The measurement acts as a container for tags, \
fields, and the time column, and the measurement name is the description of \
the data that are stored in the associated fields. Measurement names are \
strings, and, for any SQL users out there, a measurement is conceptually \
similar to a table.`

const MeasurementSelector: FC = () => {
  const {
    selectedBucket,
    selectedMeasurement,
    searchTermMeasurement,
    setSearchTermMeasurement,
    selectMeasurement,
  } = useContext(ScriptQueryBuilderContext)
  const {measurements, loading} = useContext(MeasurementsContext)

  useEffect(() => {
    setSearchTermMeasurement('')
  }, [selectedBucket])

  const handleSelect = useCallback(
    (option: string): void => {
      selectMeasurement(option)
      event('measurementSelected', {search: searchTermMeasurement.length})
    },
    [searchTermMeasurement, selectMeasurement]
  )

  const handleChangeSearchTerm = (value: string) => {
    setSearchTermMeasurement(value)
  }

  if (!selectedBucket) {
    return null
  }

  return (
    <div>
      <SelectorTitle
        label="Measurement"
        tooltipContents={MEASUREMENT_TOOLTIP}
      />
      <SearchableDropdown
        searchTerm={searchTermMeasurement}
        searchPlaceholder="Search measurements"
        selectedOption={selectedMeasurement || 'Select measurement...'}
        onSelect={handleSelect}
        onChangeSearchTerm={handleChangeSearchTerm}
        options={measurements}
        buttonStatus={toComponentStatus(loading)}
        testID="measurement-selector--dropdown"
        buttonTestID="measurement-selector--dropdown-button"
        menuTestID="measurement-selector--dropdown--menu"
        emptyText="No Measurements Found"
      />
    </div>
  )
}

export {MeasurementSelector}
