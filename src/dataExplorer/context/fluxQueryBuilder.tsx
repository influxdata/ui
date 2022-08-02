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
import {PersistanceContext} from 'src/dataExplorer/context/persistance'
import {TagsContext} from 'src/dataExplorer/context/tags'
import {EditorContext} from 'src/shared/contexts/editor'

// Types
import {Bucket} from 'src/types'

// Utils
import {ExecuteCommand} from 'src/languageSupport/languages/flux/lsp/utils'
import {
  ExecuteCommandInjectMeasurement,
  ExecuteCommandInjectTagValue,
  ExecuteCommandInjectField,
} from 'src/languageSupport/languages/flux/lsp/utils'

const DEBOUNCE_TIMEOUT = 500
let timer: ReturnType<typeof setTimeout>
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
  selectField: (field: string) => void
  selectTagValue: (tagKey: string, tagValue: string) => void
  setSearchTerm: (str: string) => void
}

const DEFAULT_CONTEXT: FluxQueryBuilderContextType = {
  // Schema
  selectedBucket: null,
  selectedMeasurement: '',
  searchTerm: '',
  selectBucket: (_b: Bucket) => {},
  selectMeasurement: (_m: string) => {},
  selectField: (_f: string) => {},
  selectTagValue: (_k: string, _v: string) => {},
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
  const {injectViaLsp} = useContext(EditorContext)

  // States
  const {selection, setSelection} = useContext(PersistanceContext)
  const [searchTerm, setSearchTerm] = useState('')

  const handleSelectBucket = (bucket: Bucket): void => {
    selection.bucket = bucket
    selection.measurement = ''
    setSelection({...selection})

    // Reset measurement, tags, and fields
    resetFields()
    resetTags()

    // Get measurement values
    getMeasurements(bucket)
  }

  const handleSelectMeasurement = (measurement: string): void => {
    selection.measurement = measurement
    setSelection({...selection})

    // Inject measurement
    injectViaLsp(ExecuteCommand.InjectionMeasurement, {
      bucket:
        selection.bucket.type === 'sample'
          ? selection.bucket.id
          : selection.bucket.name,
      name: measurement,
    } as ExecuteCommandInjectMeasurement)

    // Reset fields and tags
    resetFields()
    resetTags()

    // Get fields and tags
    getFields(selection.bucket, measurement)
    getTagKeys(selection.bucket, measurement)
  }

  const handleSelectField = (field: string): void => {
    // Inject field
    injectViaLsp(ExecuteCommand.InjectField, {
      bucket:
        selection.bucket.type === 'sample'
          ? selection.bucket.id
          : selection.bucket.name,
      name: field,
    } as ExecuteCommandInjectField)
  }

  const handleSelectTagValue = (tagKey: string, tagValue: string): void => {
    // Inject tag value
    injectViaLsp(ExecuteCommand.InjectTagValue, {
      bucket:
        selection.bucket.type === 'sample'
          ? selection.bucket.id
          : selection.bucket.name,
      name: tagKey,
      value: tagValue,
    } as ExecuteCommandInjectTagValue)
  }

  const handleSearchTerm = useCallback(
    (searchTerm: string): void => {
      setSearchTerm(searchTerm)
      debouncer(() => {
        getFields(selection.bucket, selection.measurement, searchTerm)
        getTagKeys(selection.bucket, selection.measurement, searchTerm)
      })
    },
    [getFields, getTagKeys, selection.bucket, selection.measurement]
  )

  return useMemo(
    () => (
      <FluxQueryBuilderContext.Provider
        value={{
          // Schema
          selectedBucket: selection.bucket,
          selectedMeasurement: selection.measurement,
          searchTerm,
          selectBucket: handleSelectBucket,
          selectMeasurement: handleSelectMeasurement,
          selectField: handleSelectField,
          selectTagValue: handleSelectTagValue,
          setSearchTerm: handleSearchTerm,
        }}
      >
        {children}
      </FluxQueryBuilderContext.Provider>
    ),
    [
      // Schema
      selection.bucket,
      selection.measurement,
      searchTerm,

      children,
    ]
  )
}
