import React, {
  FC,
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from 'react'
import {useDispatch} from 'react-redux'

// Components & Contexts
import {SUPPORTED_VISUALIZATIONS} from 'src/visualization'
import {ResultsContext} from 'src/dataExplorer/context/results'

// Types & Constants
import {
  RecursivePartial,
  SimpleTableViewProperties,
  ViewProperties,
} from 'src/types'

// Utils
import {notify} from 'src/shared/actions/notifications'
import {trySmoothingData} from 'src/shared/copy/notifications'
import {useSessionStorage} from 'src/dataExplorer/shared/utils'

const DEFAULT_TIME_COLUMN = '_time' // unpivoted data
const DEFAULT_DATA_COLUMN = '_value' // unpivoted data

const KNOWN_TIME_COLUMNS = ['_time', 'time']
const NOT_PERMITTED_NAMES_COLUMN_SELECTOR = KNOWN_TIME_COLUMNS.concat([
  '_result',
  'result',
  'table',
])
// subset of FluxDataType --> continuous data.
// e.g. fields values are continuous.
// e.g. tags values can be anything, if it can be treated as discrete. (e.g. a bool is true|false or 1|0)
const PERMITTED_NUMERIC_TYPES_COLUMN = ['unsignedLong', 'long', 'double']

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
    percentageRetained: number
    timeColumn: string
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

const DEFAULT_VIEW_OPTIONS: ViewOptions = {
  groupby: [],
  smoothing: {
    columns: [],
    applied: true,
    percentageRetained: 50,
    timeColumn: 'time',
  },
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
  const [colsForViewProps, setColsForViewProps] = useState({
    timeColumn: DEFAULT_TIME_COLUMN,
    dataColumn: DEFAULT_DATA_COLUMN,
  })
  const {result: resultFromParent} = useContext(ResultsContext)
  const dispatch = useDispatch()

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

  const setViewProperties = () => {
    const {timeColumn, dataColumn} = colsForViewProps
    // known, returned data shape. Unpivoted. Single `_value` column.
    const smoothedData = selectedViewOptions.smoothing.applied
    const hasSingleValueColumn = smoothedData

    switch (view.properties.type) {
      case 'band':
      case 'xy':
      case 'heatmap':
      case 'scatter':
        setView({
          ...view,
          properties: {
            ...view.properties,
            yColumn: dataColumn,
            xColumn: timeColumn,
          },
        })
        break
      case 'histogram':
        // These graphs only have a single xColumn to choose.
        setView({
          ...view,
          properties: {
            ...view.properties,
            xColumn: dataColumn,
          },
        })
        break
      case 'line-plus-single-stat':
        // This graph includes a calculation for a single value.
        // The graph unions over all `results.parsed.fluxGroupKeyUnion = []`, to try creating a single value.
        // For the unpivoted data --> it has all field values under a single column `_value`. Then fluxGroupKeyUnion = tagKeys.
        // For the pivoted data --> it has the data broken into different column per field. Cannot support.
        // Has the same issue as 'single-stat'. Read above.
        if (!hasSingleValueColumn) {
          dispatch(notify(trySmoothingData('single-stat')))
        }
        // But the line graph will still work.
        setView({
          ...view,
          properties: {
            ...view.properties,
            yColumn: dataColumn,
            xColumn: timeColumn,
          },
        })
        break
      case 'simple-table':
      case 'table':
      default:
        // no change. Keep raw.
        break
    }
  }

  // from data table headers
  const getSelectorColumns = () => {
    const excludeFromColumnSelectors = NOT_PERMITTED_NAMES_COLUMN_SELECTOR

    return Object.keys(resultFromParent?.parsed?.table?.columns || {}).filter(
      columnName => !excludeFromColumnSelectors.includes(columnName)
    )
  }

  // from data table headers
  const getNumericSelectorColumns = () => {
    const excludeFromColumnSelectors = NOT_PERMITTED_NAMES_COLUMN_SELECTOR

    return Object.keys(resultFromParent?.parsed?.table?.columns || {}).filter(
      columnName => {
        const {fluxDataType} = (resultFromParent?.parsed?.table?.columns || {})[
          columnName
        ]
        return (
          !excludeFromColumnSelectors.includes(columnName) &&
          PERMITTED_NUMERIC_TYPES_COLUMN.includes(fluxDataType)
        )
      }
    )
  }

  // from data table headers
  const defineTimeColumn = () => {
    const dateTimeColumns = Object.keys(
      resultFromParent?.parsed?.table?.columns || {}
    ).filter(columnName => {
      const {fluxDataType} = (resultFromParent?.parsed?.table?.columns || {})[
        columnName
      ]
      return fluxDataType === 'dateTime:RFC3339'
    })
    return (
      dateTimeColumns.filter(col => KNOWN_TIME_COLUMNS.includes(col))[0] ??
      dateTimeColumns[0] ??
      'time'
    )
  }

  // make decision, based on local state
  const defineDefaultUnpivotedColumn = numericColumns => {
    const firstFieldIfExists = (
      defaultViewOptions?.smoothing?.columns || []
    ).filter(defaultColumn => numericColumns.includes(defaultColumn))[0]
    return firstFieldIfExists ?? numericColumns[0]
  }

  const buildSmoothingOptions = (): {
    all: RecursivePartial<ViewOptions>
    selected: RecursivePartial<ViewOptions>
  } => {
    // all
    const numericColumns = getNumericSelectorColumns()
    // initial selection
    const defaultSmoothingColumn = defineDefaultUnpivotedColumn(numericColumns)
    const timeColumn = defineTimeColumn()

    return {
      all: {smoothing: {columns: numericColumns}},
      selected: {
        smoothing: {
          columns: Boolean(defaultSmoothingColumn)
            ? [defaultSmoothingColumn]
            : [],
          timeColumn,
        },
      },
    }
  }

  const buildGroupbyOptions = (): {
    all: RecursivePartial<ViewOptions>
    selected: RecursivePartial<ViewOptions>
  } => {
    // all
    const columns = getSelectorColumns()
    // initial selection
    const defaultsWhichExist = defaultViewOptions.groupby.filter(defaultGroup =>
      columns.includes(defaultGroup)
    )

    return {
      all: {groupby: [...columns]},
      selected: {groupby: defaultsWhichExist},
    }
  }

  const setViewColumnsBasedOnPivotState = () => {
    const isPivoted = !selectedViewOptions.smoothing.applied
    if (isPivoted) {
      // pivoted data
      const alreadyChosenColumn =
        selectedViewOptions.smoothing.columns[0] ??
        defineDefaultUnpivotedColumn(getNumericSelectorColumns())
      setColsForViewProps({
        timeColumn: defineTimeColumn(),
        dataColumn: alreadyChosenColumn,
      })
    } else {
      // unpivoted data
      setColsForViewProps({
        timeColumn: DEFAULT_TIME_COLUMN,
        dataColumn: DEFAULT_DATA_COLUMN,
      })
    }
  }

  useEffect(() => {
    const {all: allGB, selected: selectedGB} = buildGroupbyOptions()
    const {all: allS, selected: selectedS} = buildSmoothingOptions()
    setViewOptionsAll({...allGB, ...allS})
    selectViewOptions({...selectedGB, ...selectedS})
  }, [
    resultFromParent, // reset if parent query is re-run, same as other graph options
  ])

  useEffect(() => {
    setViewColumnsBasedOnPivotState()
  }, [
    defaultViewOptions.smoothing.columns, // new schema defaults added
    viewOptionsAll.smoothing.columns, // new query from parent
  ])

  useEffect(() => {
    setViewColumnsBasedOnPivotState()
  }, [
    selectedViewOptions.smoothing.applied, // smoothing toggled on|off
    view.properties.type, // new graph view is chosen
  ])

  useEffect(() => setViewProperties(), [colsForViewProps, view.type])

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
