import React, {FC, createContext, useCallback} from 'react'

import {useSessionStorage} from 'src/dataExplorer/shared/utils'
import {ViewProperties, SimpleTableViewProperties} from 'src/types'
import {SUPPORTED_VISUALIZATIONS} from 'src/visualization'

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
  setViewOptions: (viewOptions: Partial<ViewOptions>) => void
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
  setViewOptions: _ => {},
  selectViewOptions: _ => {},
}

export const ResultsViewContext =
  createContext<ResultsViewContextType>(DEFAULT_STATE)

export const ResultsViewProvider: FC = ({children}) => {
  const [view, setView] = useSessionStorage('dataExplorer.results', {
    state: ViewStateType.Table,
    properties: {
      type: 'simple-table',
      showAll: false,
    } as SimpleTableViewProperties,
  })

  // what can be chosen (e.g. the list of all options)
  const [viewOptions, saveViewOptions] = useSessionStorage(
    'dataExplorer.resultsOptions.all',
    DEFAULT_VIEW_OPTIONS
  )
  const setViewOptions = useCallback(
    (updatedOptions: Partial<ViewOptions>) => {
      saveViewOptions({...viewOptions, ...updatedOptions})
    },
    [viewOptions]
  )

  // what was chosen (e.g. sublist chosen)
  const [selectedViewOptions, saveSelectedViewOptions] = useSessionStorage(
    'dataExplorer.resultsOptions',
    DEFAULT_VIEW_OPTIONS
  )
  const selectViewOptions = useCallback(
    (updatedOptions: Partial<ViewOptions>) => {
      saveSelectedViewOptions({...viewOptions, ...updatedOptions})
    },
    [viewOptions]
  )

  return (
    <ResultsViewContext.Provider
      value={{
        view,
        viewOptions,
        selectedViewOptions,

        setView,
        setViewOptions,
        selectViewOptions,
      }}
    >
      {children}
    </ResultsViewContext.Provider>
  )
}
