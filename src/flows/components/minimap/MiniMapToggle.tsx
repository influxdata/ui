// Libraries
import React, {FC} from 'react'
import {connect, ConnectedProps} from 'react-redux'

// Components
import {Icon, IconFont} from '@influxdata/clockface'

// Actions
import {setFlowMiniMapState} from 'src/shared/actions/app'

// Utils
import {event} from 'src/cloud/utils/reporting'

// Types
import {AppState} from 'src/types'

type ReduxProps = ConnectedProps<typeof connector>
type Props = ReduxProps

const MiniMapToggle: FC<Props> = ({
  flowMiniMapState,
  handleSetFlowMiniMapState,
}) => {
  const active = flowMiniMapState === 'expanded'

  const handleChange = (): void => {
    event('Flow Toggled Table of Contents', {
      state: active ? 'collapsed' : 'expanded',
    })

    if (active) {
      handleSetFlowMiniMapState('collapsed')
    } else {
      handleSetFlowMiniMapState('expanded')
    }
  }

  const glyph = active ? IconFont.Minimize : IconFont.Maximize
  const title = active
    ? 'Click to minimize Table of Contents'
    : 'Click to maximize Table of Contents'

  const headerClassName = `flow-minimap--header flows-toc-${
    active ? 'collapse' : 'expand'
  }`

  return (
    <button className={headerClassName} onClick={handleChange} title={title}>
      {active && <h6 className="flow-minimap--title">Table of Contents</h6>}
      <Icon className="flow-minimap--icon" glyph={glyph} />
    </button>
  )
}

const mstp = (state: AppState) => {
  const {
    app: {
      persisted: {flowMiniMapState},
    },
  } = state

  return {
    flowMiniMapState,
  }
}

const mdtp = {
  handleSetFlowMiniMapState: setFlowMiniMapState,
}

const connector = connect(mstp, mdtp)

export default connector(MiniMapToggle)
