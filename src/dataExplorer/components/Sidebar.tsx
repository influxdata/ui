import React, {FC, useContext} from 'react'
import {DapperScrollbars} from '@influxdata/clockface'

// Components
import FluxBrowser from 'src/dataExplorer/components/FluxBrowser'
import {SidebarContext} from 'src/dataExplorer/context/sidebar'

// Utils
import './Sidebar.scss'

const Sidebar: FC = () => {
  const {visible, menu, clear} = useContext(SidebarContext)

  if (!visible && !menu) {
    return null
  }

  if (menu) {
    return (
      <div className="container-right-side-bar">
        <div className="flux-builder-sidebar--buttons">
          <button
            className="cf-overlay--dismiss"
            type="button"
            onClick={() => {
              clear()
            }}
          />
        </div>
        <div className="flux-builder-sidebar--menu">
          <DapperScrollbars
            noScrollX={true}
            thumbStopColor="gray"
            thumbStartColor="gray"
          >
            <div className="flux-builder-sidebar--menu-wrapper">{menu}</div>
          </DapperScrollbars>
        </div>
      </div>
    )
  }

  return (
    <div className="container-right-side-bar">
      <FluxBrowser />
    </div>
  )
}

export default Sidebar
