import React, {FC, createContext, useCallback} from 'react'
import {TimeRange, RecursivePartial} from 'src/types'
import {DEFAULT_TIME_RANGE} from 'src/shared/constants/timeRanges'
import {useSessionStorage} from 'src/dataExplorer/shared/utils'
import {Bucket, TagKeyValuePair} from 'src/types'
import {
  RESOURCES,
  ResourceConnectedQuery,
} from 'src/dataExplorer/components/resources'

interface CompositionStatus {
  synced: boolean // true == can modify session's schema
  diverged: boolean // true == cannot re-sync. (e.g. user has typed in the composition block)
}

export enum GroupType {
  Default = 'Default',
  GroupBy = 'Group By',
  Ungroup = 'Ungroup',
}

export interface GroupOption {
  type: GroupType
  columns: string[]
}

export interface ResultOptions {
  fieldsAsColumn: boolean
  group: GroupOption
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

  save: () => Promise<ResourceConnectedQuery<any>>
}

export const DEFAULT_SELECTION: CompositionSelection = {
  bucket: null,
  measurement: null,
  fields: [] as string[],
  tagValues: [] as TagKeyValuePair[],
  composition: {
    synced: true,
    diverged: false,
  } as CompositionStatus,
  resultOptions: {
    fieldsAsColumn: false,
    group: {
      type: GroupType.Default,
      columns: [] as string[],
    } as GroupOption,
  } as ResultOptions,
}

export const DEFAULT_EDITOR_TEXT =
  '// Start by selecting data from the schema browser or typing flux here'

const DEFAULT_CONTEXT = {
  hasChanged: false,
  horizontal: [0.5],
  vertical: [0.25, 0.8],
  range: DEFAULT_TIME_RANGE,
  query: DEFAULT_EDITOR_TEXT,
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
  save: () => Promise.resolve(null),
}

export const PersistanceContext = createContext<ContextType>(DEFAULT_CONTEXT)

export const PersistanceProvider: FC = ({children}) => {
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
    DEFAULT_CONTEXT.query
  )
  const [range, setRange] = useSessionStorage(
    'dataExplorer.range',
    DEFAULT_CONTEXT.range
  )
  const [resource, setResource] = useSessionStorage('dataExplorer.resource', {
    type: 'scripts',
    flux: '',
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
    schema => {
      if (selection.composition?.diverged && schema.composition?.synced) {
        // cannot re-sync if diverged
        return
      }
      const nextState: CompositionSelection = {
        ...selection,
        ...schema,
        composition: {
          ...(selection.composition || {}),
          ...(schema.composition || {}),
        },
      }
      if (hasChanged === false) {
        setHasChanged(true)
      }
      setSelection(nextState)
    },
    [
      hasChanged,
      selection.composition,
      selection.fields,
      selection.tagValues,
      setSelection,
    ]
  )

  const save = () => {
    if (!resource || !RESOURCES[resource.type]) {
      return Promise.resolve(null)
    }

    resource.flux = query

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
