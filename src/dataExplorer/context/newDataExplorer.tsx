import React, {
  FC,
  createContext,
  useState,
  useMemo,
  useContext,
  useCallback,
} from 'react'

// Context
import {MeasurementContext} from 'src/dataExplorer/context/measurements'
import {FieldsContext} from 'src/dataExplorer/context/fields'
import {TagsContext} from 'src/dataExplorer/context/tags'

// Types
import {Bucket} from 'src/types'

const DEBOUNCE_TIMEOUT = 500
let timer
type NOOP = () => void
const debouncer = (action: NOOP): void => {
  clearTimeout(timer)
  timer = setTimeout(() => {
    action()
    timer = null
  }, DEBOUNCE_TIMEOUT)
}

interface NewDataExplorerContextType {
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

const DEFAULT_CONTEXT: NewDataExplorerContextType = {
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

export const NewDataExplorerContext = createContext<NewDataExplorerContextType>(
  DEFAULT_CONTEXT
)

export const NewDataExplorerProvider: FC = ({children}) => {
  // Contexts
  const {getMeasurements} = useContext(MeasurementContext)
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

  const handleSearchTerm = useCallback(
    (searchTerm: string): void => {
      setSearchTerm(searchTerm)
      debouncer(() => {
        getFields(selectedBucket, selectedMeasurement, searchTerm)
        getTagKeys(selectedBucket, selectedMeasurement, searchTerm)
      })
    },
    [getFields, getTagKeys, selectedBucket, selectedMeasurement]
  )

  return useMemo(
    () => (
      <NewDataExplorerContext.Provider
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
      </NewDataExplorerContext.Provider>
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
