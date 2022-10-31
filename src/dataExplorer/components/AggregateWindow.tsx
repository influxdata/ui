import React, {FC, useState} from 'react'

// Components
import {ToggleWithLabelTooltip} from 'src/dataExplorer/components/ToggleWithLabelTooltip'

// Styles
import './Sidebar.scss'

const AGGREGATE_TOOLTIP = `test`

const AggregateWindow: FC = () => {
  const [aggregateWindow, setAggregateWindow] = useState(false)

  return (
    <ToggleWithLabelTooltip
      label="Aggregate"
      active={aggregateWindow}
      onChange={() => setAggregateWindow(current => !current)}
      tooltipContents={AGGREGATE_TOOLTIP}
    />
  )
}

export {AggregateWindow}
