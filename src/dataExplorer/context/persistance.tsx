import React, {FC, createContext, useCallback, useEffect} from 'react'
import {TimeRange, RecursivePartial} from 'src/types'
import {DEFAULT_TIME_RANGE} from 'src/shared/constants/timeRanges'
import {useSessionStorage} from 'src/dataExplorer/shared/utils'
import {Bucket, TagKeyValuePair} from 'src/types'
import {isFlagEnabled} from 'src/shared/utils/featureFlag'

interface SchemaComposition {
  synced: boolean // true == can modify session's schema
  diverged: boolean // true == cannot re-sync. (e.g. user has typed in the composition block)
}

export interface SchemaSelection {
  bucket: Bucket
  measurement: string
  fields: string[]
  tagValues: TagKeyValuePair[]
  composition: SchemaComposition
}

interface ContextType {
  horizontal: number[]
  vertical: number[]
  range: TimeRange
  query: string
  selection: SchemaSelection

  setHorizontal: (val: number[]) => void
  setVertical: (val: number[]) => void
  setRange: (val: TimeRange) => void
  setQuery: (val: string) => void
  setSelection: (val: RecursivePartial<SchemaSelection>) => void
}

export const DEFAULT_SCHEMA: SchemaSelection = {
  bucket: null,
  measurement: null,
  fields: [] as string[],
  tagValues: [] as TagKeyValuePair[],
  composition: {
    synced: false,
    diverged: false,
  },
}

const DEFAULT_CONTEXT = {
  horizontal: [0.2],
  vertical: [0.25, 0.8],
  range: DEFAULT_TIME_RANGE,
  query: '',
  selection: DEFAULT_SCHEMA,

  setHorizontal: (_: number[]) => {},
  setVertical: (_: number[]) => {},
  setRange: (_: TimeRange) => {},
  setQuery: (_: string) => {},
  setSelection: (_: RecursivePartial<SchemaSelection>) => {},
}

export const PersistanceContext = createContext<ContextType>(DEFAULT_CONTEXT)

export const PersistanceProvider: FC = ({children}) => {
  const [
    horizontal,
    setHorizontal,
  ] = useSessionStorage('dataExplorer.resize.horizontal', [
    ...DEFAULT_CONTEXT.horizontal,
  ])
  const [
    vertical,
    setVertical,
  ] = useSessionStorage('dataExplorer.resize.vertical', [
    ...DEFAULT_CONTEXT.vertical,
  ])
  const [query, setQuery] = useSessionStorage(
    'dataExplorer.query',
    DEFAULT_CONTEXT.query
  )
  const [range, setRange] = useSessionStorage(
    'dataExplorer.range',
    DEFAULT_CONTEXT.range
  )
  const [selection, setSelection] = useSessionStorage(
    'dataExplorer.schema',
    JSON.parse(JSON.stringify(DEFAULT_CONTEXT.selection))
  )

  const setSchemaSelection = useCallback(
    schema => {
      if (
        isFlagEnabled('schemaComposition') &&
        selection.composition?.diverged
      ) {
        // TODO: how message to user?
        return
      }
      const nextState: SchemaSelection = {
        ...selection,
        ...schema,
        composition: {
          ...(selection.composition || {}),
          ...(schema.composition || {}),
        },
      }
      setSelection(nextState)
    },
    [selection, selection.composition, setSelection]
  )

  return (
    <PersistanceContext.Provider
      value={{
        horizontal,
        vertical,
        range,
        query,
        selection,

        setHorizontal,
        setVertical,
        setRange,
        setQuery,
        setSelection: setSchemaSelection,
      }}
    >
      {children}
    </PersistanceContext.Provider>
  )
}
