import React, {FC, createContext, useState, useMemo, useContext} from 'react'

// Context
import {MeasurementsContext} from 'src/dataExplorer/context/measurements'
import {FieldsContext} from 'src/dataExplorer/context/fields'
import {TagsContext} from 'src/dataExplorer/context/tags'

// Types
import {Bucket} from 'src/types'

export const IMPORT_REGEXP = 'import "regexp"\n'
export const IMPORT_INFLUX_SCHEMA = 'import "influxdata/influxdb/schema"'
export const SAMPLE_DATA_SET = (bucketID: string) =>
  `import "influxdata/influxdb/sample"\nsample.data(set: "${bucketID}")`
export const FROM_BUCKET = (bucketName: string) =>
  `from(bucket: "${bucketName}")`

export const LOCAL_LIMIT = 8
interface FluxQueryBuilderContextType {
  // Schema
  selectedBucket: Bucket
  selectedMeasurement: string
  searchTerm: string // for searching fields and tags
  selectBucket: (bucket: Bucket) => void
  selectMeasurement: (measurement: string) => void
  setSearchTerm: (str: string) => void

  // Query building
  query: string
  updateQuery: (q: string) => void
}

const DEFAULT_CONTEXT: FluxQueryBuilderContextType = {
  // Schema
  selectedBucket: null,
  selectedMeasurement: '',
  searchTerm: '',
  selectBucket: (_b: Bucket) => {},
  selectMeasurement: (_m: string) => {},
  setSearchTerm: (_s: string) => {},

  // Query building
  query: '',
  updateQuery: _q => {},
}

export const FluxQueryBuilderContext = createContext<
  FluxQueryBuilderContextType
>(DEFAULT_CONTEXT)

export const NewDataExplorerProvider: FC = ({children}) => {
  // Contexts
  const {getMeasurements} = useContext(MeasurementsContext)
  const {getFields, resetFields} = useContext(FieldsContext)
  const {getTagKeys, resetTags} = useContext(TagsContext)

  // States
  const [selectedBucket, setSelectedBucket] = useState(null)
  const [selectedMeasurement, setSelectedMeasurement] = useState('')
  const [query, setQuery] = useState('')
  const [searchTerm, setSearchTerm] = useState('')

  const handleSelectBucket = (bucket: Bucket): void => {
    setSelectedBucket(bucket)

    // Reset measurement, tags, and fields
    setSelectedMeasurement('')
    resetFields()
    resetTags()

    // Get measurement values
    getMeasurements(bucket)
  }

  const handleSelectMeasurement = (measurement: string): void => {
    setSelectedMeasurement(measurement)

    // Reset fields and tags
    resetFields()
    resetTags()

    // Get fields and tags
    getFields(selectedBucket, measurement)
    getTagKeys(selectedBucket, measurement)
  }

  const handleSearchTerm = (searchTerm: string): void => {
    // TODO: handle search
    //  Need to confirm with the product team what the scope of search
    //  e.g. field values? (and/or) tag keys? (and/or) tag values?

    /* eslint-disable no-console */
    console.log('Search: ', searchTerm)
    /* eslint-disable no-console */
    setSearchTerm(searchTerm)
  }

  return useMemo(
    () => (
      <FluxQueryBuilderContext.Provider
        value={{
          // Schema
          selectedBucket,
          selectedMeasurement,
          searchTerm,
          selectBucket: handleSelectBucket,
          selectMeasurement: handleSelectMeasurement,
          setSearchTerm: handleSearchTerm,

          // Query building
          query,
          updateQuery: setQuery,
        }}
      >
        {children}
      </FluxQueryBuilderContext.Provider>
    ),
    [
      // Schema
      selectedBucket,
      selectedMeasurement,
      searchTerm,

      // Query building
      query,
      children,
    ]
  )
}
