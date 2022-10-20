// Libraries
import {useContext} from 'react'
import {useSelector} from 'react-redux'

// Types
import {DashboardQuery} from 'src/types'

// Context
import {PipeContext} from 'src/flows/context/pipe'
import {FlowQueryContext} from 'src/flows/context/flow.query'
import {PersistanceContext} from 'src/dataExplorer/context/persistance'

// Selector
import {getActiveQueryIndex} from 'src/timeMachine/selectors'

interface ZoomQueries {
  activeQueryIndex: number
  queries: string[]
}

export const useZoomQuery = (queries: DashboardQuery[] = []): ZoomQueries => {
  const activeQueryIndex = useSelector(getActiveQueryIndex)
  const {query} = useContext(PersistanceContext)
  const {id} = useContext(PipeContext)
  const {getPanelQueries} = useContext(FlowQueryContext)
  const queryTexts = queries.map(query => `${query.text}`) ?? ['']

  if (id) {
    // Notebooks
    return {
      activeQueryIndex: 0,
      queries: [getPanelQueries(id)?.visual ?? ''],
    }
  }
  if (queryTexts) {
    // Old Data Explorer & Dashboard Cells
    return {
      activeQueryIndex,
      queries: queryTexts,
    }
  }
  // New Data Explorer
  return {
    activeQueryIndex: 0,
    queries: [query],
  }
}
