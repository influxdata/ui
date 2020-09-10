// Libraries
import React, {FC, useContext} from 'react'
import {useSelector} from 'react-redux'

// Contexts
import {NotebookContext} from 'src/notebooks/context/notebook.current'
import {RefContext} from 'src/notebooks/context/refs'
import {ScrollContext} from 'src/notebooks/context/scroll'

// Components
import {DapperScrollbars} from '@influxdata/clockface'
import MiniMapToggle from 'src/notebooks/components/minimap/MiniMapToggle'
import MiniMapItem from 'src/notebooks/components/minimap/MiniMapItem'
import {FeatureFlag} from 'src/shared/utils/featureFlag'

// Types
import {AppState, NotebookMiniMapState} from 'src/types'

// Styles
import 'src/notebooks/components/minimap/MiniMap.scss'

const MiniMap: FC = () => {
  const {notebook} = useContext(NotebookContext)
  const refs = useContext(RefContext)
  const {scrollToPipe} = useContext(ScrollContext)
  const toggleState: NotebookMiniMapState = useSelector(
    (state: AppState) => state.app.persisted.notebookMiniMapState
  )

  if (toggleState === 'collapsed') {
    return (
      <FeatureFlag name="notebook-move-cells">
        <div className="notebook-minimap__collapsed">
          <MiniMapToggle />
        </div>
      </FeatureFlag>
    )
  }

  const pipes = notebook.data.allIDs.map(id => {
    const {title, visible} = notebook.meta.get(id)
    const {panel, focus} = refs.get(id)

    return (
      <MiniMapItem
        key={`minimap-${id}`}
        title={title}
        focus={focus}
        visible={visible}
        onClick={() => {
          scrollToPipe(panel)
          refs.update(id, {focus: true})
        }}
      />
    )
  })

  return (
    <FeatureFlag name="notebook-move-cells">
      <div className="notebook-minimap">
        <MiniMapToggle />
        <DapperScrollbars className="notebook-minimap--scroll" autoHide={true}>
          <div className="notebook-minimap--list">{pipes}</div>
        </DapperScrollbars>
      </div>
    </FeatureFlag>
  )
}

export default MiniMap
