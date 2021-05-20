import {useContext, useEffect} from 'react'

// Components
import {RunMode, RunModeContext} from 'src/flows/context/runMode'
import {FlowQueryContext} from 'src/flows/context/flow.query'

const FlowKeyboardPreview = () => {
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

  useEffect(() => {
    window.addEventListener('keypress', runPreview)
    return () => window.removeEventListener('keypress', runPreview)
  }, [])

  return null
}

export default FlowKeyboardPreview
