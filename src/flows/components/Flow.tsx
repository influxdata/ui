import React from 'react'

// Components
import PipeList from 'src/flows/components/PipeList'
import {RefProvider} from 'src/flows/context/refs'
import {PopupDrawer, PopupProvider} from 'src/flows/context/popup'

// NOTE: requires a FlowProvider and ResultsProvider
const Flow = () => (
  <RefProvider>
    <PopupProvider>
      <PipeList />
      <PopupDrawer />
    </PopupProvider>
  </RefProvider>
)

export default Flow
