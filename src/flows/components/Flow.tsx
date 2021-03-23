import React from 'react'

// Components
import PipeList from 'src/flows/components/PipeList'
import {PopupDrawer, PopupProvider} from 'src/flows/context/popup'

// NOTE: requires a FlowProvider and ResultsProvider
const Flow = () => (
    <PopupProvider>
        <PipeList />
        <PopupDrawer />
    </PopupProvider>
)

export default Flow
