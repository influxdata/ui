// Libraries
import {useContext} from 'react'
import {useSelector} from 'react-redux'

// Types
import {DashboardQuery} from 'src/types'

// Context
import {PipeContext} from 'src/flows/context/pipe'
import {FlowQueryContext} from 'src/flows/context/flow.query'
import {
  DEFAULT_FLUX_EDITOR_TEXT,
  PersistenceContext,
} from 'src/dataExplorer/context/persistence'

// Selector
import {getActiveQueryIndex} from 'src/timeMachine/selectors'

interface ZoomQueries {
  activeQueryIndex: number
  queries: string[]
}

export const useZoomQuery = (queries: DashboardQuery[] = []): ZoomQueries => {
  const activeQueryIndex = useSelector(getActiveQueryIndex)
  const {query} = useContext(PersistenceContext)
  const {id} = useContext(PipeContext)
  const {getPanelQueries} = useContext(FlowQueryContext)
  const queryTexts = queries.map(query => `${query.text}`)
  const isQueryTextsEmpty =
    queryTexts.length === 0 ||
    queryTexts.every(query => query.trim().length === 0)

  // Notebooks
  if (id) {
    return {
      activeQueryIndex: 0,
      queries: [getPanelQueries(id)?.visual ?? ''],
    }
  }

  // Old Data Explorer & Dashboard Cells
  if (!isQueryTextsEmpty) {
    return {
      activeQueryIndex,
      queries: queryTexts,
    }
  }

  // New Data Explorer
  if (query.trim() !== DEFAULT_FLUX_EDITOR_TEXT) {
    return {
      activeQueryIndex: 0,
      queries: [query],
    }
  }

  // Default - no queries found
  return {
    activeQueryIndex: -1,
    queries: [],
  }
}
