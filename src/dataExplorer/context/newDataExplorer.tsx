import React, {FC, createContext, useState, useMemo} from 'react'

// Types
import {Bucket, Field, RemoteDataState} from 'src/types'

interface NewDataExplorerContextType {
  // Schema
  selectedBucket: Bucket
  measurements: string[] // TODO: type MeasurementSchema?
  selectedMeasurement: string // TODO: type Measurement?
  fields: Field[]
  tags: any[]
  searchTerm: string // for searching fields and tags
  selectBucket: (bucket: Bucket) => void
  selectMeasurement: (measurement: string) => void // TODO: type Measurement?
  setSearchTerm: (str: string) => void

  // Query building
  query: string
  loading: RemoteDataState
  updateQuery: (q: string) => void
}

const DEFAULT_CONTEXT: NewDataExplorerContextType = {
  // Schema
  selectedBucket: null,
  measurements: [],
  selectedMeasurement: '',
  fields: [],
  tags: [],
  searchTerm: '',
  selectBucket: (_b: Bucket) => {},
  selectMeasurement: (_m: string) => {},
  setSearchTerm: (_s: string) => {},

  // Query building
  query: '',
  loading: RemoteDataState.NotStarted,
  updateQuery: _q => {},
}

export const NewDataExplorerContext = createContext<NewDataExplorerContextType>(
  DEFAULT_CONTEXT
)

const SAMPLE_MEASUREMENT = [
  'airSensors',
  'average_temperature',
  'coindesk',
  'earthquake',
  'explosion',
]

export const NewDataExplorerProvider: FC = ({children}) => {
  const [loading] = useState(RemoteDataState.NotStarted)
  const [query, setQuery] = useState('')
  const [selectedBucket, setSelectedBucket] = useState(null)
  const [measurements, setMeasurements] = useState([])
  const [selectedMeasurement, setSelectedMeasurement] = useState('')
  const [fields, setFields] = useState([])
  const [tags, setTags] = useState([])
  const [searchTerm, setSearchTerm] = useState('')

  const handleSelectBucket = (bucket: Bucket): void => {
    setSelectedBucket(bucket)

    // Reset measurement, tags, and fields
    setSelectedMeasurement('')
    setFields([])
    setTags([])

    // TODO: get measurements from context
    setMeasurements(SAMPLE_MEASUREMENT)
  }

  const handleSelectMeasurement = (measurement: string): void => {
    setSelectedMeasurement(measurement)
    // TODO: get fields and tags from context
    setFields([])
    setTags([])
  }

  const handleSearchTerm = (searchTerm: string): void => {
    // TODO
    /* eslint-disable no-console */
    console.log('Search: ', searchTerm)
    /* eslint-disable no-console */
    setSearchTerm(searchTerm)
  }

  return useMemo(
    () => (
      <NewDataExplorerContext.Provider
        value={{
          // Schema
          selectedBucket,
          measurements,
          selectedMeasurement,
          fields,
          tags,
          searchTerm,
          selectBucket: handleSelectBucket,
          selectMeasurement: handleSelectMeasurement,
          setSearchTerm: handleSearchTerm,

          // Query building
          query,
          loading,
          updateQuery: setQuery,
        }}
      >
        {children}
      </NewDataExplorerContext.Provider>
    ),
    [
      // Schema
      selectedBucket,
      measurements,
      selectedMeasurement,
      fields,
      tags,
      searchTerm,

      // Query building
      query,
      loading,
      children,
    ]
  )
}
