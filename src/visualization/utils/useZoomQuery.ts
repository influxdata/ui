// Libraries
import {useContext} from 'react'

// Context
import {PipeContext} from 'src/flows/context/pipe'
import {FlowQueryContext} from 'src/flows/context/flow.query'
import {PersistanceContext} from 'src/dataExplorer/context/persistance'

export const useZoomQuery = (properties): string => {
  const {query} = useContext(PersistanceContext)
  const {id} = useContext(PipeContext)
  const {getPanelQueries} = useContext(FlowQueryContext)
  const queryTextFromProperties = properties?.queries?.[0]?.text ?? ''

  console.log('Pipe id:', id)
  console.log('queryTextFromProperties:', queryTextFromProperties)
  console.log('persistance query:', query)

  let zoomQuery = ''

  if (id) {
    zoomQuery = getPanelQueries(id)?.visual ?? ''
  } else if (queryTextFromProperties) {
    zoomQuery = queryTextFromProperties
  } else {
    zoomQuery = query
  }

  return zoomQuery
}
