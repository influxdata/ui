import {useContext, useEffect} from 'react'

// Components
import {FlowQueryContext} from 'src/flows/context/flow.query'

const FlowKeyboardPreview = () => {
  const {queryAll} = useContext(FlowQueryContext)

  const runPreview = event => {
    if (event.key === 'Enter' && event.ctrlKey) {
      queryAll()
    }
  }

  useEffect(() => {
    window.addEventListener('keypress', runPreview)
    return () => window.removeEventListener('keypress', runPreview)
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  return null
}

export default FlowKeyboardPreview
