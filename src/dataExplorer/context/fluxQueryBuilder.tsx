import React, {
  FC,
  createContext,
  useState,
  useMemo,
  useContext,
  useCallback,
  useEffect,
} from 'react'

// Context
import {MeasurementsContext} from 'src/dataExplorer/context/measurements'
import {FieldsContext} from 'src/dataExplorer/context/fields'
import {PersistanceContext} from 'src/dataExplorer/context/persistance'
import {TagsContext} from 'src/dataExplorer/context/tags'
import {EditorContext} from 'src/shared/contexts/editor'

// Types
import {Bucket, TagKeyValuePair} from 'src/types'

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

const DEFAULT_SELECTED_TAG_VALUES: SelectedTagValues = {}
interface SelectedTagValues {
  [key: string]: string[]
}

interface FluxQueryBuilderContextType {
  // Flux Sync
  fluxSync: boolean
  toggleFluxSync: (synced: boolean) => void

  // Schema
  selectedBucket: Bucket
  selectedMeasurement: string
  selectedTagValues: SelectedTagValues
  searchTerm: string // for searching fields and tags
  selectBucket: (bucket: Bucket) => void
  selectMeasurement: (measurement: string) => void
  selectField: (field: string) => void
  selectTagValue: (tagKey: string, tagValue: string) => void
  setSearchTerm: (str: string) => void
}

const DEFAULT_CONTEXT: FluxQueryBuilderContextType = {
  // Flux Sync
  fluxSync: true,
  toggleFluxSync: _s => {},

  // Schema
  selectedBucket: null,
  selectedMeasurement: '',
  selectedTagValues: DEFAULT_SELECTED_TAG_VALUES,
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
  const {selection, setSelection} = useContext(PersistanceContext)

  // States
  // This state is a restructed PersistanceContext selection.tagValues
  // for performance reason. selection.tagValues is the source of true
  const [selectedTagValues, setSelectedTagValues] = useState(
    DEFAULT_SELECTED_TAG_VALUES
  )
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    if (selection.bucket && selection.measurement) {
      // On page refresh, measurements become empty even though
      // a bucket and a measurement are selected,
      // so we should get measurements here
      getMeasurements(selection.bucket)

      // On page refresh, re-contruct the state of selectedTagValues
      if (!!selection.tagValues) {
        const _selectedTagValues = {} as SelectedTagValues
        selection.tagValues.forEach((tag: TagKeyValuePair) => {
          if (!_selectedTagValues[tag.key]) {
            _selectedTagValues[tag.key] = []
          }
          _selectedTagValues[tag.key].push(tag.value)
        })
        setSelectedTagValues(_selectedTagValues)
      }
    }
  }, [selection.bucket])

  const handleToggleFluxSync = (synced: boolean): void => {
    setSelection({composition: {synced}})
  }

  const handleSelectBucket = (bucket: Bucket): void => {
    setSelection({bucket, measurement: '', fields: [], tagValues: []})

    // Reset measurement, tags, fields, selected tag values
    resetFields()
    resetTags()
    setSelectedTagValues(DEFAULT_SELECTED_TAG_VALUES)

    // Fetch measurement values
    getMeasurements(bucket)
  }

  const handleSelectMeasurement = (measurement: string): void => {
    setSelection({measurement, fields: [], tagValues: []})

    // Inject measurement
    injectViaLsp(ExecuteCommand.InjectionMeasurement, {
      bucket:
        selection.bucket.type === 'sample'
          ? selection.bucket.id
          : selection.bucket.name,
      name: measurement,
    } as ExecuteCommandInjectMeasurement)

    // Reset fields, tags, selected tag values
    resetFields()
    resetTags()
    setSelectedTagValues(DEFAULT_SELECTED_TAG_VALUES)

    // Fetch fields and tags
    getFields(selection.bucket, measurement)
    getTagKeys(selection.bucket, measurement)
  }

  const handleSelectField = (field: string): void => {
    let fields = []
    if (selection.fields?.includes(field)) {
      // remove the selected field
      fields = selection.fields.filter(item => item !== field)
    } else {
      // add the selected field
      fields = [...selection.fields, field]
    }

    setSelection({fields})

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
    let nextStateTagValues: string[] = []
    let sessionTagValues: TagKeyValuePair[] = []

    if (selectedTagValues[tagKey]?.includes(tagValue)) {
      // remove the selected tag value
      nextStateTagValues = selectedTagValues[tagKey].filter(
        item => item !== tagValue
      )
      sessionTagValues = selection.tagValues.filter(
        item => !(item.key === tagKey && item.value === tagValue)
      )
    } else {
      // add the selected tag value
      if (!selectedTagValues[tagKey]) {
        selectedTagValues[tagKey] = [] as string[]
      }
      nextStateTagValues = [...selectedTagValues[tagKey], tagValue]
      sessionTagValues = [
        ...selection.tagValues,
        {key: tagKey, value: tagValue} as TagKeyValuePair,
      ]
    }

    // Update React state
    setSelectedTagValues({
      ...selectedTagValues,
      [tagKey]: nextStateTagValues,
    })

    // Update session storage
    setSelection({tagValues: sessionTagValues})

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
          // Flux Sync
          fluxSync: selection.composition?.synced,
          toggleFluxSync: handleToggleFluxSync,

          // Schema
          selectedBucket: selection.bucket,
          selectedMeasurement: selection.measurement,
          selectedTagValues,
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
      // Flux Sync
      selection.composition?.synced,

      // Schema
      selection,
      searchTerm,

      children,
    ]
  )
}
