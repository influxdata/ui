import React, {FC, useState} from 'react'

// Components
import {ToggleWithLabelTooltip} from 'src/dataExplorer/components/ToggleWithLabelTooltip'

// Styles
import './Sidebar.scss'

const AGGREGATE_TOOLTIP = `test`

const Aggregate: FC = () => {
  const [aggregate, setAggregate] = useState(false)

  return (
    <ToggleWithLabelTooltip
      label="Aggregate"
      active={aggregate}
      onChange={() => setAggregate(current => !current)}
      tooltipContents={AGGREGATE_TOOLTIP}
    />
  )
}

export {Aggregate}
