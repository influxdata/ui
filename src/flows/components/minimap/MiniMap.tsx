// Libraries
import React, {FC, useContext} from 'react'
import {useSelector} from 'react-redux'

// Contexts
import {FlowContext} from 'src/flows/context/flow.current'
import {RefContext} from 'src/flows/context/refs'
import {ScrollContext} from 'src/flows/context/scroll'

// Components
import {DapperScrollbars} from '@influxdata/clockface'
import MiniMapToggle from 'src/flows/components/minimap/MiniMapToggle'
import MiniMapItem from 'src/flows/components/minimap/MiniMapItem'
import {FeatureFlag} from 'src/shared/utils/featureFlag'

// Types
import {AppState, FlowMiniMapState} from 'src/types'

// Styles
import 'src/flows/components/minimap/MiniMap.scss'

const MiniMap: FC = () => {
  const {flow} = useContext(FlowContext)
  const refs = useContext(RefContext)
  const {scrollToPipe} = useContext(ScrollContext)
  const toggleState: FlowMiniMapState = useSelector(
    (state: AppState) => state.app.persisted.flowMiniMapState
  )

  if (toggleState === 'collapsed') {
    return (
      <FeatureFlag name="flow-move-cells">
        <div className="flow-minimap__collapsed">
          <MiniMapToggle />
        </div>
      </FeatureFlag>
    )
  }

  const pipes = flow.data.allIDs.map(id => {
    const {title, visible} = flow.meta.get(id)
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
    <FeatureFlag name="flow-move-cells">
      <div className="flow-minimap">
        <MiniMapToggle />
        <DapperScrollbars className="flow-minimap--scroll" autoHide={true}>
          <div className="flow-minimap--list">{pipes}</div>
        </DapperScrollbars>
      </div>
    </FeatureFlag>
  )
}

export default MiniMap
