import React, {FC, createContext} from 'react'

import {useSessionStorage} from 'src/dataExplorer/shared/utils'
import {ViewProperties, SimpleTableViewProperties} from 'src/types'
import {SUPPORTED_VISUALIZATIONS} from 'src/visualization'

interface View {
  state: 'table' | 'graph'
  properties: ViewProperties
}

interface ResultsViewContextType {
  view: View

  setView: (view: View) => void
}

const DEFAULT_STATE: ResultsViewContextType = {
  view: {
    state: 'table',
    properties: SUPPORTED_VISUALIZATIONS['xy'].initial,
  },

  setView: _ => {},
}

export const ResultsViewContext =
  createContext<ResultsViewContextType>(DEFAULT_STATE)

export const ResultsViewProvider: FC = ({children}) => {
  const [view, setView] = useSessionStorage('dataExplorer.results', {
    state: 'table',
    properties: {
      type: 'simple-table',
      showAll: false,
    } as SimpleTableViewProperties,
  })

  return (
    <ResultsViewContext.Provider
      value={{
        view,

        setView,
      }}
    >
      {children}
    </ResultsViewContext.Provider>
  )
}
