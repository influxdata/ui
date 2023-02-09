// Libraries
import React, {FC, createContext, useCallback} from 'react'
import {useSelector} from 'react-redux'

// Types
import {TimeRange, RecursivePartial} from 'src/types'
import {Bucket, TagKeyValuePair} from 'src/types'

// Utils
import {DEFAULT_TIME_RANGE} from 'src/shared/constants/timeRanges'
import {useSessionStorage} from 'src/dataExplorer/shared/utils'
import {
  LanguageType,
  RESOURCES,
  ResourceConnectedQuery,
} from 'src/dataExplorer/components/resources'
import {isOrgIOx} from 'src/organizations/selectors'
import {isValidFlux} from 'src/languageSupport/languages/flux/lspUtils'

interface CompositionStatus {
  synced: boolean // true == can modify session's schema
}

export enum GroupType {
  Default = 'Default',
  GroupBy = 'Group By',
  Ungroup = 'Ungroup',
}

export interface GroupOptions {
  type: GroupType
  columns: string[]
}

export const DEFAULT_GROUP_OPTIONS: GroupOptions = {
  type: GroupType.Default,
  columns: [],
}

export interface AggregateWindow {
  isOn: boolean
  isAutoWindowPeriod: boolean
  every: string // TODO: check if there is a duration type
  fn: string // TODO: check if there is a enum fn list
  column: string
  createEmpty: boolean
}

export const DEFAULT_WINDOW_PERIOD: string = '1m'

export const DEFAULT_AGGREGATE_WINDOW: AggregateWindow = {
  isOn: false,
  isAutoWindowPeriod: true,
  every: DEFAULT_WINDOW_PERIOD,
  fn: '',
  column: '',
  createEmpty: true,
}

interface ResultOptions {
  fieldsAsColumn: boolean
  group: GroupOptions
  aggregateWindow: AggregateWindow
}

export interface CompositionSelection {
  bucket: Bucket
  measurement: string
  fields: string[]
  tagValues: TagKeyValuePair[]
  composition: CompositionStatus
  resultOptions: ResultOptions
}

interface ContextType {
  hasChanged: boolean
  horizontal: number[]
  vertical: number[]
  range: TimeRange
  query: string
  resource: ResourceConnectedQuery<any>
  selection: CompositionSelection

  setHasChanged: (hasChanged: boolean) => void
  setHorizontal: (val: number[]) => void
  setVertical: (val: number[]) => void
  setRange: (val: TimeRange) => void
  setQuery: (val: string) => void
  setResource: (val: ResourceConnectedQuery<any>) => void
  setSelection: (val: RecursivePartial<CompositionSelection>) => void
  clearCompositionSelection: () => void

  save: (language: LanguageType) => Promise<ResourceConnectedQuery<any>>
}

export const DEFAULT_SELECTION: CompositionSelection = {
  bucket: null,
  measurement: null,
  fields: [] as string[],
  tagValues: [] as TagKeyValuePair[],
  composition: {
    synced: true,
  } as CompositionStatus,
  resultOptions: {
    fieldsAsColumn: false,
    group: DEFAULT_GROUP_OPTIONS,
    aggregateWindow: DEFAULT_AGGREGATE_WINDOW,
  } as ResultOptions,
}

export const DEFAULT_FLUX_EDITOR_TEXT =
  '// Start by selecting data from the schema browser or typing flux here'
export const DEFAULT_SQL_EDITOR_TEXT = '/* Start by typing SQL here */'

const DEFAULT_CONTEXT = {
  hasChanged: false,
  horizontal: [0.5],
  vertical: [0.25, 0.8],
  range: DEFAULT_TIME_RANGE,
  query: '',
  resource: null,
  selection: JSON.parse(JSON.stringify(DEFAULT_SELECTION)),

  setHasChanged: (_: boolean) => {},
  setHorizontal: (_: number[]) => {},
  setVertical: (_: number[]) => {},
  setRange: (_: TimeRange) => {},
  setQuery: (_: string) => {},
  setResource: (_: any) => {},
  setSelection: (_: RecursivePartial<CompositionSelection>) => {},
  clearCompositionSelection: () => {},
  save: (_: LanguageType) => Promise.resolve(null),
}

export const PersistanceContext = createContext<ContextType>(DEFAULT_CONTEXT)

export const PersistanceProvider: FC = ({children}) => {
  const isIoxOrg = useSelector(isOrgIOx)

  const [horizontal, setHorizontal] = useSessionStorage(
    'dataExplorer.resize.horizontal',
    [...DEFAULT_CONTEXT.horizontal]
  )
  const [hasChanged, setHasChanged] = useSessionStorage(
    'dataExplorer.hasChanged',
    DEFAULT_CONTEXT.hasChanged
  )
  const [vertical, setVertical] = useSessionStorage(
    'dataExplorer.resize.vertical',
    [...DEFAULT_CONTEXT.vertical]
  )
  const [query, setQuery] = useSessionStorage(
    'dataExplorer.query',
    isIoxOrg ? DEFAULT_SQL_EDITOR_TEXT : DEFAULT_FLUX_EDITOR_TEXT
  )
  const [range, setRange] = useSessionStorage(
    'dataExplorer.range',
    DEFAULT_CONTEXT.range
  )
  const [resource, setResource] = useSessionStorage('dataExplorer.resource', {
    type: 'scripts',
    flux: '',
    language: isIoxOrg ? LanguageType.SQL : LanguageType.FLUX,
    data: {},
  })
  const [selection, setSelection] = useSessionStorage(
    'dataExplorer.schema',
    JSON.parse(JSON.stringify(DEFAULT_CONTEXT.selection))
  )

  const handleSetQuery = text => {
    if (hasChanged === false) {
      setHasChanged(true)
    }
    setQuery(text)
  }

  const handleSetResource = useCallback(
    (resource: any) => {
      if (hasChanged === false) {
        setHasChanged(true)
      }
      setResource(resource)
    },
    [hasChanged]
  )

  const clearCompositionSelection = () => {
    setSelection(JSON.parse(JSON.stringify(DEFAULT_SELECTION)))
  }

  const setCompositionSelection = useCallback(
    newSelection => {
      const composition: CompositionStatus = {
        ...(selection.composition || {}),
        ...(newSelection.composition || {}),
      }
      const nextState: CompositionSelection = {
        ...selection,
        ...newSelection,
        composition,
        resultOptions: {
          ...(selection.resultOptions || {}),
          ...(newSelection.resultOptions || {}),
        } as ResultOptions,
      }
      if (hasChanged === false) {
        setHasChanged(true)
      }
      setSelection(nextState)
    },
    [
      hasChanged,
      resource?.language,
      selection.composition,
      selection.resultOptions,
      selection.fields,
      selection.tagValues,
      setSelection,
    ]
  )

  const buildMockStringifiedExtern = () => {
    // Only used for validation. Not persisted.
    // Note: new dataExplorer (a.k.a. scripts builder) only uses these variables
    return `option v = {timeRangeStart: -1h, timeRangeStop: now()}`
  }

  const save = (language: LanguageType) => {
    if (!resource || !RESOURCES[resource.type]) {
      return Promise.resolve(null)
    }

    resource.flux = query
    resource.language = language

    const externForValidation = buildMockStringifiedExtern()
    if (
      language === LanguageType.FLUX &&
      !isValidFlux(`${externForValidation}\n${query}`)
    ) {
      return Promise.reject(
        'Invalid flux script. Please check your query text.'
      )
    }

    return RESOURCES[resource.type].persist(resource).then(data => {
      handleSetResource(data)
      setHasChanged(false)
      return data
    })
  }

  return (
    <PersistanceContext.Provider
      value={{
        hasChanged,
        horizontal,
        vertical,
        range,
        query,
        resource,
        selection,

        setHasChanged,
        setHorizontal,
        setVertical,
        setRange,
        setQuery: handleSetQuery,
        setResource: handleSetResource,
        setSelection: setCompositionSelection,
        clearCompositionSelection,

        save,
      }}
    >
      {children}
    </PersistanceContext.Provider>
  )
}
