import React, {FC, createContext} from 'react'

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

export interface ViewOptions {}

interface ResultsViewContextType {
  view: View
  viewOptions: ViewOptions

  setView: (view: View) => void
  setViewOptions: (viewOptions: Object) => void
}

const DEFAULT_STATE: ResultsViewContextType = {
  view: {
    state: ViewStateType.Table,
    properties: SUPPORTED_VISUALIZATIONS['xy'].initial,
  },
  viewOptions: {}, // TODO -- set default options. Such as all tagKeys for `|> group()`

  setView: _ => {},
  setViewOptions: _ => {},
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

  const [viewOptions, setViewOptions] = useSessionStorage(
    'dataExplorer.resultsOptions',
    {}
  )

  return (
    <ResultsViewContext.Provider
      value={{
        view,
        viewOptions,

        setView,
        setViewOptions,
      }}
    >
      {children}
    </ResultsViewContext.Provider>
  )
}
