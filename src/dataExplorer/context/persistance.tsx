import React, {FC, createContext} from 'react'
import {TimeRange} from 'src/types'
import {DEFAULT_TIME_RANGE} from 'src/shared/constants/timeRanges'
import {useSessionStorage} from 'src/dataExplorer/shared/utils'
import {Bucket} from 'src/types'

interface MeasurementSelection {
  bucket: Bucket
  measurement: string
}

interface ContextType {
  horizontal: number[]
  vertical: number[]
  range: TimeRange
  query: string
  selection: MeasurementSelection

  setHorizontal: (val: number[]) => void
  setVertical: (val: number[]) => void
  setRange: (val: TimeRange) => void
  setQuery: (val: string) => void
  setSelection: (val: MeasurementSelection) => void
}

const DEFAULT_CONTEXT = {
  horizontal: [0.2],
  vertical: [0.25, 0.8],
  range: DEFAULT_TIME_RANGE,
  query: '',
  selection: {
    bucket: null,
    measurement: '',
  },

  setHorizontal: (_: number[]) => {},
  setVertical: (_: number[]) => {},
  setRange: (_: TimeRange) => {},
  setQuery: (_: string) => {},
  setSelection: (_: MeasurementSelection) => {},
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
        setSelection,
      }}
    >
      {children}
    </PersistanceContext.Provider>
  )
}
