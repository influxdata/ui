import React, {
  FC,
  createContext,
  useCallback,
  useContext,
  useEffect,
} from 'react'

import {useSessionStorage} from 'src/dataExplorer/shared/utils'
import {ViewProperties, SimpleTableViewProperties} from 'src/types'
import {SUPPORTED_VISUALIZATIONS} from 'src/visualization'
import {ResultsContext} from 'src/dataExplorer/context/results'

const NOT_PERMITTED_GROUPBY = ['_result', 'result', '_time', 'time', 'table']

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
}

interface ResultsViewContextType {
  view: View
  viewOptions: ViewOptions
  selectedViewOptions: ViewOptions

  setView: (view: View) => void
  setDefaultViewOptions: (viewOptions: Partial<ViewOptions>) => void
  selectViewOptions: (viewOptions: Partial<ViewOptions>) => void
}

const DEFAULT_VIEW_OPTIONS = {groupby: []}

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
  const [viewOptionsAll, saveViewOptionsAll] = useSessionStorage(
    'dataExplorer.resultsOptions.all',
    DEFAULT_VIEW_OPTIONS
  )
  const setViewOptionsAll = useCallback(
    (updatedOptions: Partial<ViewOptions>) => {
      saveViewOptionsAll({...viewOptionsAll, ...updatedOptions})
    },
    [viewOptionsAll]
  )

  // default options (a.k.a. based on schema)
  const [defaultViewOptions, saveDefaultViewOptions] = useSessionStorage(
    'dataExplorer.resultsOptions.default',
    DEFAULT_VIEW_OPTIONS
  )
  const setDefaultViewOptions = useCallback(
    (updatedOptions: Partial<ViewOptions>) => {
      saveDefaultViewOptions({...defaultViewOptions, ...updatedOptions})
    },
    [defaultViewOptions]
  )

  // what was chosen (e.g. sublist chosen)
  const [selectedViewOptions, saveSelectedViewOptions] = useSessionStorage(
    'dataExplorer.resultsOptions',
    DEFAULT_VIEW_OPTIONS
  )
  const selectViewOptions = useCallback(
    (updatedOptions: Partial<ViewOptions>) => {
      saveSelectedViewOptions({...selectedViewOptions, ...updatedOptions})
    },
    [selectedViewOptions]
  )

  useEffect(() => {
    // if parent query is re-run => decide what to reset in subquery viewOptions

    // reset groupby
    const excludeFromGroupby = NOT_PERMITTED_GROUPBY
    const groupby = Object.keys(
      resultFromParent?.parsed?.table?.columns || {}
    ).filter(columnName => !excludeFromGroupby.includes(columnName))
    setViewOptionsAll({groupby})
    const defaultsWhichExist = defaultViewOptions.groupby.filter(defaultGroup =>
      groupby.includes(defaultGroup)
    )
    selectViewOptions({groupby: defaultsWhichExist})
  }, [resultFromParent, defaultViewOptions])

  return (
    <ResultsViewContext.Provider
      value={{
        view,
        viewOptions: viewOptionsAll,
        selectedViewOptions,

        setView,
        setDefaultViewOptions,
        selectViewOptions,
      }}
    >
      {children}
    </ResultsViewContext.Provider>
  )
}
