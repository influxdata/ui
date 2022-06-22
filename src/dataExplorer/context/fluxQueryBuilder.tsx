import React, {
  FC,
  createContext,
  useState,
  useMemo,
  useContext,
  useCallback,
} from 'react'

// Context
import {MeasurementsContext} from 'src/dataExplorer/context/measurements'
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

interface FluxQueryBuilderContextType {
  // Schema
  selectedBucket: Bucket
  selectedMeasurement: string
  searchTerm: string // for searching fields and tags
  selectBucket: (bucket: Bucket) => void
  selectMeasurement: (measurement: string) => void
  setSearchTerm: (str: string) => void
}

const DEFAULT_CONTEXT: FluxQueryBuilderContextType = {
  // Schema
  selectedBucket: null,
  selectedMeasurement: '',
  searchTerm: '',
  selectBucket: (_b: Bucket) => {},
  selectMeasurement: (_m: string) => {},
  setSearchTerm: (_s: string) => {},
}

export const FluxQueryBuilderContext = createContext<
  FluxQueryBuilderContextType
>(DEFAULT_CONTEXT)

export const FluxQueryBuilderProvider: FC = ({children}) => {
  // Contexts
  const {getMeasurements} = useContext(MeasurementsContext)
  const {getFields, resetFields} = useContext(FieldsContext)
  const {getTagKeys, resetTags} = useContext(TagsContext)

  // States
  const [selectedBucket, setSelectedBucket] = useState(null)
  const [selectedMeasurement, setSelectedMeasurement] = useState('')
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
      <FluxQueryBuilderContext.Provider
        value={{
          // Schema
          selectedBucket,
          selectedMeasurement,
          searchTerm,
          selectBucket: handleSelectBucket,
          selectMeasurement: handleSelectMeasurement,
          setSearchTerm: handleSearchTerm,
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

      children,
    ]
  )
}
