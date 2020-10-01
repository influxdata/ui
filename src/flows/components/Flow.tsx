// Libraries
import React, {FC, useContext, useEffect} from 'react'
import {useParams} from 'react-router-dom'

// Components
import {ResultsProvider} from 'src/flows/context/results'
import {RefProvider} from 'src/flows/context/refs'
import CurrentFlowProvider, {FlowContext} from 'src/flows/context/flow.current'
import {ScrollProvider} from 'src/flows/context/scroll'
import FlowPage from 'src/flows/components/FlowPage'

const FlowFromRoute = () => {
  const {id} = useParams()
  const {change} = useContext(FlowContext)

  useEffect(() => {
    change(id)
  }, [id, change])

  return null
}
// NOTE: uncommon, but using this to scope the project
// within the page and not bleed it's dependencies outside
// of the feature flag
import 'src/flows/style.scss'

const FlowContainer: FC = () => {
  return (
    <CurrentFlowProvider>
      <FlowFromRoute />
      <ResultsProvider>
        <RefProvider>
          <ScrollProvider>
            <FlowPage />
          </ScrollProvider>
        </RefProvider>
      </ResultsProvider>
    </CurrentFlowProvider>
  )
}

export default FlowContainer
