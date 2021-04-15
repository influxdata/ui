import React, {useContext} from 'react'

// Components
import PipeList from 'src/flows/components/PipeList'
import {PopupDrawer, PopupProvider} from 'src/flows/context/popup'
import {RunMode, RunModeContext} from 'src/flows/context/runMode'
import {FlowQueryContext} from 'src/flows/context/flow.query'

// NOTE: requires a FlowProvider and ResultsProvider
const Flow = () => {
  const {runMode, setRunMode} = useContext(RunModeContext)
  const {queryAll} = useContext(FlowQueryContext)

  const runPreview = event => {
    if (event.key === 'Enter' && event.ctrlKey) {
      if (runMode === RunMode.Preview) {
        queryAll()
      } else {
        setRunMode(RunMode.Preview)
        queryAll()
        setRunMode(RunMode.Run)
      }
    }
  }

  React.useEffect(() => {
    window.addEventListener('keypress', runPreview)
    return () => window.removeEventListener('keypress', runPreview)
  }, [])

  return (
    <PopupProvider>
      <PipeList />
      <PopupDrawer />
    </PopupProvider>
  )
}

export default Flow
