import React, {
  FC,
  createContext,
  useCallback,
  useContext,
  useEffect,
} from 'react'

import {useSessionStorage} from 'src/dataExplorer/shared/utils'
import {
  RecursivePartial,
  SimpleTableViewProperties,
  ViewProperties,
} from 'src/types'
import {SUPPORTED_VISUALIZATIONS} from 'src/visualization'
import {ResultsContext} from 'src/dataExplorer/context/results'

const NOT_PERMITTED_NAMES_COLUMN_SELECTOR = [
  '_result',
  'result',
  '_time',
  'time',
  'table',
]
// subset of FluxDataType
const PERMITTED_TYPES_COLUMN_SELECTOR = ['unsignedLong', 'long', 'double']

export enum ViewStateType {
  Table = 'table',
  Graph = 'graph',
}

interface View {
  state: ViewStateType
  properties: ViewProperties
}

export interface ViewOptions {
  groupby: string[]
  smoothing: {
    columns: string[] // currently `|> polyling.rdp()` is applied to a single column, but is not a fundamental requirement
    applied: boolean
  }
}

const mergeViewOptions = (
  original: ViewOptions,
  updated: RecursivePartial<ViewOptions>
) => ({
  ...original,
  ...updated,
  smoothing: {
    ...original.smoothing,
    ...(updated.smoothing ?? {}),
  },
})

interface ResultsViewContextType {
  view: View
  viewOptions: ViewOptions
  selectedViewOptions: ViewOptions

  setView: (view: View) => void
  setDefaultViewOptions: (viewOptions: RecursivePartial<ViewOptions>) => void
  selectViewOptions: (viewOptions: RecursivePartial<ViewOptions>) => void
  clear: () => void
}

const DEFAULT_VIEW_OPTIONS = {
  groupby: [],
  smoothing: {column: [], applied: true},
}

const DEFAULT_STATE: ResultsViewContextType = {
  view: {
    state: ViewStateType.Table,
    properties: SUPPORTED_VISUALIZATIONS['xy'].initial,
  },
  viewOptions: JSON.parse(JSON.stringify(DEFAULT_VIEW_OPTIONS)),
  selectedViewOptions: JSON.parse(JSON.stringify(DEFAULT_VIEW_OPTIONS)),

  setView: _ => {},
  setDefaultViewOptions: _ => {},
  selectViewOptions: _ => {},
  clear: () => {},
}

export const ResultsViewContext =
  createContext<ResultsViewContextType>(DEFAULT_STATE)

export const ResultsViewProvider: FC = ({children}) => {
  const {result: resultFromParent} = useContext(ResultsContext)
  const [view, setView] = useSessionStorage('dataExplorer.results', {
    state: ViewStateType.Table,
    properties: {
      type: 'simple-table',
      showAll: false,
    } as SimpleTableViewProperties,
  })

  // what can be chosen (e.g. the list of all options)
  const [viewOptionsAll, persistViewOptionsAll] = useSessionStorage(
    'dataExplorer.resultsOptions.all',
    DEFAULT_VIEW_OPTIONS
  )
  const setViewOptionsAll = useCallback(
    (updatedOptions: RecursivePartial<ViewOptions>) => {
      persistViewOptionsAll(mergeViewOptions(viewOptionsAll, updatedOptions))
    },
    [viewOptionsAll]
  )

  // default options (a.k.a. based on schema)
  const [defaultViewOptions, persistDefaultViewOptions] = useSessionStorage(
    'dataExplorer.resultsOptions.default',
    DEFAULT_VIEW_OPTIONS
  )
  const setDefaultViewOptions = useCallback(
    (updatedOptions: RecursivePartial<ViewOptions>) => {
      persistDefaultViewOptions(
        mergeViewOptions(defaultViewOptions, updatedOptions)
      )
    },
    [defaultViewOptions]
  )

  // what was chosen (e.g. sublist chosen)
  const [selectedViewOptions, persistSelectedViewOptions] = useSessionStorage(
    'dataExplorer.resultsOptions',
    DEFAULT_VIEW_OPTIONS
  )
  const selectViewOptions = useCallback(
    (updatedOptions: RecursivePartial<ViewOptions>) => {
      persistSelectedViewOptions(
        mergeViewOptions(selectedViewOptions, updatedOptions)
      )
    },
    [selectedViewOptions]
  )

  const clear = () => {
    persistViewOptionsAll(DEFAULT_VIEW_OPTIONS)
    persistDefaultViewOptions(DEFAULT_VIEW_OPTIONS)
    persistSelectedViewOptions(DEFAULT_VIEW_OPTIONS)
  }

  const buildGroupbys = (): {
    all: RecursivePartial<ViewOptions>
    selected: RecursivePartial<ViewOptions>
  } => {
    const excludeFromColumnSelectors = NOT_PERMITTED_NAMES_COLUMN_SELECTOR

    // all
    const columns = Object.keys(
      resultFromParent?.parsed?.table?.columns || {}
    ).filter(columnName => !excludeFromColumnSelectors.includes(columnName))

    // initial selection
    const defaultsWhichExist = defaultViewOptions.groupby.filter(defaultGroup =>
      columns.includes(defaultGroup)
    )

    return {
      all: {groupby: [...columns]},
      selected: {groupby: defaultsWhichExist},
    }
  }

  const buildSmoothing = (): {
    all: RecursivePartial<ViewOptions>
    selected: RecursivePartial<ViewOptions>
  } => {
    const excludeFromColumnSelectors = NOT_PERMITTED_NAMES_COLUMN_SELECTOR

    // all
    const numericColumns = Object.keys(
      resultFromParent?.parsed?.table?.columns || {}
    ).filter(columnName => {
      const {fluxDataType} = (resultFromParent?.parsed?.table?.columns || {})[
        columnName
      ]
      return (
        !excludeFromColumnSelectors.includes(columnName) &&
        PERMITTED_TYPES_COLUMN_SELECTOR.includes(fluxDataType)
      )
    })

    // initial selection
    const firstFieldIfExists = defaultViewOptions.smoothing.columns.filter(
      defaultColumn => numericColumns.includes(defaultColumn)
    )[0]
    const defaultSmoothingColumn = firstFieldIfExists ?? numericColumns[0]

    return {
      all: {smoothing: {columns: numericColumns}},
      selected: {
        smoothing: {columns: [defaultSmoothingColumn]},
      },
    }
  }

  useEffect(() => {
    const {all: allGB, selected: selectedGB} = buildGroupbys()
    const {all: allS, selected: selectedS} = buildSmoothing()
    setViewOptionsAll({...allGB, ...allS})
    selectViewOptions({...selectedGB, ...selectedS})
  }, [
    resultFromParent, // reset if parent query is re-run, same as other graph options
  ])

  return (
    <ResultsViewContext.Provider
      value={{
        view,
        viewOptions: viewOptionsAll,
        selectedViewOptions,

        setView,
        setDefaultViewOptions,
        selectViewOptions,
        clear,
      }}
    >
      {children}
    </ResultsViewContext.Provider>
  )
}
