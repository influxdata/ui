import React, {FC} from 'react'

// Components
import FluxBrowser from 'src/dataExplorer/components/FluxBrowser'

// Utils
import './SidePane.scss'

const SidePane: FC = () => {
  return (
    <div className="container-right-side-bar">
      <FluxBrowser />
    </div>
  )
}

export default SidePane
