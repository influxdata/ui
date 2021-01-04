import React from 'react'

// Components
import PipeList from 'src/flows/components/PipeList'
import QueryProvider from 'src/flows/context/query'
import {RefProvider} from 'src/flows/context/refs'
import {PopupDrawer, PopupProvider} from 'src/flows/context/popup'

// NOTE: requires a FlowProvider and ResultsProvider
const Flow = () => (
  <QueryProvider>
    <RefProvider>
      <PopupProvider>
        <PipeList />
        <PopupDrawer />
      </PopupProvider>
    </RefProvider>
  </QueryProvider>
)

export default Flow
