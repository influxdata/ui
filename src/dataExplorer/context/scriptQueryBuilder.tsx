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
import {debouncer} from 'src/dataExplorer/shared/utils'
// Types
import {Bucket, TagKeyValuePair} from 'src/types'
import {DBRP} from 'src/client'

const DEFAULT_SELECTED_TAG_VALUES: SelectedTagValues = {}
interface SelectedTagValues {
  [key: string]: string[]
}

interface ScriptQueryBuilderContextType {
  // Composition Sync
  compositionSync: boolean
  toggleCompositionSync: (synced: boolean) => void

  // Schema
  selectedBucket: Bucket
  // only for InfluxQL, a DBRP in InfluxQL is equivalent to a bucket in Flux/SQL
  selectedDBRP: DBRP
  selectedMeasurement: string
  selectedTagValues: SelectedTagValues
  searchTerm: string // for searching fields and tags
  selectBucket: (bucket: Bucket) => void
  selectDBRP: (dbrp: DBRP, bucket: Bucket) => void
  selectMeasurement: (measurement: string) => void
  selectField: (field: string) => void
  selectTagValue: (tagKey: string, tagValue: string) => void
  setSearchTerm: (str: string) => void
}

const DEFAULT_CONTEXT: ScriptQueryBuilderContextType = {
  // Composition Sync
  compositionSync: true,
  toggleCompositionSync: _s => {},

  // Schema
  selectedBucket: null,
  selectedDBRP: null,
  selectedMeasurement: '',
  selectedTagValues: DEFAULT_SELECTED_TAG_VALUES,
  searchTerm: '',
  selectBucket: (_b: Bucket) => {},
  selectDBRP: (_d: DBRP, _b: Bucket) => {},
  selectMeasurement: (_m: string) => {},
  selectField: (_f: string) => {},
  selectTagValue: (_k: string, _v: string) => {},
  setSearchTerm: (_s: string) => {},
}

export const ScriptQueryBuilderContext =
  createContext<ScriptQueryBuilderContextType>(DEFAULT_CONTEXT)

export const ScriptQueryBuilderProvider: FC = ({children}) => {
  // Contexts
  const {getMeasurements} = useContext(MeasurementsContext)
  const {getFields, resetFields} = useContext(FieldsContext)
  const {getTagKeys, resetTags} = useContext(TagsContext)
  const {selection, setSelection} = useContext(PersistanceContext)

  // States
  // This state is a restructed PersistanceContext selection.tagValues
  // for performance reason. selection.tagValues is the source of true
  const [selectedTagValues, setSelectedTagValues] = useState(
    DEFAULT_SELECTED_TAG_VALUES
  )
  const [searchTerm, setSearchTerm] = useState('')

  const transformSessionTagValuesToLocal = tagValues => {
    const localTagValues = {} as SelectedTagValues
    tagValues.forEach((tag: TagKeyValuePair) => {
      if (!localTagValues[tag.key]) {
        localTagValues[tag.key] = []
      }
      localTagValues[tag.key].push(tag.value)
    })
    return localTagValues
  }

  useEffect(() => {
    if (selection.bucket && selection.measurement) {
      // On page refresh, measurements become empty even though
      // a bucket and a measurement are selected,
      // so we should get measurements here
      getMeasurements(selection.bucket)

      // On page refresh, re-contruct the state of selectedTagValues
      if (!!selection.tagValues) {
        const _selectedTagValues = transformSessionTagValuesToLocal(
          selection.tagValues
        )
        setSelectedTagValues(_selectedTagValues)
      }
    }
    // pass an empty array ([]) as the dependency list to
    // run an effect and clean it up only once (on mount and unmount),
    // https://reactjs.org/docs/hooks-effect.html#tip-optimizing-performance-by-skipping-effects
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    setSelectedTagValues(transformSessionTagValuesToLocal(selection.tagValues))
  }, [selection.tagValues])

  const handleCompositionFluxSync = (synced: boolean): void => {
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

  const handleSelectDBRP = (dbrp: DBRP, bucket: Bucket): void => {
    setSelection({dbrp, bucket, measurement: '', fields: [], tagValues: []})

    // Reset measurement, tags, fields, selected tag values
    resetFields()
    resetTags()
    setSelectedTagValues(DEFAULT_SELECTED_TAG_VALUES)

    // Fetch measurement values
    getMeasurements(bucket)
  }

  const handleSelectMeasurement = (measurement: string): void => {
    // schema composition
    setSelection({measurement, fields: [], tagValues: []})

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

    // schema composition
    setSelection({fields})
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

    // Update session storage & schema composition
    setSelection({tagValues: sessionTagValues})
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
      <ScriptQueryBuilderContext.Provider
        value={{
          // Composition Sync
          compositionSync: selection.composition?.synced,
          toggleCompositionSync: handleCompositionFluxSync,

          // Schema
          selectedBucket: selection.bucket,
          selectedDBRP: selection.dbrp,
          selectedMeasurement: selection.measurement,
          selectedTagValues,
          searchTerm,
          selectBucket: handleSelectBucket,
          selectDBRP: handleSelectDBRP,
          selectMeasurement: handleSelectMeasurement,
          selectField: handleSelectField,
          selectTagValue: handleSelectTagValue,
          setSearchTerm: handleSearchTerm,
        }}
      >
        {children}
      </ScriptQueryBuilderContext.Provider>
    ),
    [
      // Composition Sync
      selection.composition?.synced,

      // Schema
      selection,
      selection.fields,
      selection.tagValues,
      searchTerm,

      children,
    ]
  )
}
